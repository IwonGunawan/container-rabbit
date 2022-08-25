require("./utils/db")

var PROTO_PATH = "./utils/stock.proto";
var grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");
const amqp = require("amqplib/callback_api");
const Stock = require("./models/stock");

// SETUP GRPC 
var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase    : true, 
    longs       : String,
    enums       : String, 
    defaults    : true,
    oneofs      : true
});
var stock_proto = grpc.loadPackageDefinition(packageDefinition).stock;
// END


function main(){
    var server = new grpc.Server();
    server.addService(stock_proto.StockService.service, {setup : received});
    server.bindAsync(
        "127.0.0.1:50051", 
        grpc.ServerCredentials.createInsecure(),
        (error, result) => {
            console.log("server container-rabbit running at port 50051")
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
        gateway : message.gateway,
        datetime: message.datetime,
        data    : message.data
    })
    add.save().then((result) => {
        console.log("successfully save log to noSql")
    })
}

function sendToRabbit(message) {
    amqp.connect("amqp://localhost", (error0, connect) => {
        if (error0) {
            console.log("rabbitMQ is OFF")
            //throw error0
        } else {
            connect.createChannel( async function (error1, channel) {
                if (error1) {
                    console.log("problem create channel rabbitMQ")
                    //throw error1
                }

                var queue = "stock_queue"
                channel.assertQueue(queue, {
                    durable: true
                })

                channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
                    persistent: true
                })
                var iDate = parseInt(message.datetime);
                console.log(`[*] sent with datetime ${iDate}`);
                
                // remove data from mongoDB
                await Stock.deleteOne({ datetime: iDate}).then(() => {
                    console.log(`${iDate} berhasil di hapus`)
                })
            });
        }

        // setTimeout(() => {
        //     process.exit(1)
        // }, 500);
    });
}

main();