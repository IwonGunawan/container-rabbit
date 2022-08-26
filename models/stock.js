const mongoose = require("mongoose")

// create schema
const Stock = mongoose.model('stock', {
    from: {
        type: String,
    },
    process: {
        type: String
    },
    datetime: {
        type: Number
    },
    status: {
        type: Number
    },
    payload: {
        type: Object
    }
})

module.exports = Stock