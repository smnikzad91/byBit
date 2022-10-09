const ichimoku = require('./../libs/analyses/ichimoku')
const bybit = require('./../libs/exchange/bybit')
let kline = require('./../libs/analyses/kline')
const  {IchimokuCloud}  = require('technicalindicators')

exports.getTest = async (req, res) => {
    let { symbol, period, count } = req.query;
    // let data = await bybit.getLocalKlines(symbol, period, count)

    // console.log(data)
    // let {lastPrice} = await bybit.getLastPrice(symbol)

    let result = await bybit.addMissingKline(symbol, period, count)
    // console.log(result)

    


    res.json({ status: true, result: "haha" })
}

exports.getLastParam = async (req, res) => {
    let { symbol, period } = req.query
    let params = await ichimoku.getLastParam(symbol, period)

    res.json({ status: true, params })
}