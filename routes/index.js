var express = require('express');
const crypto = require('crypto');
const axios = require('axios').default;
var router = express.Router();
const baseUrl = "https://api.bybit.com"
const apiKey = "pKLZp97HMLSpJ18qYh"
const apiSecret = "4sZCmHvedwAr7RlnqS1xZ02wx26Qbx4OhD7M"
const Symbol = require("./../models/Symbol")
const bybit = require("./../libs/exchange/bybit");
const Setting = require('../models/Setting');
const ichimoku = require('./../libs/analyses/ichimoku')

const getSignature = (parameters, secret) => {
	var orderedParams = "";
	Object.keys(parameters).sort().forEach(function(key) {
	  orderedParams += key + "=" + parameters[key] + "&";
	});
	orderedParams = orderedParams.substring(0, orderedParams.length - 1);

	return crypto.createHmac('sha256', secret).update(orderedParams).digest('hex');
}





const test = async () => {
  var timestamp = Date.now().toString();
  var params = {
    "symbol":"BTCUSDT",
    is_isolated: true,
    buy_leverage: 44,
    sell_leverage: 22,
    // "side":"Buy",
    // trailing_stop: "80",
    // "order_type": "Market",
    // price: 20000,
    // "qty": 0.001,
    "timestamp":timestamp,
    "api_key" : apiKey,
    // "reduce_only": false,
    // close_on_trigger: false,
    // "time_in_force":"GoodTillCancel"
  };
  params["sign"]= await getSignature(params,apiSecret);

  // let {data} = await axios.get(`${baseUrl}/public/linear/kline?symbol=BTCUSDT&interval=30&from=${Math.round((Date.now() / 1000))  - ( 60 * 30 * 2)}`)
  // let {data} = await axios.get(`${baseUrl}/v2/public/symbols`)
  let {data} = await axios.post(`${baseUrl}/private/linear/position/switch-isolated`, params)
  console.log(data)
  // data.result.forEach(async (symbol, index) => {
  //   if(symbol.quote_currency == "USDT")
  //   await Symbol.create(symbol)
  //   console.log(index, symbol)
  // })
  // console.log(data.result.length)
  // let index = 0;
  // await Setting.create({ timeframes: { short: 5, trade: 30, long: 240 } })
}



// test();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/test", async (req, res) => {
  // let response = await bybit.getLastPrice("BTCUSDT")
  let response = await bybit.getLocalKlines("BTCUSDT", 5, 120);
  response = await ichimoku.getParams(response.klines)
  res.json(response)
})

router.get('/symbols', async (req, res) => {
  let symbols = await Symbol.find();
  res.json(symbols)
})

module.exports = router;
