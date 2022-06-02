import {NextFunction,Request,Response,Router} from "express";

const appRouter = Router();

appRouter
    .use(function timeLog(req:Request, res:Response, next:NextFunction):void {
        if(req.url !== "/ping") {
            // @ts-ignore
            console.log(new Date().toLocaleString('ru-RU'), '-', req.socket.remoteAddress.split(':')[3], '-', req.url)
        }
        next();
    })

    .get('/ping', (req:Request, res:Response):void => {
        res
            .status(200)
            .send('StatSender')
    })

export default appRouter;
