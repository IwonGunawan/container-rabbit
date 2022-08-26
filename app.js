require("./utils/db")

const GLOBAL = require("./utils/global");
const amqp = require("amqplib/callback_api");
const Stock = require("./models/stock");

/* SETUP GRPC */
var PROTO_PATH = "./utils/stock.proto";
var grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");

var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase    : true, 
    longs       : String,
    enums       : String, 
    defaults    : true,
    oneofs      : true
});
var stock_proto = grpc.loadPackageDefinition(packageDefinition).stock;
/* END */


function main(){
    var server = new grpc.Server();
    server.addService(stock_proto.StockService.service, {setup : received});
    server.bindAsync(
        GLOBAL.grpc_port, 
        grpc.ServerCredentials.createInsecure(),
        (error, result) => {
            console.log("server running at port 50051")
            server.start();
        }
    )
}

function received(call, callback){
    const str = call.request.message;
    const obj = JSON.parse(str);
    insertLog(obj);
    sendToRabbit(obj);

    callback(null, {
        code    : 200,
        msg     : 'ok' 
    }); // optional, jika client membutuhkan callback
}

function insertLog(message){
    const add = new Stock({
        from        : message.from,
        process     : message.process,
        datetime    : message.datetime,
        status      : GLOBAL.sent_rabbit,
        payload     : message.payload
    })
    add.save().then((result) => {
        console.log(`[*] save -> before consumer`)
    })
}

function sendToRabbit(message) {
    amqp.connect("amqp://localhost", (error0, connect) => {
        if (error0) {
            console.log("rabbitMQ is OFF")
            //throw error0
        } else {
            connect.createChannel( async (error1, channel) => {
                if (error1) {
                    console.log("create channel rabbitMQ FAILED")
                    //throw error1
                }

                var queue = "stock_queue"
                channel.assertQueue(queue, {
                    durable: true
                })

                channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
                    persistent: true
                })
                console.log(`[*] sent to rabbit`);
                
                // remove data from mongoDB
                // await Stock.deleteOne({ datetime: iDate}).then(() => {
                //     console.log(`[*] deleted ${iDate}`)
                // })
            });
        }

        // setTimeout(() => {
        //     process.exit(1)
        // }, 500);
    });
}

main();



/*
id
from        : 
process     : create_order
status      : 0=sent rabbit, 1=received rabbit
payload     : {}


orderA-0
orderA-1
orderB-0
orderB-1
orderC-0 --> diproses ketika kapan ? bagaimana cara membedakan order yang udah diproses dan belum ?
*/

