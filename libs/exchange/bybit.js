const axios      = require('axios').default;
const fetch = require('cross-fetch')
const request    = require('request');
const crypto     = require('crypto');
const telegram   = require('./../telegram')
const Setting    = require('./../../models/Setting')
const KlineError = require('./../../models/KlineError')
const Symbol     = require('./../../models/Symbol')
const Kline      = require('./../../models/Kline')
const cron       = require('node-cron');
const alarmController = require('./../../controllers/alarmController')
const ichimoku = require('./../../libs/analyses/ichimoku')
const {multiply, divide, format, pow, subtract, log, add, largerEq, smallerEq, smaller, fraction, equalText, equal} = require('mathjs');
const { createClient }    = require('redis')
require('dotenv').config()
let client = new createClient({
    url: `redis://${process.env.redisAddress}`,
    socket: {
      port: process.env.redisPort
    },
    password: process.env.redisPassword
})
client.connect()

const baseUrl = "https://api.bybit.com"
const apiKey = "r0DsBk4O9gwSVw31pz"
const apiSecret = "TroU3es8YqRjlVyMUtBmDhKNCzoOtEmYZJNZ"
var klineCount = 120
let timeframes;

setTimeout(async () => {
    [{timeframes}] = await Setting.find().select(['-_id']);
 }, 300)

const getSignature = (parameters, secret) => {
	var orderedParams = "";
	Object.keys(parameters).sort().forEach(function(key) {
	  orderedParams += key + "=" + parameters[key] + "&";
	});
	orderedParams = orderedParams.substring(0, orderedParams.length - 1);

	return crypto.createHmac('sha256', secret).update(orderedParams).digest('hex');
}

exports.getCandles = async (symbol, period, count) => {
    let sArray=[], oArray=[], cArray=[], hArray=[], lArray=[], vArray=[], tArray=[];
    let index;
    if(period == "D"){
        index = 1440
    }else{
        index = period
    }
    try{
        let response = await fetch(`${baseUrl}/public/linear/kline?symbol=${symbol}&interval=${period}&from=${Math.round((Date.now() / 1000))  - ( 60 * index * count)}&limit=${count}`)
        let data =  await response.json();
        let {ret_code, result} = data
        if(ret_code == "0"){
            result.forEach((candle, index) => {
                let { open, close, high, low, start_at, volume, turnover } = candle;
                sArray.push(start_at);
                oArray.push(open)
                cArray.push(close)
                hArray.push(high)
                lArray.push(low)
                vArray.push(volume)
                tArray.push(turnover)
                if(index == result.length - 1){
                    
                }
            })
            return { status: true, klines: { oArray, cArray, hArray, lArray, vArray, tArray, sArray} }
        }else{
            return { status: false, message: "Request Error" }
        }

        
    }catch(err){
        // console.log(err)
        return { status: false, message: "Internal Error" }
    }   
}

exports.addKline = async(symbol, period, count) => {
    try{
        let result = await this.getCandles(symbol, period, count)
        if(result.status){
            for (let i=0; i<count; i++){
                let start= result.klines.sArray[i]
                let open = result.klines.oArray[i]
                let close = result.klines.cArray[i]
                let high = result.klines.hArray[i]
                let low = result.klines.lArray[i]
                let volume = result.klines.vArray[i]
                let turnover = result.klines.tArray[i]
                try{
                    let key = `kline-${symbol}-${period}-${start}`;
                    let count;
                    if(period != 5){
                        count = 120
                    }else{
                        count = 200;
                    }
                    let ex = 60 * period * count;
                    await client.set(key , JSON.stringify({
                        symbol, period,
                        start, open, close,
                        high, low,volume, turnover
                    }))    
                    // await Kline.create({
                    //     symbol, period,
                    //     start, open, close,
                    //     high, low,volume, turnover
                    // }) 

                }catch(err){
                    console.log(`Storage error for fetch ${symbol} whith interval ${period}`)
                    // KlineError.create({ symbol, period, count })
                }           
            }
        }else{
            console.log(`api call error for fetch ${symbol} whith interval ${period}`)
            // KlineError.create({ symbol, period, count })
        }
    }catch(err){
        console.log(`error for fetch ${symbol} whith interval ${period}`)
        // KlineError.create({ symbol, period, count })
    }
}

exports.fixDatabase = async(errorList) => {
    console.log("###Requestin for failed requests###")
    let length = errorList.length + 1;
    errorList.forEach(async (item, index) => {
        setTimeout(async () => {
            let { symbol, interval, count } = item;
            console.log( "refetch", symbol, interval, count)
            await this.addKline(symbol, interval, count)
        }, 150 * index)
    })
    setTimeout(async () => {
        let refetchList = await KlineError.find().select(['-_id', '-__v']);
        if(refetchList.length > 0){
            this.fixDatabase(refetchList)
            await KlineError.deleteMany();
        }else{
            console.log("Database filling finished")
            global.saveKline = true;
            global.shouldTrade = true;
        }
    }, 150 * length)
}

exports.fillDatabase = async () => {
    let [{timeframes}] = await Setting.find().select(['-_id']);
    global.saveKline = false;
    global.shouldTrade = false;
    client.flushAll();
    console.log("Database filling started")
    console.log("#1: Candlestick storage stopped")
    setTimeout(async () => {
        let errorList = await KlineError.find().select(['-_id', '-__v']);
        await KlineError.deleteMany();
        if(errorList.length > 0){
            this.fixDatabase(errorList);
        }else{
            console.log("Database filling finished")
            global.saveKline = true;
            global.shouldTrade = true;
            // alarmController.checkAlarm();
            // ichimoku.checkAlarmNew();
        }        
    }, 79800)

    let symbols = await Symbol.find().select(['name', '-_id']);
    await Kline.deleteMany();
    await KlineError.deleteMany();
    console.log("#2: Requesting and saving candlestick data")
    symbols.forEach(async (symbol , index) => {
        let { name } = symbol;
        setTimeout(async () => {
            console.log(`#${++index} fetch for ${name} ${timeframes.long}`)
            await this.addKline(name, timeframes.long, klineCount)
        }, (150 * index))

        setTimeout(async () => {
            console.log(`#${index} fetch for ${name}  ${timeframes.trade}`)
            await this.addKline(name, timeframes.trade, klineCount)
        }, (150 * index) + 26250)

        setTimeout(async () => {
            console.log(`#${index} fetch for ${name}  ${timeframes.short}`)
            await this.addKline(name, timeframes.short, 200)
        }, (150 * index) + 52500)    

    })
}

exports.addMissingKline = async ( symbol, period, start ) => {
    try{
        let response = await axios.get(`${baseUrl}/public/linear/kline?symbol=${symbol}&interval=${period}&from=${start}&limit=1`)
        let { data } = response;
        let {ret_code, result} = data
        
        if(ret_code == "0"){
            let { open, close, high, low, volume, turnover } = result[0]
            let key = `kline-${symbol}-${period}-${start}`;
            await client.set(key , JSON.stringify({
                symbol, period,
                start, open, close,
                high, low,volume, turnover
            })) 
        }

    }catch(err){
        // console.log(err)
    }
}


exports.getLocalKlines = async (symbol, period, count) => {
    // let sArray=[], oArray=[], cArray=[], hArray=[], lArray=[], vArray=[], tArray=[];
    // let candles = await Kline.find({ symbol, period }).sort('-start').limit(count)
    // candles.forEach(candle => {
    //     let { start, open, close, high, low, volume, turnover } = candle;
    //     sArray.push(start);
    //     oArray.push(open)
    //     cArray.push(close)
    //     hArray.push(high)
    //     lArray.push(low)
    //     vArray.push(volume)
    //     tArray.push(turnover)
    // })
    // return { status: true, klines: { oArray, cArray, hArray, lArray, vArray, tArray, sArray } }


    
    let startTime;
    if( period == timeframes.short ){
        startTime = global.lastShortIntervalStartTime
    }else if( period == timeframes.trade ){
        startTime = global.lastTradeIntervalStartTime
    }else if( period == timeframes.long ){
        startTime = global.lastLongIntervalStartTime
    }
    let counter;
    if(period == "D"){
        counter = 1440
    }else{
        counter = period
    }

    let sArray=[], oArray=[], cArray=[], hArray=[], lArray=[], vArray=[], tArray=[];
    for(let index = 0; index < count; index++){
        let time = startTime - (index * 60 * counter)
        let key = `kline-${symbol}-${period}-${time}`       
        try{
            let result = await client.get(key);
            let data = JSON.parse(result)
            let { start, open, close, high, low, volume, turnover } = data;
            sArray.push(start);
            oArray.push(open)
            cArray.push(close)
            hArray.push(high)
            lArray.push(low)
            vArray.push(volume)
            tArray.push(turnover)
        }catch(err){
            // console.log(`add : ${symbol}  ${period}   ${time}`)
            console.log(key)

            this.addMissingKline(symbol, period, time)
            return { status: false }
            // console.log(startTime)
            // console.log({ symbol, period, time })
            // KlineError.findOne({ symbol, period, time }).then(doc => {
            //     if(!doc){
            //         KlineError.create({ symbol, period, time })
            //     }
            // })
        }
    }
    return { status: true, klines: { oArray, cArray, hArray, lArray, vArray, tArray, sArray } }   
}

exports.getLastPrice = async symbol => {
    try{
        let {status, klines} = await this.getLocalKlines(symbol, timeframes.short, 1)
        if(status){
            let lastPrice = klines.cArray[0]
            return { status: true, lastPrice }
        }else{
            return { status: false }
        }
    }catch(e){
        return { status: false }
    }
}

exports.getIncrements = async (name) => {
    let symbol = await Symbol.findOne({ name })
    return { status: true, volumePercision: symbol.lot_size_filter.qty_step, pricePercision: symbol.price_scale, maxLeverage: symbol.leverage_filter.max_leverage}
}

exports.setLeverage = async (symbol, leverage) => {
    var timestamp = Date.now().toString();
    leverage
    var params = {
      symbol,
      buy_leverage: `${leverage}`,
      sell_leverage: `${leverage}`,
      "timestamp":timestamp,
      "api_key" : apiKey,
      recv_window: 50000,
    };
    params["sign"]=  getSignature(params,apiSecret);
    let {data} = await axios.post(`${baseUrl}/private/linear/position/set-leverage`, params)
    let { ret_code } = data
    if(ret_code == 0){
        return { status: true }
    }else{
        console.log(data)
        return { status: false }
    }
}

exports.placeMarketOrder = async (side, symbol, qty) => {
    let params = {
        side, symbol, order_type: "Market", qty,       
        timestamp: Date.now().toString(),
        api_key : apiKey,
        reduce_only: false,
        close_on_trigger: false,
        time_in_force:"GoodTillCancel",
        recv_window: 50000,
    };
    params["sign"]=  getSignature(params,apiSecret);
    let {data} = await axios.post(`${baseUrl}/private/linear/order/create`, params)
    let { ret_code } = data
    if(ret_code == 0){
        let orderId = data.result.order_id;
        return { status: true, orderId }
    }else{
        console.log(data)
        return { status: false }
    }
}

exports.limitBuy = async ( symbol, price, qty, target) => {
    let params = {
      side: "Buy", symbol, order_type: "Limit", qty, price, take_profit: target,     
      timestamp: Date.now().toString(),
      api_key : apiKey,
      reduce_only: false,
      close_on_trigger: false,
      time_in_force:"GoodTillCancel",
      recv_window: 15000,
    };
    params["sign"]=  getSignature(params,apiSecret);
    let {data} = await axios.post(`${baseUrl}/private/linear/order/create`, params)
    let { ret_code } = data
    if(ret_code == 0){
        let orderId = data.result.order_id;
        return { status: true, orderId }
    }else{
        console.log(data)
        return { status: false }
    }
}

exports.limitSell = async ( symbol, price, qty, target) => {
    let params = {
      side: "Sell", symbol, order_type: "Limit", qty, price, take_profit: target,     
      timestamp: Date.now().toString(),
      api_key : apiKey,
      reduce_only: false,
      close_on_trigger: false,
      time_in_force:"GoodTillCancel",
      recv_window: 50000,
    };
    params["sign"]=  getSignature(params,apiSecret);
    let {data} = await axios.post(`${baseUrl}/private/linear/order/create`, params)
    let { ret_code } = data
    if(ret_code == 0){
        let orderId = data.result.order_id;
        return { status: true, orderId }
    }else{
        console.log(data)
        return { status: false }
    }
}

exports.marketBuy = async (symbol, qty, target) => {
    let params = {
        side: "Buy", symbol, order_type: "Market", qty, take_profit: target,       
        timestamp: Date.now().toString(),
        api_key : apiKey,
        reduce_only: false,
        close_on_trigger: false,
        time_in_force:"GoodTillCancel",
        recv_window: 50000,
      };
      params["sign"]=  getSignature(params,apiSecret);
      let {data} = await axios.post(`${baseUrl}/private/linear/order/create`, params)
      let { ret_code } = data
      if(ret_code == 0){
          let orderId = data.result.order_id;
          return { status: true, orderId }
      }else{
        console.log(data)
        return { status: false }
      }
}

exports.marketSell = async (symbol, qty, target) => {
    let params = {
        side: "Sell", symbol, order_type: "Market", qty, take_profit: target,
        
        timestamp: Date.now().toString(),
        api_key : apiKey,
        reduce_only: false,
        close_on_trigger: false,
        time_in_force:"GoodTillCancel",
        recv_window: 50000,
      };
      params["sign"]=  getSignature(params,apiSecret);
      let {data} = await axios.post(`${baseUrl}/private/linear/order/create`, params)
      let { ret_code } = data
      if(ret_code == 0){
          let orderId = data.result.order_id;
          return { status: true, orderId }
        }else{
          console.log(data)
          return { status: false }
      }
}

exports.setTrailingStop = async (symbol, side, callbackRate) => {
    let { pricePercision } = await this.getIncrements(symbol)
    let { lastPrice } = await this.getLastPrice(symbol)
    let callbackPrice;
    callbackPrice = divide(multiply(lastPrice, callbackRate), 100).toFixed(pricePercision)
    let params = {
        side, symbol, trailing_stop: callbackPrice,       
        timestamp: Date.now().toString(),
        api_key : apiKey,
        recv_window: 50000,
      };
      params["sign"]=  getSignature(params,apiSecret);
      let {data} = await axios.post(`${baseUrl}/private/linear/position/trading-stop`, params)
      console.log(data)
      let { ret_code } = data
      if(ret_code == 0){
          return { status: true }
      }else{
        return { status: false }
      }
} 

cron.schedule('13 30 */4 * * *', async () => {
    console.log('running a task every 4 hour ');
    telegram.sendAdminMessage("update kline every 4 hour")
    // this.fillDatabase();
});