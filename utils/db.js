const mongoose = require("mongoose")

mongoose.connect('mongodb://127.0.0.1/super', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})



/*
     // save
    const add = new Stock({
        gateway : message.gateway,
        data    : message.data
    })
    add.save();

    // list
    const list = await Stock.find();

    // looping
    list.forEach(async row => {
    console.log(row._id)
    console.log(row.data.device_id)
        if (row._id == "630590f083faf2e1d3a34d66") {
            await Order.deleteOne({ _id: ObjectId("630590f083faf2e1d3a34d66") })
        }
    })
*/
