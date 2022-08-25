const mongoose = require("mongoose")

// create schema
const Stock = mongoose.model('stock', {
    gateway: {
        type: String,
    },
    datetime: {
        type: Number
    },
    data: {
        type: Object
    }
})

module.exports = Stock