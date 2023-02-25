import pino from "pino";

const logger = pino({
    formatters: {
        level: (label) => {
            return {
                level: label
            }
        }
    },
    timestamp: pino.stdTimeFunctions.isoTime
})

export default logger;