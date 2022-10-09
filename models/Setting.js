const mongoose = require('mongoose')

const settingSchema = new mongoose.Schema({
    timeframes: {
        short: String,
        trade: String,
        long: String,
    }
})
module.exports = mongoose.model("settings", settingSchema)