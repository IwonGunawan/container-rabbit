require("./utils/db")

var amqp = require("amqplib/callback_api")
const Stock = require("./models/stock");
const GLOBAL = require("./utils/global");

amqp.connect("amqp://localhost", function(error0, connect){
    if (error0) {
        throw error0
    }

    connect.createChannel(function(error1, channel){
        if (error1) {
            throw error1
        }
        var queue = "stock_queue"
        channel.assertQueue(queue, {
            durable : true
        })

        channel.prefetch(1) // fair-dispatch : pembagian tugas secara adil
        channel.consume(queue, async function(msg){
            //var secs = msg.content.toString().split(".").length -1
            
            // insert data moongoDB with status 1
            const str = msg.content.toString();
            const obj = JSON.parse(str);

            console.log("[*] received %s", str);
            await insertLog(obj);

            
            setTimeout(() => {
                console.log("[*] done");
                channel.ack(msg) // Message acknowledgment : resend message
            }, 30000);
        }, {
            noAck: false // Message acknowledgment
        })

    })

})


function insertLog(message){
    const add = new Stock({
        from        : message.from,
        process     : message.process,
        datetime    : message.datetime,
        status      : GLOBAL.received_rabbit,
        payload     : message.payload
    })
    add.save().then((result) => {
        console.log(`[*] save -> received by consumer`)
    })
}