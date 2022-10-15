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

let Task = mongoose.model("alarms", alarmSchema)
module.exports = Task