// const { number } = require('mathjs')
const mongoose = require('mongoose')

const klineSchema = new mongoose.Schema({
    start: Number,
    end: String,
    period: String,
    symbol: String,
    open: Number,
    close: Number,
    high: Number,
    low: Number,
    volume: Number,
    turnover: Number,
    cross_seq: String,
    confirm: String
})

module.exports = mongoose.model('klines', klineSchema)