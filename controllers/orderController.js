const bybit = require('./../libs/exchange/bybit')
const kline = require('./../libs/analyses/kline')

exports.getTest = async (req, res) =>{

    // let leverageResponse = await bybit.setLeverage("BTCUSDT", 7);
    // let orderResponse = await bybit.marketSell("BTCUSDT", 0.005)
    // let orderResponse = await bybit.setTrailingStop("BTCUSDT", "Sell", 0.2)
    await kline.getQty("BTCUSDT", 5, 11)
    res.json({status: true})
}