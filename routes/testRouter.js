const { Router } = require('express')
const router = Router();

const kline = require('./../libs/analyses/kline')
const bybit = require('./../libs/exchange/bybit')


router.get('/test/extermums', async ( req, res ) => {

    bybit.getCandles("BTCUSDT", 30, 2).then((data) => {
        console.log(data)
    })


    res.json({ status: true, message: "test router" })
})


module.exports = router;