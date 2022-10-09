var url = require('url');
var WebSocket = require('ws');
var crypto = require('crypto');
const bybit = require('./../exchange/bybit')
const kline = require('./../analyses/kline')
const telegram = require('./../telegram')
var endpoint = "wss://stream.bytick.com/realtime_private"
// console.log('attempting to connect to WebSocket %j', endpoint);
var client = new WebSocket(endpoint);
const apiKey = "pKLZp97HMLSpJ18qYh"
const apiSecret = "4sZCmHvedwAr7RlnqS1xZ02wx26Qbx4OhD7M"
client.on('open', function () {
  console.log('Connected To Order Socket Server');
	const expires = new Date().getTime() + 10000;
	const signature = crypto.createHmac("sha256", apiSecret).update("GET/realtime" + expires).digest("hex");
	const payload={
		op: "auth",
		args: [apiKey, expires.toFixed(0), signature],
	}
	client.send(JSON.stringify(payload));
	setInterval(()=>{client.ping()}, 30000);
	client.ping();
	client.send(JSON.stringify({"op": "subscribe", "args": ['order']}));
});

client.on('message', async e => {
    let response = JSON.parse(e)
    try{
      let { data: orders } = response
      orders.forEach(async order => {
        let { create_type, order_status } = order;
        if( create_type == "CreateByTrailingStop" && order_status == "Filled" ){
          let { symbol, side, qty } = order;
          console.log(`trailing stop activated, new position with: ${symbol} ${side} ${qty}`)
          let  {buffer}  = await kline.getBuffer(symbol)    
          console.log(buffer)
          buffer *= 3;
          telegram.sendAdminMessage(`trailing stop activated, new position with: ${symbol} ${side} ${buffer} `)
          // await bybit.placeMarketOrder(side, symbol, qty)       
          // setTimeout(async () => {
          //   console.log(await bybit.setTrailingStop(symbol, side, buffer))          
          // }, 1000)   
        }
      })

    }catch (err) {
      console.log("check order socket data failed")
    }

});
client.on('ping', function (data, flags) {
	
});
client.on('pong', function (data, flags) {
	
});





/*

{
  topic: 'order',
  action: '',
  data: [
    {
      order_id: '66f942e6-c373-43cc-8344-aba28dcc42d3',
      order_link_id: '',
      symbol: 'USDCUSDT',
      side: 'Buy',
      order_type: 'Market',
      price: 1.05,
      qty: 100,
      leaves_qty: 0,
      last_exec_price: 1.0002,
      cum_exec_qty: 100,
      cum_exec_value: 100.02,
      cum_exec_fee: 0.060012,
      time_in_force: 'ImmediateOrCancel',
      create_type: 'CreateByTrailingStop',
      cancel_type: 'UNKNOWN',
      order_status: 'Filled',
      take_profit: 0,
      stop_loss: 0,
      trailing_stop: 0.0001,
      create_time: '2022-07-14T12:48:13.878233024Z',
      update_time: '2022-07-14T12:51:50.476915937Z',
      reduce_only: true,
      close_on_trigger: true,
      position_idx: '2'
    }
  ]
}

*/