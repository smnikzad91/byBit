const mongoose = require("mongoose");
const { boolean } = require('mathjs')
let ichimokuSchema = new mongoose.Schema({
    symbol: String,
    condition: String,
    element: String,
    interval: String,
    type: String,
    buffer: String,
}, { timestamps: true })

module.exports = mongoose.model("ichimokus", ichimokuSchema);

