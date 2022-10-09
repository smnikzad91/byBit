const { boolean } = require('mathjs')
const mongoose = require('mongoose')
const alarmSchema = new mongoose.Schema({
    symbol: String,
    condition: String,
    price: String,
    type: String,
    shouldCall: boolean,
    shouldMessage: boolean,
    isEnabled: boolean,
}, { timestamps: true })

module.exports = mongoose.model("alarms", alarmSchema)