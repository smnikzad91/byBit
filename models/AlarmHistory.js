const mongoose = require('mongoose');
const { boolean } = require('mathjs')
const {persianDate, gregorianDate} = require('./../libs/jalali')
const Assist = require('./../libs/devices/assist')

const alarmHistorySchema = new mongoose.Schema({
    symbol: String,
    condition: String,
    price: String,
    type: String,
    isEnabled: boolean,
    shouldCall: boolean,
    shouldMessage: boolean,
    pYear: String,
    pMonth: String,
    pDay: String,
    gYear: String,
    gMonth: String,
    gDay: String,
    hour: String,
    minute: String,
    second: String,
    timestamp: { type: String, default: Date.now() },
}, { timestamps: true })

alarmHistorySchema.post('save', function (doc, next) {
    let { symbol, condition, price, shouldMessage, shouldCall } = doc
    symbol = symbol.substring(0, symbol.length - 4);
    Assist.sayAlarm(symbol, condition)
    if(shouldMessage){
        setTimeout(()=> {
            Assist.sendMessage("09119100991", `${symbol} Is ${condition} $${price}`)
        }, 3000)
    }
    if(shouldCall){
        setTimeout(() => {
            Assist.makeCall("09119100991")
        }, 7000);
    }
    next();
})

alarmHistorySchema.pre('save', async function (next){
    let persian = persianDate();
    let { second, minute, hour, day, month, year } = persian;
    let gregorian = gregorianDate();
    this.hour   = hour;
    this.minute = minute;
    this.second = second;
    this.pYear  = year;
    this.pMonth = month;
    this.pDay   = day;
    this.gYear  = gregorian.year;
    this.gMonth = gregorian.month;
    this.gDay   = gregorian.day;   
    next();
})


module.exports = mongoose.model('alarmHistories', alarmHistorySchema);