const { Schema, model }  = require('mongoose')

const klineErrorScehma = new Schema({
    symbol: String,
    period: String,
    time: String
})

module.exports = model( "klineErrors" , klineErrorScehma)