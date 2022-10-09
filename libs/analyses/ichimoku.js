const kline    = require('./kline');
const Alarm    = require('./../../models/Alarm');
const telegram = require('./../telegram')
const Ichimoku = require('./../../models/Ichimoku')
const bybit    = require('./../exchange/bybit')
const cron     = require('node-cron');
const Setting  = require('./../../models/Setting')
const Position = require('./../../models/Position')
const assist   = require('./../devices/assist')
const Symbol   = require('./../../models/Symbol')
const {multiply, divide, format, pow, subtract, log, add, larger, largerEq, smallerEq, smaller} = require('mathjs');
const { createClient }    = require('redis')
require('dotenv').config()
let client = new createClient({
    url: 'redis://localhost',
    socket: {
      port: process.env.redisPort
    },
    password: process.env.redisPassword
})
client.connect()

const lossPercentage = 20;
let positionMargin = 0.2;
let leverage = 0;

let timeframes;
setTimeout(async () => {
   [{timeframes}] = await Setting.find().select(['-_id']);
   console.log(timeframes)
}, 300)


exports.checkAlarmNew = async  () => {
    let alarms = await Ichimoku.find().lean()
    alarms.forEach(async (alarm, index) => {
        let { symbol, element, condition, interval, _id, type, buffer } = await alarm
        console.log(alarm)
        if(!buffer){
            buffer = 0;
        }
        let { lastPrice } = await bybit.getLastPrice(symbol)
        let { maxLeverage } = await bybit.getIncrements(symbol)
        let params = await this.getLastParam(symbol, timeframes[interval], 120)
        let elementPrice = params[element]
        if(condition == "below"){
            if(smallerEq(parseFloat(lastPrice), add(parseFloat(elementPrice), divide(multiply(parseFloat(buffer), parseFloat(elementPrice)), 100)))){
                await Ichimoku.findByIdAndDelete(_id)
                let positionInfo = await kline.calculatePositionParameters(symbol, "buy")
                let { callbackRate, stopLossStopPrice, stopLossLimitPrice, activationPrice, highPercent, lowPercent, longR2R, shortR2R } = positionInfo
                console.log(`${symbol} is ${condition} ${element} ${timeframes[interval]} price: ${lastPrice} buffer: ${buffer} ${type}\n stop:${stopLossStopPrice}, limit: ${stopLossLimitPrice}, activationPrice: ${activationPrice} callbackRate: ${callbackRate} low: ${lowPercent} shortR2R: ${longR2R}`)
                leverage = Math.ceil(divide(lossPercentage, callbackRate)) * 4;
                if(largerEq(leverage, maxLeverage)){
                    leverage = maxLeverage;
                }
                if(type != "manual"){
                    telegram.sendSignal(symbol, "buy", lastPrice, stopLossStopPrice, stopLossLimitPrice, activationPrice, callbackRate, longR2R, shortR2R, buffer, leverage, activationPrice)
                    // buy request
                    // console.log("is signal")
                    // assist.sendMessage("09119100991", `${symbol} position started !`)
                    // assist.makeCall("09119100991");
                    // let { qty } = await kline.getQty(symbol, positionMargin, leverage)
                    // console.log(qty)
                    // await bybit.setLeverage(symbol, leverage)
                    // await bybit.marketBuy(symbol, qty, activationPrice)
                    // setTimeout(async () => {
                        // await bybit.setTrailingStop(symbol, "Buy", callbackRate)
                    // }, 1000)
                }else{
                //     console.log("not signal")
                    telegram.sendAdminMessage(JSON.stringify({ symbol, element, condition, interval, buffer, _id, type }))
                }
                // await Position.create({ side: "buy", symbol, entry: lastPrice, stop: stopLossStopPrice, limit: stopLossLimitPrice, activation: activationPrice, callbackRate })                                                           
            }
        }else if(condition == "above"){
            if(largerEq(parseFloat(lastPrice), subtract(parseFloat(elementPrice), divide(multiply(parseFloat(buffer), parseFloat(elementPrice)), 100)))){
                await Ichimoku.findByIdAndDelete(_id)
                let positionInfo = await kline.calculatePositionParameters(symbol, "sell")
                let { callbackRate, stopLossStopPrice, stopLossLimitPrice, activationPrice, highPercent, lowPercent, longR2R, shortR2R } = positionInfo
                leverage = Math.ceil(divide(lossPercentage, callbackRate)) * 4;
                if(largerEq(leverage, maxLeverage)){
                    leverage = maxLeverage;
                }
                console.log(`${symbol} is ${condition} ${element} ${timeframes[interval]} price: ${lastPrice} buffer: ${buffer} ${type}\n stop:${stopLossStopPrice}, limit: ${stopLossLimitPrice}, activationPrice: ${activationPrice} callbackRate: ${callbackRate} low: ${lowPercent} shortR2R: ${shortR2R}`)
                if(type != "manual"){
                    telegram.sendSignal(symbol, "sell", lastPrice, stopLossStopPrice, stopLossLimitPrice, activationPrice, callbackRate, longR2R, shortR2R, buffer, leverage, activationPrice)
                    //sell request
                    // console.log("is signal")
                    // assist.sendMessage("09119100991", `${symbol} position started !`)
                    // assist.makeCall("09119100991");
                    // let { qty } = await kline.getQty(symbol, positionMargin, leverage)
                    // console.log(qty)
                    // await bybit.setLeverage(symbol, leverage)
                    // await bybit.marketSell(symbol, qty, activationPrice)
                    // setTimeout(async () => {
                        // await bybit.setTrailingStop(symbol, "Sell", callbackRate)
                    // }, 1000)
                }else{
                //     console.log("not signal")
                    telegram.sendAdminMessage(JSON.stringify({ symbol, element, condition, interval, buffer, _id, type }))
                }
                // await Position.create({ side: "sell", symbol, entry: lastPrice, stop: stopLossStopPrice, limit: stopLossLimitPrice, activation: activationPrice, callbackRate })                                           
            }
        }else{
            console.log("nothing to do from alarm file")
        }                    
        if(index == alarms.length - 1){
            setTimeout(() => {
                // console.log("dynamic")
                this.checkAlarmNew();
            }, 300)
        }
    })     
    
}


setTimeout(() => {
    this.checkAlarmNew();
}, 3100)


getParams = async (symbol, period) => {
    let count = 120
    let { klines } = await bybit.getLocalKlines(symbol, period, count)
    let {hArray, lArray} = klines;
    let tenkansenArray=[], kijunsenArray=[], senkouBArray=[], senkouAArray= [];
    let periodMin, periodMax;
    for(let i = count-1; i >= 9; i--){
        periodMin=100000; periodMax=0;
        for(let j = i; j >= (i - 9); j--){
            let candleHigh = parseFloat(hArray[j])
            let candleMin = parseFloat(lArray[j])
            if(candleHigh > periodMax){
                periodMax = candleHigh;
            }
            if(candleMin < periodMin){
                periodMin = candleMin
            }
        }
        let tenkansen = (periodMax + periodMin) / 2;
        tenkansen = Math.round(tenkansen * Math.pow(10, 8)) / Math.pow(10, 8)
        tenkansenArray.push(tenkansen)
    }
    for(let i = count-1; i >= 29; i--){
        periodMin=100000; periodMax=0;
        for(let j = i; j >= (i - 29); j--){
            let candleHigh = parseFloat(hArray[j])
            let candleMin = parseFloat(lArray[j])
            if(candleHigh > periodMax){
                periodMax = candleHigh;
            }
            if(candleMin < periodMin){0.702
                periodMin = candleMin
            }
        }
        let kijunsen = (periodMax + periodMin) / 2;
        kijunsen = Math.round(kijunsen * Math.pow(10, 8)) / Math.pow(10, 8)
        kijunsenArray.push(kijunsen)
    }
    for(let i = count-1; i >= 59; i--){
        periodMin=100000; periodMax=0;
        for(let j = i; j >= (i - 59); j--){
            let candleHigh = parseFloat(hArray[j])
            let candleMin = parseFloat(lArray[j])
            if(candleHigh > periodMax){
                periodMax = candleHigh;
            }
            if(candleMin < periodMin){
                periodMin = candleMin
            }
        }
        let senkouB = (periodMax + periodMin) / 2;
        senkouB = Math.round(senkouB * Math.pow(10, 8)) / Math.pow(10, 8)
        senkouBArray.push(senkouB)
    }
    tenkansenArray = tenkansenArray.reverse();
    kijunsenArray = kijunsenArray.reverse();
    kijunsenArray.forEach((item, index) => {
        let senkouA = (item + tenkansenArray[index]) / 2
        senkouA = Math.round(senkouA * Math.pow(10, 8)) / Math.pow(10, 8)
        senkouAArray.push(senkouA)
    })  
    senkouBArray = senkouBArray.reverse();
    return {tenkansenArray, kijunsenArray, senkouAArray, senkouBArray}        
}

getFlatZone = async (symbol, period, element, length) => {
    let flatPrices = [];
    let params = await this.getParams(symbol, period)
    let elementArray = params[`${element}Array`]
    // console.log(elementArray)
    elementArray.forEach(ichimokuelement => {
        let filter = elementArray.filter(item => item == ichimokuelement)
        if(filter.length > length){
            if(!flatPrices.includes(ichimokuelement)){
                flatPrices.push(ichimokuelement)
            }
        }
    })
    return flatPrices;
}

getClosestElement = async (candles, position) => {
    let lastPrice = candles.cArray[0];
    let ichimokuParam = await this.getLastParam(candles);
    let items = [];
    let distance=200000, closestelement;
    Object.keys(ichimokuParam).forEach(key => {
        if(position == "UP"){
            if(lastPrice < ichimokuParam[key])
            items.push({key, value: ichimokuParam[key]})
        }else {
            if(lastPrice > ichimokuParam[key]){
                items.push({key, value: ichimokuParam[key]})
            }
        }
    })
    if(items.length){
        items.forEach(async item => {
            let elementDistance = Math.abs(subtract(lastPrice, item.value))    
            if(smallerEq(elementDistance, distance)){
                closestelement = item.key
                distance = elementDistance;
            }
        });
        return {status: 1, position, element: closestelement, price: ichimokuParam[`${closestelement}`]}
    }else{
        return {status: 0}
    }
}

getClosestFlat = async (symbol, timeFrame) => {
    let candles = await binance.getCandles(symbol, timeFrame, 120);
    let [lastPrice] = await LastPrice.find({ s: symbol }).select([ 'p', '-_id' ])
    lastPrice = lastPrice["p"]
    let distance=200000;
    let ichimokuParam = await this.getParams(symbol, timeFrame);
    let flatTenkansen = await this.getFlatZone(ichimokuParam.tenkansenArray, 8)
    let flatKijunsen = await this.getFlatZone(ichimokuParam.kijunsenArray, 8)
    let flatSenkouA = await this.getFlatZone(ichimokuParam.senkouAArray, 8)
    let flatSenkouB = await this.getFlatZone(ichimokuParam.senkouBArray, 8)
    let closestFlat = flatTenkansen.concat(flatKijunsen).concat(flatSenkouA).concat(flatSenkouB)

    closestFlat.forEach(async (value, key) => {
        let elementDistance = Math.abs(subtract(lastPrice, value));
        if(smallerEq(elementDistance, distance)){
            distance = elementDistance;
            index = key;
        }
    })
    let value = closestFlat[index];
    let position = ""
    if(smallerEq(value, lastPrice)){
        position = "DOWN"
    }else{
        position="UP"
    }
    return { value, position } 
}

getLastParam = async (symbol, period) => {
    let params = await this.getParams(symbol, period);
    return { tenkansen: params.tenkansenArray[0], kijunsen: params.kijunsenArray[0], senkouA: params.senkouAArray[29], senkouB: params.senkouBArray[29]}        
}

exports.getPRZ = async () => {
        await Alarm.deleteMany({  type: "dynamic" })
        // let [{timeframes}] = await Setting.find().select(['-_id']);
        // let tokens = await Symbol.find().select(['name', '-_id']);
        // tokens.forEach(async token => {
        //     try{
        //         let { name: symbol } = token;
        //         let {lastPrice} = await bybit.getLastPrice(symbol)
        //         let flatKijunsen = await getFlatZone(symbol, timeframes.trade, "kijunsen", 4)
        //         let flatSenkouB = await getFlatZone(symbol, timeframes.trade, "senkouB", 10)        
        //         let zones = [];                
        //         flatKijunsen.forEach(item => {
        //             if(flatSenkouB.includes(item)){
        //                 zones.push(item)
        //             }
        //         })           
        //         if(zones.length){
        //             let aboveArray = [], belowArray = [];
        //             zones.forEach(async zone => {
        //                 if(largerEq(lastPrice, zone)){
        //                     belowArray.push(zone)
        //                 }else{
        //                     aboveArray.push(zone)
        //                 }                
        //             })
        //             let shouldMessage;
        //             if(symbol.substring(0, symbol.length - 4) == "BTC"){
        //                 shouldMessage = true
        //             }else{
        //                 shouldMessage = false;
        //             }
        //             if(aboveArray.length){
        //                 let max = Math.max.apply(Math, aboveArray);
        //                 await Alarm.create({ symbol, condition: "above", price: max, isEnabled: true, shouldCall: false, shouldMessage, type: "dynamic" })
        //             }
        //             if(belowArray.length){
        //                 let min = Math.min.apply(Math, belowArray)
        //                 await Alarm.create({ symbol, condition: "below", price: min, isEnabled: true, shouldCall: false, shouldMessage, type: "dynamic" })
        //             }
        //         }else{
        //         }  
        //     }catch(err){
        //         console.log("failed to check ichi prz zones")
        //     }
 
            
            


        // })
}
exports.isElementBroken = async(symbol, timeFrame, element, side) => {
    let [{timeframes}] = await Setting.find().select(['-_id']);
    let interval  = timeframes[timeFrame]
    let { klines } = await bybit.getLocalKlines(symbol, interval , 120 );
    let lastParam = await this.getLastParam(symbol, interval, 120)
    let klineHigh = klines.hArray[1];
    let klineLow = klines.lArray[1];
    let elementPrice = lastParam[element];
    let status = false;
    if(side == "up"){
        if(smaller(elementPrice, klineLow)){
            status = true;
        }else{
            status: false;
        }
    }else if(side == "down"){
        if(larger(elementPrice, klineHigh)){
            status = true
        }else {
            status = false;
        }
    }
    return status
}

exports.getLastParam = getLastParam
exports.getParams = getParams;
exports.getFlatZone = getFlatZone;
exports.getClosestElement = getClosestElement;
exports.getClosestFlat = getClosestFlat;

cron.schedule('13 0 * * * *', async () => {
    this.getPRZ();
})

cron.schedule('13 30 * * * *', async () => {
    this.getPRZ();
})

// cron.schedule('15 */5 * * * *', async () => {
//     console.log('running a task every 5 minute ');
//     let [coins] = await pool.query(`SELECT * FROM ichimoku`)
//     coins.forEach(async (coin, index) => {

//         setTimeout(async () => {
//             let {symbol} = coin;
//             Object.keys(TF).forEach(async key => {
//                 // console.log(`Calculate ${TF[key]} ichimoku for ${symbol}`)
//                 try{
//                     try{
//                         let candles = await binance.getCandles(symbol, TF[key], 120);
//                         // let lastPrice = candles.closeArray[120 - 1]
//                         try{
//                             let lastParam = await getLastParam(candles)
//                             let {tenkansen, kijunsen, senkouA, senkouB} = lastParam;       
//                             try{
//                                 await pool.query(`UPDATE ichimoku SET tenkansen${key}="${tenkansen}", kijunsen${key}="${kijunsen}", senkouA${key}="${senkouA}", senkouB${key}="${senkouB}" WHERE symbol="${symbol}"`)
//                             }catch(e){
//                                 console.log(`failed to save ichimoku ${TF[key]} for ${symbol}`);
//                                 console.log(e)
//                             }
//                         }catch(e){
//                             console.log(`get ichi error on ${key}`);
//                         }
//                     }catch(e){
//                         console.log(`get candle error`);
//                     }
//                 }catch(e){
//                     console.log(`filter object error`);
//                 }
//             })          
//         }, 600 * index);
//     }) 
// });


//
// cron.schedule('9 0 * * * * *', async () => {
// setInterval(async () =>{
//     console.log('running a task every 15 minute ');
//     let [{timeframes}] = await Setting.find().select(['-_id']);
//     let deleteResult = await Alarm.deleteMany({type: "dynomic"});
//     let cryptos = await LeveragedToken.find();
//     cryptos.forEach( async crypto => {
//     let {symbol} = crypto
//     let {klines} = await bybit.getLocalKlines(symbol, timeframes.trade, 120);
//     let ichimokuParam = await this.getParams(klines);
//     let flatTenkansen = await this.getFlatZone(ichimokuParam.tenkansenArray, 4)
//     let flatSenkouA = await this.getFlatZone(ichimokuParam.senkouAArray, 4)
//     let flatKijunsen = await this.getFlatZone(ichimokuParam.kijunsenArray, 4)
//     let flatSenkouB = await this.getFlatZone(ichimokuParam.senkouBArray, 4)


//     let {lastPrice} = await bybit.getLastPrice(symbol)

//     let zones = [];
//     let result = "";
//     flatKijunsen.forEach(item => {
//         if(flatSenkouB.includes(item)){
//             zones.push(item)
//         }
//     })
//     if(zones.length){
//         // zones.forEach(item => {
//         //   result += `${item} `
//         // })
//         let side = "";
//         if(largerEq(lastPrice, zones[0])){
//           side = "below"
//         }else{
//           side = "above";
//         }
//         // let balance = await getBalance();
//         // let margin = multiply(balance, 33)
//         // let volume = Math.round(divide(margin, zones[0]) * Math.pow(10, volumePercision)) / Math.pow(10, volumePercision)
//         // if(volume <= minVolume){
//         //     volume = minVolume * 2;
//         //     console.log("Low Money");
//         // }
//         // let entry = (Math.round(zones[0] * Math.pow(10, pricePercision)) / Math.pow(10, pricePercision)) + ( 20 * (1 / Math.pow(10, pricePercision)))

//         // await Alarm.create({ symbol: symbol.split('-')[0].toLowerCase(), condition: side, price: zones[0], isEnabled: true, isLToken: true, shouldCall: false, shouldMessage:false, type: "dynomic" })
//         // let saveResult = await alarm.save();
//         console.log(`Got Zone on ${zones[0]} for ${symbol} side: ${side}`);
//     }else{

//     }

//   })
// }, 5000);