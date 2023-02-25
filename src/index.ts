import express, {Application} from "express";
import {CronJob} from "cron";
import router from "./router";
import methods from "./assets/methods";
import logger from "./common/logger"

const app:Application = express();
const appName: string = 'statSender';

app.use(router);

app.listen(8080, ():void => {
    methods.onStartApp(appName);
    logger.info('Server has been started');
});

let getJob = new CronJob('0 0 2 * * *', function() {
    methods.getStatsData();
    }, null, true, 'Europe/Moscow');
getJob.start();

let sendAll = new CronJob('0 0 10 * * *', function() {
    methods.sendStatsData();
    }, null, true, 'Europe/Moscow');
sendAll.start();
