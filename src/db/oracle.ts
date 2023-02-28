import fs from "fs";
import oracledb from "oracledb";
import logger from "../common/logger";

const oracle = {

    sqlRequest: async function (partner: any) {
        let connection;
        const sqlQuery = fs.readFileSync('./dist/db/sql/quartercurrent.sql').toString();
        try {
            let binds, options, result;

            connection = await oracledb.getConnection(partner);

            binds = {};
            options = {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            };

            result = await connection.execute(sqlQuery, binds, options);
            return {
                'name': partner.dataBase,
                'data': result.rows
            };

        } catch (err) {
            logger.error(err);
            return {
                'name': partner.name,
                'data': ''
            };
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    logger.error(err);
                }
            }
        }
    }
}

export default oracle;