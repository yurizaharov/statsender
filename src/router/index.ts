import {NextFunction,Request,Response,Router} from "express";
import client from "prom-client";
import methods from "../assets/methods";
import logger from "../common/logger"

const appRouter = Router();

const register = new client.Registry();

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register });

appRouter
    .use(function timeLog(req:Request, res:Response, next:NextFunction):void {
        if(req.url !== "/ping") {
            // @ts-ignore
            logger.info('%s - %s', req.socket.remoteAddress.split(':')[3], req.url)
        }
        next();
    })

    .get('/ping', async (req:Request, res:Response) => {
        const result = await methods.healthCheck('statSender')
        res
            .status(200)
            .send(result)
    })

    .get('/metrics', async (req, res) => {
        res
            .setHeader('Content-Type', register.contentType)
            .send(await register.metrics());
    })

export default appRouter;