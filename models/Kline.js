// const { number } = require('mathjs')
const mongoose = require('mongoose')

const klineSchema = new mongoose.Schema({
    start: Number,
    end: String,
    period: String,
    symbol: String,
    open: String,
    close: String,
    high: String,
    low: String,
    volume: String,
    turnover: String,
    cross_seq: String,
    confirm: String
})

module.exports = mongoose.model('klines', klineSchema)