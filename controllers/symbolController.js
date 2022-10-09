const Setting   = require('./../models/Setting')
const Symbol    = require('./../models/Symbol')
const Alarm     = require('./../models/Alarm')
const kline     = require('./../libs/analyses/kline')
const telegram  = require('./../libs/telegram')
const bybit     = require('./../libs/exchange/bybit')
const {CronJob} = require('cron')



exports.getTest = async (req, res) => {
    // let data = await bybit.getLocalKlines()
    res.json({ status: true, message: "test ok" })
}

exports.getBestForLong = async (req, res) => {
    let symbols = await Symbol.find().sort('-longR2R')
    // let symbols = await kline.getExtermum("ETCUSDT", 30, 100)
    res.json({ status: true, symbols })
}

exports.getIndex = async (req, res) => {
    let symbols = await Symbol.find();

    res.render('symbol/index', { symbols })
}




exports.refresh = () => {
    Alarm.deleteMany({ type: "static" }, () => {
        Setting.findOne( {  }, (err, {timeframes}) => {
            Symbol.find( {  }, (err, ltokens) => {
                ltokens.forEach(ltoken => {
                    try{
                        let { name: symbol } = ltoken
                        kline.getExtermum(symbol, timeframes.trade, 100).then((result) => {
                            if(result.status){
                                try{
                                    let { max, min, highPercent, lowPercent, longR2R, shortR2R } = result
                                    Symbol.updateOne({ name: symbol }, { $set: { min, max, highPercent, lowPercent, longR2R, shortR2R } }).then(() => {
                                        let shouldMessage;
                                        if(symbol.substring(0, symbol.length - 4) == "BTC"){
                                            shouldMessage = true
                                        }else{
                                            shouldMessage = false;
                                        }
                                        Alarm.create({ symbol, condition: 'above', price: max, isEnabled: true, shouldCall: false, shouldMessage, type: "static" }).then(() => {
                                            Alarm.create({ symbol, condition: 'below', price: min, isEnabled: true, shouldCall: false, shouldMessage, type: "static" })
                                        })
                                    })
                                }catch(e){
                                    // cosole.log(e)
                                }
                            }else{
                                // console.log(result)
                            }
                        })     
                    }catch(e){
                        // console.log(e)
                    }
                })
            });

        })

    });
}

setTimeout(() => {


        // this.refresh();
        setTimeout(() => {
            // global.shouldTrade = true;
        }, 1000)
  
}, 2000)


let job1 = new CronJob('3 0 * * * *', () => {
    console.log(`Refresh Extermums`)
    telegram.sendAdminMessage("Refresh Extermums")
    global.shouldTrade = false;
    setTimeout(() => {
        this.refresh();
        setTimeout(() => {
            global.shouldTrade = true;
        }, 1000)
    }, 3500)
})
let job2 = new CronJob('3 30 * * * *', () => {
    console.log(`Refresh Extermums`)
    telegram.sendAdminMessage("Refresh Extermums")
    global.shouldTrade = false;
    setTimeout(() => {
        this.refresh();
        setTimeout(() => {
            global.shouldTrade = true;
        }, 1000)
    }, 3500)
})


// job1.start();
// job2.start();