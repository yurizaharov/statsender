import mongoose from "mongoose";
import statsConn from "../db/mongodb";
const Schema = mongoose.Schema;
import logger from "../common/logger";

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
        logger.info('Created new record for healthchecking of %s', name);
    },

    storeStats: async function (statsData: any, name: string) {
        const Stats = statsConn.model('Stats', statsSchema, name);
        let newRecord = new Stats(statsData);
        newRecord.save();
        logger.info('Saved new statistics: %s %s', name, statsData.date);
    },

    storeStatsQuarterly: async function (statsData: any, name: string) {
        const Quarterly = statsConn.model('Quarterly', statsSchema, 'quarterly');
        await Quarterly.findOneAndUpdate({
            'year': statsData.year,
            'quarter': statsData.quarter,
            'name': name
        }, statsData, {
            new: true,
            upsert: true
        });
        logger.info('Updated quarterly statistics: %s %s', name, statsData.date);
    },

    storeTotal: async function (totalData: any) {
        const Total = statsConn.model('Total', totalSchema, 'total');
        let newTotal = new Total(totalData);
        newTotal.save();
        logger.info('Saved total statistics: %s %d', totalData.date, totalData.totalSummary);
    },

    storeTotalQuarterly: async function (totalData: any) {
        const TotalQuarterly = statsConn.model('TotalQuarterly', totalSchema, 'quarterly');
        await TotalQuarterly.findOneAndUpdate({
            'year': totalData.year,
            'quarter': totalData.quarter,
            'name': 'total'
        }, totalData, {
            new: true,
            upsert: true
        });
        logger.info('Updated total statistics: %s %d', totalData.date, totalData.totalSummary);
    },

    readStats: async function (partner: string, dateToRead: string) {
        const statsRecord = statsConn.model('statsRecord', statsSchema, partner);
        const oneStatsRecord = statsRecord.findOne({
            'name': partner,
            'date': dateToRead
        });
        logger.info('Read data for %s %s', partner, dateToRead);
        return oneStatsRecord;
    },

    readStatsQuarterly: async function (partner: string, yearToRead: number, quarterToRead: number) {
        const StatsQuarterly = statsConn.model('StatsQuarterly', statsSchema, 'quarterly');
        const oneStatsQuarterly = StatsQuarterly.findOne({
            'name': partner,
            'year': yearToRead,
            'quarter': quarterToRead
        });
        logger.info('Read data for %s %d %d', partner, yearToRead, quarterToRead);
        return oneStatsQuarterly;
    },

    readTotal: async function (dateToRead: string) {
        const Total = statsConn.model('total', totalSchema, 'total');
        const totalData = Total.findOne({date: dateToRead});
        logger.info('Read total data for %s', dateToRead);
        return totalData;
    },

    readTotalQuarterly: async function (yearToRead: number, quarterToRead: number) {
        const TotalQuarterly = statsConn.model('total', totalSchema, 'quarterly');
        const statsTotalQuarterly = await TotalQuarterly.findOne({
            'name': 'total',
            'year': yearToRead,
            'quarter': quarterToRead
        });
        logger.info('Read total data for %d %d', yearToRead, quarterToRead);
        return statsTotalQuarterly;
    },

}

export default queries;