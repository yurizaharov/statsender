import {NextFunction,Request,Response,Router} from "express";
import methods from "../assets/methods";

const appRouter = Router();

appRouter
    .use(function timeLog(req:Request, res:Response, next:NextFunction):void {
        if(req.url !== "/ping") {
            // @ts-ignore
            console.log(new Date().toLocaleString('ru-RU'), '-', req.socket.remoteAddress.split(':')[3], '-', req.url)
        }
        next();
    })

    .get('/ping', async (req:Request, res:Response) => {
        const result = await methods.healthCheck('statSender')
        res
            .status(200)
            .send(result)
    })

export default appRouter;
