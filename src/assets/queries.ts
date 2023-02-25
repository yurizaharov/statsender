import mongoose from "mongoose";
import statsConn from "../db/mongodb"
const Schema = mongoose.Schema;

const statsSchema = new Schema({
    date : String,
    year : Number,
    quarter : Number,
    name : String,
    smsSummary : Number,
    orgSummary : Number,
    allSummary : Number
});

const totalSchema = new Schema({
    date : String,
    year : Number,
    quarter : Number,
    name : String,
    totalSummary : Number
});

const healthSchema = new Schema({
    appName : String
});

const queries = {

    healthCheck: async function (name: string) {
        const Check = statsConn.model('Check', healthSchema, 'healthcheck');
        return Check.findOne({'appName': name});
    },

    healthCheckCreate: async function (name: string) {
        const CheckCreate = statsConn.model('CheckCreate', healthSchema, 'healthcheck');
        await CheckCreate.findOneAndUpdate({
            'appName': name
        }, {
            'appName': name
        }, {
            new: true,
            upsert: true
        });
        console.log(new Date().toLocaleString('ru-RU'), '- Created new record for healthchecking of', name);
    },

    async storeStats(statsData:any, name:string) {
        const Stats = statsConn.model('Stats', statsSchema, name);
        let newRecord = new Stats(statsData);
        newRecord.save();
        console.log(new Date().toLocaleString('ru-RU'), '- Saved new statistics:', name, statsData.date);
    },

    async storeStatsQuarterly(statsData:any, name:string) {
        const Quarterly = statsConn.model('Quarterly', statsSchema, 'quarterly');
        await Quarterly.findOneAndUpdate({
            'year': statsData.year,
            'quarter': statsData.quarter,
            'name': name
        }, statsData, {
            new: true,
            upsert: true
        });
        console.log(new Date().toLocaleString('ru-RU'), '- Updated quarterly statistics:', name, statsData.date);
    },

    async storeTotal(totalData:any) {
        const Total = statsConn.model('Total', totalSchema, 'total');
        let newTotal = new Total(totalData);
        newTotal.save();
        console.log(new Date().toLocaleString('ru-RU'), '- Saved total statistics:', totalData.date, totalData.totalSummary);
    },

    async storeTotalQuarterly(totalData:any) {
        const TotalQuarterly = statsConn.model('TotalQuarterly', totalSchema, 'quarterly');
        await TotalQuarterly.findOneAndUpdate({
            'year': totalData.year,
            'quarter': totalData.quarter,
            'name': 'total'
        }, totalData, {
            new: true,
            upsert: true
        });
        console.log(new Date().toLocaleString('ru-RU'), '- Updated total statistics:', totalData.date, totalData.totalSummary);
    },

    async readStats(partner:string, dateToRead:any) {
        const statsRecord = statsConn.model('statsRecord', statsSchema, partner);
        const oneStatsRecord = statsRecord.findOne({
            'name': partner,
            'date': dateToRead
        });
        console.log(new Date().toLocaleString('ru-RU'), '- read data for', partner, dateToRead);
        return oneStatsRecord;
    },

    async readStatsQuarterly(partner:string, yearToRead:number|string, quarterToRead:number) {
        const StatsQuarterly = statsConn.model('StatsQuarterly', statsSchema, 'quarterly');
        const oneStatsQuarterly = StatsQuarterly.findOne({
            'name': partner,
            'year': yearToRead,
            'quarter': quarterToRead
        });
        console.log(new Date().toLocaleString('ru-RU'), '- read data for', partner, yearToRead, quarterToRead);
        return oneStatsQuarterly;
    },

    async readTotal(dateToRead:any) {
        const Total = statsConn.model('total', totalSchema, 'total');
        const totalData = Total.findOne({ date: dateToRead });
        console.log(new Date().toLocaleString('ru-RU'), '- read total data for', dateToRead);
        return totalData;
    },

    async readTotalQuarterly(yearToRead:number|string, quarterToRead:number) {
        const TotalQuarterly = statsConn.model('total', totalSchema, 'quarterly');
        const statsTotalQuarterly = await TotalQuarterly.findOne({
            'name': 'total',
            'year': yearToRead,
            'quarter': quarterToRead
        });
        console.log(new Date().toLocaleString('ru-RU'), '- read total data for', yearToRead, quarterToRead);
        return statsTotalQuarterly;
    },

}

export default queries;