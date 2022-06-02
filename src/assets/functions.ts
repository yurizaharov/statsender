import initialData from "../data";

const dayMilliseconds = 24*60*60*1000;

const functions = {

    async getInitialData() {
        return initialData;
    },

    datesToSave() {
        const currentDate = new Date();
        currentDate.setTime(currentDate.getTime() - dayMilliseconds);
        const yearToSave = currentDate.getFullYear();
        const dateToSave = currentDate.toLocaleDateString('ru');
        const quarterToSave = Math.floor((currentDate.getMonth() + 3) / 3);
        return [yearToSave, dateToSave, quarterToSave];
    },

    datesToRead() {
        let quartersToRead: number[] = [];
        const currentDate = new Date();
        currentDate.setTime(currentDate.getTime() - dayMilliseconds);
        const yearToRead = currentDate.getFullYear();
        const dateToRead = currentDate.toLocaleDateString('ru');
        const quarterToRead = Math.floor((currentDate.getMonth() + 3) / 3);
        for (let k = 1; k <= 4; k++) {
            if (quarterToRead - k <= 0) {
                let Q = quarterToRead - k + 4;
                let Y = yearToRead - 1;
                quartersToRead[Q] = Y;
            } else {
                let Q = quarterToRead - k;
                let Y = yearToRead;
                quartersToRead[Q] = Y;
            }
        }
        return [dateToRead, quartersToRead];
    },

    quarterDays() {
        const currentDate: Date = new Date();
        currentDate.setHours(3,0, 0, 0)
        currentDate.setTime(currentDate.getTime() - dayMilliseconds);
        let month: number = currentDate.getMonth();
        const quarterStart: Date = new Date(currentDate);
        const quarterEnd: Date = new Date(currentDate);
        quarterStart.setMonth(month - month % 3, 1);
        quarterEnd.setMonth(month - month % 3 + 3, 1);
        // @ts-ignore
        let quarterAll = quarterEnd - quarterStart;
        // @ts-ignore
        let quarterCurrent = currentDate - quarterStart;
        let quarterAllDays = Math.ceil(quarterAll / dayMilliseconds);
        let quarterCurrentDay = Math.ceil(quarterCurrent / dayMilliseconds) + 1;
        return [quarterAllDays, quarterCurrentDay];
    },

    summary(array: number[]) {
        let feeSummary = array.reduce(function(sum:number, current:number) {
            return sum + current;
        }, 0);
        return feeSummary;
    },

    meanStatsCounter(statsDataQuarterly: any) {
        let meanStats = {
            'name': 'none',
            'allSummary': 0,
            'orgSummary': 0,
            'smsSummary': 0
        };
        if (statsDataQuarterly.length !== 0) {
            statsDataQuarterly.forEach( (stats: any) => {
                meanStats.allSummary += stats.allSummary;
                meanStats.orgSummary += stats.orgSummary;
                meanStats.smsSummary += stats.smsSummary;
            });
            meanStats.allSummary /= statsDataQuarterly.length;
            meanStats.orgSummary /= statsDataQuarterly.length;
            meanStats.smsSummary /= statsDataQuarterly.length;
            meanStats.name = statsDataQuarterly[0].name;
        }
        return meanStats;
    },

    meanTotalCounter(totalDataQuarterly: any) {
        let meanTotal = {
            'name': 'none',
            'totalSummary': 0
        };
        if (totalDataQuarterly.length !== 0) {
            totalDataQuarterly.forEach((stats: any) => {
                meanTotal.totalSummary += stats.totalSummary;
            });
            meanTotal.totalSummary /= totalDataQuarterly.length;
            meanTotal.name = 'total';
        }
        return meanTotal;
    },

    vsAPQCount(statsData: any, meanStats: any) {
        let allSummary: number = 0;
        let orgSummary: number = 0;
        let smsSummary : number = 0;
        let vsAP4Q = {
            'allSummary': '0,00',
            'orgSummary': '0,00',
            'smsSummary': '0,00'
        };

        if (meanStats.allSummary !== 0) {
            allSummary = (statsData.allSummary*100/meanStats.allSummary-100);
        }
        if (meanStats.orgSummary !== 0) {
            orgSummary = (statsData.orgSummary*100/meanStats.orgSummary-100);
        }
        if (meanStats.smsSummary !== 0) {
            smsSummary = (statsData.smsSummary*100/meanStats.smsSummary-100);
        }

        if (allSummary > 0) {
            vsAP4Q.allSummary = '+' + allSummary.toFixed(2).toString() + '%';
        } else {
            vsAP4Q.allSummary = allSummary.toFixed(2).toString() + '%';
        }
        if (orgSummary > 0) {
            vsAP4Q.orgSummary = '+' + orgSummary.toFixed(2).toString() + '%';
        } else {
            vsAP4Q.orgSummary = orgSummary.toFixed(2).toString() + '%';
        }
        if (smsSummary > 0) {
            vsAP4Q.smsSummary = '+' + smsSummary.toFixed(2).toString() + '%';
        } else {
            vsAP4Q.smsSummary = smsSummary.toFixed(2).toString() + '%';
        }

        return vsAP4Q;
    },

    vsAPQ4TotalCount(totalData: any, meanTotal: any) {
        let totalSummary: number = 0;
        let vsAP4QTotal = {
            'totalSummary': '0,00'
        };
        if (meanTotal.totalSummary !== 0) {
            totalSummary = totalData.totalSummary*100/meanTotal.totalSummary-100;
        }
        if (totalSummary > 0) {
            vsAP4QTotal.totalSummary = '+' + totalSummary.toFixed(2).toString() + '%';
        } else {
            vsAP4QTotal.totalSummary = totalSummary.toFixed(2).toString() + '%';
        }

        return vsAP4QTotal;
    },

    pcQCount(quarterAllDays: number, quarterCurrentDay: number, statsData: any, meanStats: any) {
        let allSummary: number = 0;
        let orgSummary: number = 0;
        let smsSummary : number = 0;
        let PCQ = {
            'allSummary': '0,00',
            'orgSummary': '0,00',
            'smsSummary': '0,00'
        };
        if (meanStats.allSummary !== 0) {
            allSummary = (statsData.allSummary*quarterAllDays/quarterCurrentDay*100/meanStats.allSummary-100);
        }
        if (meanStats.orgSummary !== 0) {
            orgSummary = (statsData.orgSummary*quarterAllDays/quarterCurrentDay*100/meanStats.orgSummary-100);
        }
        if (meanStats.smsSummary !== 0) {
            smsSummary = (statsData.smsSummary*quarterAllDays/quarterCurrentDay*100/meanStats.smsSummary-100);
        }
        if (allSummary > 0) {
            PCQ.allSummary = '+' + allSummary.toFixed(2).toString() + '%';
        } else {
            PCQ.allSummary = allSummary.toFixed(2).toString() + '%';
        }
        if (orgSummary > 0) {
            PCQ.orgSummary = '+' + orgSummary.toFixed(2).toString() + '%';
        } else {
            PCQ.orgSummary = orgSummary.toFixed(2).toString() + '%';
        }
        if (smsSummary > 0) {
            PCQ.smsSummary = '+' + smsSummary.toFixed(2).toString() + '%';
        } else {
            PCQ.smsSummary = smsSummary.toFixed(2).toString() + '%';
        }

        return PCQ;
    },

    pcqTotalCount(quarterAllDays: number, quarterCurrentDay: number, totalData: any, meanTotal: any) {
        let totalSummary: number = 0;
        let PCQTotal = {
            'totalSummary': '0,00'
        };
        if (meanTotal.totalSummary !== 0) {
            totalSummary = (totalData.totalSummary*quarterAllDays/quarterCurrentDay*100/meanTotal.totalSummary-100);
        }
        if (totalSummary > 0) {
            PCQTotal.totalSummary = '+' + totalSummary.toFixed(2).toString() + '%';
        } else {
            PCQTotal.totalSummary = totalSummary.toFixed(2).toString() + '%';
        }

        return PCQTotal;
    },

    stringGenerator(name: string, value1: string, value2: string, value3: string, stringLength: any) {
        let result;
        let space1 = '';
        let space2 = '';
        let space3 = '';
        let k1 = stringLength[0] - name.length - value1.length;
        let k2 = stringLength[1] - value2.length;
        let k3 = stringLength[2] - value3.length;

        for (let i = 0; i < k1; i++) {
            space1 += ' ';
        }

        for (let i = 0; i < k2; i++) {
            space2 += ' ';
        }

        for (let i = 0; i < k3; i++) {
            space3 += ' ';
        }

        result = name + space1 + value1 + space2 + value2 + space3 + value3;
        return result;

    }

}

export default functions;