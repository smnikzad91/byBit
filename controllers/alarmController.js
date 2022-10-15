const Alarm        = require('./../models/Alarm')
const Assist       = require('./../libs/devices/assist');
const AlarmHistory = require('./../models/AlarmHistory')
const Ichimoku     = require('./../models/Ichimoku')
const telegram     = require('./../libs/telegram')
const bybit        = require('./../libs/exchange/bybit')
const kline        = require('./../libs/analyses/kline')
const Setting      = require('./../models/Setting')
const {multiply, divide, format, pow, subtract, log, add, largerEq, smallerEq, smaller, fraction} = require('mathjs');

exports.checkAlarm_ = async ()=>{

    let alarms = await Alarm.find().lean()
    let alarmsLength = alarms.length;

    for (const alarm of alarms ){
        let { symbol, price, condition, _id, isEnabled, shouldCall, shouldMessage, type } = await alarm
        console.log(alarm)
        let {lastPrice} = await bybit.getLastPrice(symbol)

   }
    

}


exports.checkAlarm = async () => {
    let alarms = await Alarm.find().lean()
    let alarmsLength = alarms.length;
    alarms.forEach(async (alarm, index) => {
    // let index = 0;
    // for(let alarm of alarms){
        let { symbol, price, condition, _id, isEnabled, shouldCall, shouldMessage, type } = await alarm
        // console.log(alarm)
        let {lastPrice, status} = await bybit.getLastPrice(symbol)
        if(status){
            if(condition === "below"){
                if(parseFloat(lastPrice) <= parseFloat(price)){
                    await Alarm.findByIdAndDelete(_id)
                    await AlarmHistory.create({ symbol, condition, price, isEnabled, shouldCall, shouldMessage, type  })
                    if(type === "manual"){
                        console.log(`${symbol} is ${condition} ${price} type: manual`)
                        telegram.sendAdminMessage(`${symbol} is ${condition} ${price} type: ${type}`)
                    }else if(type === "static"){
                        console.log(`${symbol} is ${condition} ${price} type: ${type}`)
                        telegram.sendAdminMessage(`${symbol} is ${condition} ${price} type: static`)
                        Ichimoku.find({ symbol }, (err, result) => {
                            if(!result.length){
                                let interval;
                                if(type == "static"){
                                    interval = "long"
                                }else if(type == "dynamic"){
                                    interval = "short"
                                }
                                kline.getBuffer(symbol).then(( { buffer } ) => {
                                    Ichimoku.create({ symbol, condition: "above", element: "tenkansen", interval, type, buffer })
                                })
                            }
                        })
                    }                           
                }
            }else if(condition === "above"){
                if(largerEq(parseFloat(lastPrice) , parseFloat(price))){
                    await Alarm.findByIdAndDelete(_id)
                    await AlarmHistory.create({ symbol, condition, price, shouldCall, shouldMessage, type })
                    if(type == "manual"){
                        console.log(`${symbol} is ${condition} ${price} type: ${type}`)
                        telegram.sendAdminMessage(`${symbol} is ${condition} ${price} type: ${type}`)
                    }else if( type == "static" ){
                        console.log(`${symbol} is ${condition} ${price} type: ${type}`)
                        telegram.sendAdminMessage(`${symbol} is ${condition} ${price} type: ${type}`)
                        Ichimoku.find({ symbol }, (err, result) => {
                            if(!result.length){
                                let interval;
                                if(type == "static"){
                                    interval = "long"
                                }else if(type == "dynamic"){
                                    interval = "short"
                                }
                                kline.getBuffer(symbol).then(( { buffer } ) => {
                                    Ichimoku.create({ symbol, condition: "below", element: "tenkansen", interval, type, buffer })
                                })
                            }
                        })
                    }                           
                }
            }
        }

        if(index == alarmsLength - 1){                
            setTimeout(() => {
                // console.log("static")
                this.checkAlarm();
            }, 300)
        }
    })
    // }
}

setTimeout(() => {
    // global.shouldTrade = true;
    // this.checkAlarm();
}, 3000)




exports.getTest = async (req, res) => {

    res.json({ status: true, message: "alarm test page" })
}




exports.getIndex = async (req, res) => {
    let alarms = await Alarm.find().select(['-createdAt', '-updatedAt', '-__v'])
    let ichimokus = await Ichimoku.find().select(['-createdAt', '-updatedAt', '-__v'])
    let [{timeframes}] = await Setting.find().select(['-_id']);
    res.render('alarm/index', { alarms, ichimokus, timeframes })
}


exports.postNew = async (req, res) => {
    let { alarmType, shouldCall, shouldMessage } = req.body;
    // console.log(alarmType)
    if(alarmType == "static"){
        let { symbol, condition, price } = req.body;
        symbol = symbol.toUpperCase() + 'USDT'
        let result = await Alarm.create({ symbol, condition, price, isEnabled: true, isLToken: false, shouldCall, shouldMessage, type: "manual" })
    }else if(alarmType == "ichimoku"){
        let { symbol, condition, ichimokuElement, timeframe } = req.body;
        symbol = symbol.toUpperCase() + 'USDT'
        let { buffer } = await kline.getBuffer(symbol)
        // console.log(buffer)
        await Ichimoku.create({symbol, condition, element: ichimokuElement, interval: timeframe, type: "manual", buffer})
    }
    res.redirect('/alarms')
}

exports.getDeactive = async (req, res) => {
    let { id } = req.params
    let result = await Alarm.findByIdAndUpdate(id, { $set: { isEnabled: false } });
    res.redirect('/alarms')
}

exports.getActive = async (req, res) => {
    let { id } = req.params
    let result = await Alarm.findByIdAndUpdate(id, { $set: { isEnabled: true } });
    res.redirect('/alarms')
}

exports.getDelete = async (req, res) => {
    let { id, type } = req.params;
    if(type == "static"){
        if(id == "all"){
            let result = await Alarm.deleteMany();
            await Ichimoku.deleteMany();
        }else{
            let result = await Alarm.findByIdAndDelete(id);
        }
        res.redirect('/alarms')
    }else if(type == "ichimoku"){
        await Ichimoku.findByIdAndDelete(id);
        res.redirect('/alarms')
    }

}