const url              = require('url');
const WebSocket        = require('ws');
const crypto           = require('crypto');
const { createClient } = require('redis')
const Setting          = require('./../../models/Setting')
require('dotenv').config()
let redisClient = new createClient({
    url: 'redis://localhost',
    socket: {
      port: process.env.redisPort
    },
    password: process.env.redisPassword
})
const Symbol           = require("./../../models/Symbol")
const Kline            = require('./../../models/Kline')
const endpoint         = "wss://stream.bytick.com/realtime_public"
redisClient.connect()
const {multiply, divide, format, pow, subtract, log, add, largerEq, smallerEq, smaller, fraction, equalText, equal} = require('mathjs');
var client = new WebSocket(endpoint);
let interval;
client.on('open', async function () {
    let [{timeframes}] = await Setting.find().select(['-_id']);
    interval = timeframes
	console.log('Connected To Kline Socket Server');
	setInterval(()=>{client.ping()}, 30000);
	client.ping();
    let symbols = await Symbol.find();
    let argsArray = []
    symbols.forEach(symbol => {
        argsArray.push(`candle.${interval.short}.${symbol.name}`)
        argsArray.push(`candle.${interval.trade}.${symbol.name}`)
        argsArray.push(`candle.${interval.long}.${symbol.name}`)
    });
	client.send(JSON.stringify({"op": "subscribe", "args": argsArray}));
});

client.on('message', async function (e) {
	e = JSON.parse(e);
    try{
        let { topic, data } = e;
        let symbol = topic.split(".")[2]
        let { period, start, end, open, close, high, low, volume, turnover, confirm, cross_seq } = data[0]
        data[0].symbol = symbol
        
        if(global.saveKline){            
            let key = `kline-${symbol}-${period}-${start}`;
            
            let count;
            if( period == interval.trade){
                count = 120
                global.lastTradeIntervalStartTime = start
            }else if(period == interval.long){
                count = 120;
                global.lastLongIntervalStartTime = start;
            }else if(period == interval.short){
                count = 200;
                global.lastShortIntervalStartTime = start;
            }
            // let ex;
            // if(period == "D"){
            //     ex = 60 * 1440 * count;
                
            // }else{
            //     ex = 60 * period * count;
            // }
            let result = await redisClient.set(key, JSON.stringify( { symbol, period, start, end, open, close, high, low, volume, turnover, confirm, cross_seq } ));
            // let result = await Kline.findOne({symbol, start, period})
            // if(result != null){
                
            //     await Kline.findOneAndUpdate({ symbol, period, start }, { $set: { open, close, high, low, volume, turnover, confirm, cross_seq } })
            // }else{
            //     await Kline.create({ symbol, period, start, end, open, close, high, low, volume, turnover, confirm, cross_seq })
            // }
            // try{
            //     await Kline.findOneAndUpdate({ symbol, period, start }, { $set: { open, close, high, low, volume, turnover, confirm, cross_seq } })
            // }catch(err){
            //     await Kline.create({ symbol, period, start, end, open, close, high, low, volume, turnover, confirm, cross_seq })
            // }
        }


        
    }catch(err){

    }

    
});
client.on('ping', function (data, flags) {
	// console.log("ping received");
});
client.on('pong', function (data, flags) {
	// console.log("pong received");
});