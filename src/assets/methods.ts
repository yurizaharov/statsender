import {Telegraf} from "telegraf";
import functions from "./functions";
import queries from "./queries";
import oracle from "../db/oracle"

const chatID: string = process.env.CHAT_ID;
const botToken: string = process.env.BOT_TOKEN;
const bot = new Telegraf(botToken);

const methods = {

    async getStatsData() {
        const initialData = await functions.getInitialData();
        const [yearToSave, dateToSave, quarterToSave] = functions.datesToSave();
        let allFeeArr: number[] = [];

        for (const partner of initialData) {
            const sqlData = await oracle.sqlRequest(partner);
            let smsFeeArr: number[] = [];
            let orgFeeArr: number[] = [];
            // @ts-ignore
            sqlData.data.forEach( (retailPoint:any) => {
                smsFeeArr.push(retailPoint.SMS_FEE);
                orgFeeArr.push(retailPoint.ORG_FEE);
            });
            let smsFeeSummary:number = Math.round(functions.summary(smsFeeArr));
            let orgFeeSummary:number = Math.round(functions.summary(orgFeeArr));
            let allFeeSummary:number = smsFeeSummary + orgFeeSummary;

            allFeeArr.push(allFeeSummary);

            const statsData:any = {
                "date" : dateToSave,
                "year" : yearToSave,
                "quarter" : quarterToSave,
                "name" : partner.dataBase,
                "smsSummary" : smsFeeSummary,
                "orgSummary" : orgFeeSummary,
                "allSummary" : allFeeSummary
            };

            await queries.storeStats(statsData, partner.dataBase);
            await queries.storeStatsQuarterly(statsData, partner.dataBase);
        }

        let totalFeeSummary:number = functions.summary(allFeeArr);

        const totalData:any = {
            "date" : dateToSave,
            "year" : yearToSave,
            "quarter" : quarterToSave,
            "totalSummary" : totalFeeSummary
        }

        await queries.storeTotal(totalData);
        await queries.storeTotalQuarterly(totalData);
    },

    async sendStatsData() {
        const stringLength = [21, 9, 9];
        const initialData = await functions.getInitialData();
        const [dateToRead, quartersToRead] = functions.datesToRead();
        functions.quarterDays()
        const [quarterAllDays, quarterCurrentDay] = functions.quarterDays();
        let telegramMessage = '';
        let totalDataQuarterly = [];

        for (const partner of initialData) {
            let statsDataQuarterly = [];
            const statsData = await queries.readStats(partner.dataBase, dateToRead);

            for (let q = 1; q <= 4; q++) {
                const statsByQuarter = await queries.readStatsQuarterly(partner.dataBase, quartersToRead[q], q);
                if (statsByQuarter) {
                    statsDataQuarterly.push(statsByQuarter);
                }
            }

            const meanStats = functions.meanStatsCounter(statsDataQuarterly);
            const vsAP4Q = functions.vsAPQCount(statsData, meanStats);
            const PCQ = functions.pcQCount(quarterAllDays, quarterCurrentDay, statsData, meanStats);
            const string1 = functions.stringGenerator(
                statsData.name,
                statsData.allSummary.toLocaleString('ru-RU'),
                vsAP4Q.allSummary,
                PCQ.allSummary,
                stringLength);
            const string2 = functions.stringGenerator(
                'AccountFee',
                statsData.smsSummary.toLocaleString('ru-RU'),
                vsAP4Q.smsSummary,
                PCQ.smsSummary,
                stringLength);
            const string3 = functions.stringGenerator(
                'OrgFee',
                statsData.orgSummary.toLocaleString('ru-RU'),
                vsAP4Q.orgSummary,
                PCQ.orgSummary,
                stringLength);
            const string4 = functions.stringGenerator(
                'AcquiFee',
                '0',
                '0.00%',
                '0.00%',
                stringLength);

            telegramMessage += `\n${string1}\n${string2}\n${string3}\n${string4}\n`;
        }
        const totalData = await queries.readTotal(dateToRead);
        for (let q = 1; q <= 4; q++) {
            const totalByQuarter = await queries.readTotalQuarterly(quartersToRead[q], q);
            if (totalByQuarter) {
                totalDataQuarterly.push(totalByQuarter)
            }
        }
        const meanTotal = functions.meanTotalCounter(totalDataQuarterly);
        const vsAP4QTotal = functions.vsAPQ4TotalCount(totalData, meanTotal);
        const PCQTotal = functions.pcqTotalCount(quarterAllDays, quarterCurrentDay, totalData, meanTotal)

        const string00 = functions.stringGenerator(
            'Name',
            'CQ',
            'vsAP4Q',
            'PCQ',
            stringLength);
        const string01 = functions.stringGenerator(
            'Total',
            totalData.totalSummary.toLocaleString('ru-RU'),
            vsAP4QTotal.totalSummary,
            PCQTotal.totalSummary,
            stringLength);

        telegramMessage = '```' + `\n${string00}\n${string01}\n` + telegramMessage + '```' + '\n\\#growth';

        bot.telegram.sendMessage(chatID, telegramMessage, { parse_mode: "MarkdownV2" });
    }

}

export default methods;