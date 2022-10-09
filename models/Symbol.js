const { Schema, model } = require("mongoose");

const symbolSchema = new Schema({
    name: { type: String },
    alias:  { type: String },
    status:  { type: String },
    base_currency:  { type: String },
    quote_currency:  { type: String },
    price_scale:  { type: String },
    taker_fee:  { type: String },
    maker_fee:  { type: String },
    funding_interval:  { type: String },
    leverage_filter: {},
    price_filter: {},
    lot_size_filter: {},
    min: String,
    max: String,
    highPercent: String,
    lowPercent: String,
    longR2R: String,
    shortR2R: String,
})

module.exports = model("symbols", symbolSchema)