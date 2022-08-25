
var amqp = require("amqplib/callback_api")

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
        channel.consume(queue, function(msg){
            var secs = msg.content.toString().split(".").length -1
            
            console.log("[*] received %s", msg.content.toString())
            
            setTimeout(() => {
                console.log("[*] done");
                channel.ack(msg) // Message acknowledgment : untuk kirim ulang message
            }, 30000);
        }, {
            noAck: false // Message acknowledgment
        })

    })

})