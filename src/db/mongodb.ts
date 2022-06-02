import mongoose from "mongoose";

// Setting variables
//const statsMongoAdr:string = process.env.MONGO_ADDR || 'localhost'
const statsMongoAdr:string = process.env.MONGO_ADDR || '192.168.4.231'
const statsMongoDBS:string = process.env.MONGO_DBS || 'statisticsDB'

// Setting instance parameters
const statsDataUri:string = 'mongodb://' + statsMongoAdr + '/' + statsMongoDBS;
console.log('MongoDB address set to:', statsDataUri);

// Setting mongoose parameters
const options:any = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    autoIndex: false, // Don't build indexes
    poolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 10000, // Close sockets after 10 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
};

const statsConn = mongoose.createConnection(statsDataUri, options);

export default statsConn;
