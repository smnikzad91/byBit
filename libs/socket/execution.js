var url = require('url');
var WebSocket = require('ws');
var crypto = require('crypto');
var endpoint = "wss://stream.bytick.com/realtime_private"
// console.log('attempting to connect to WebSocket %j', endpoint);
var client = new WebSocket(endpoint);
const apiKey = "pKLZp97HMLSpJ18qYh"
const apiSecret = "4sZCmHvedwAr7RlnqS1xZ02wx26Qbx4OhD7M"
client.on('open', function () {
  console.log('Connected To Execution Socket Server');
	const expires = new Date().getTime() + 10000;
	const signature = crypto.createHmac("sha256", apiSecret).update("GET/realtime" + expires).digest("hex");
	const payload={
		op: "auth",
		args: [apiKey, expires.toFixed(0), signature],
	}
	client.send(JSON.stringify(payload));
	setInterval(()=>{client.ping()}, 30000);
	client.ping();
	client.send(JSON.stringify({"op": "subscribe", "args": ['execution']}));
});

client.on('message', function (e) {
    let data = JSON.parse(e)
    // console.log(data)
});
client.on('ping', function (data, flags) {
	
});
client.on('pong', function (data, flags) {
	
});
/*

{
  user_id: '29827782',
  symbol: 'BTCUSDT',
  size: 0.001,
  side: 'Sell',
  position_value: 22.277,
  entry_price: 22277,
  liq_price: 24393,
  bust_price: 24504.5,
  leverage: 10,
  order_margin: 0,
  position_margin: 2.242403,
  occ_closing_fee: 0.0147027,
  take_profit: 0,
  tp_trigger_by: 'UNKNOWN',
  stop_loss: 0,
  sl_trigger_by: 'UNKNOWN',
  trailing_stop: 25,
  realised_pnl: -0.0133662,
  auto_add_margin: '0',
  cum_realised_pnl: -9.898244,
  position_status: 'Normal',
  position_id: '0',
  position_seq: '65599',
  adl_rank_indicator: '2',
  free_qty: 0,
  tp_sl_mode: 'Full',
  risk_id: '1',
  isolated: true,
  mode: 'BothSide',
  position_idx: '2'
}
{
  topic: 'execution',
  data: [
    {
      symbol: 'BTCUSDT',
      side: 'Buy',
      order_id: '1f448962-462c-404b-9797-f8e22a0cd42d',
      exec_id: 'e142c93b-a4cc-52e8-b2be-8af90bc6257f',
      order_link_id: '',
      price: 22270,
      order_qty: 0.001,
      exec_type: 'Trade',
      exec_qty: 0.001,
      exec_fee: 0.013362,
      leaves_qty: 0,
      is_maker: false,
      trade_time: '2022-07-18T09:52:55.553040Z'
    }
  ]
}
{
  user_id: '29827782',
  symbol: 'BTCUSDT',
  size: 0,
  side: 'Sell',
  position_value: 0,
  entry_price: 0,
  liq_price: 0,
  bust_price: 0,
  leverage: 10,
  order_margin: 0,
  position_margin: 0,
  occ_closing_fee: 0,
  take_profit: 0,
  tp_trigger_by: 'UNKNOWN',
  stop_loss: 0,
  sl_trigger_by: 'UNKNOWN',
  trailing_stop: 0,
  realised_pnl: -0.0197282,
  auto_add_margin: '0',
  cum_realised_pnl: -9.904606,
  position_status: 'Normal',
  position_id: '0',
  position_seq: '65600',
  adl_rank_indicator: '0',
  free_qty: 0,
  tp_sl_mode: 'Full',
  risk_id: '1',
  isolated: true,
  mode: 'BothSide',
  position_idx: '2'
}
{
  user_id: '29827782',
  symbol: 'BTCUSDT',
  size: 0,
  side: 'Buy',
  position_value: 0,
  entry_price: 0,
  liq_price: 0,
  bust_price: 0,
  leverage: 10,
  order_margin: 0,
  position_margin: 0,
  occ_closing_fee: 0,
  take_profit: 0,
  tp_trigger_by: 'UNKNOWN',
  stop_loss: 0,
  sl_trigger_by: 'UNKNOWN',
  trailing_stop: 0,
  realised_pnl: 0,
  auto_add_margin: '0',
  cum_realised_pnl: -1.7379767,
  position_status: 'Normal',
  position_id: '0',
  position_seq: '55357',
  adl_rank_indicator: '0',
  free_qty: 0,
  tp_sl_mode: 'Full',
  risk_id: '1',
  isolated: true,
  mode: 'BothSide',
  position_idx: '1'
}
{
  topic: 'order',
  action: '',
  data: [
    {
      order_id: '1f448962-462c-404b-9797-f8e22a0cd42d',
      order_link_id: '',
      symbol: 'BTCUSDT',
      side: 'Buy',
      order_type: 'Market',
      price: 23382.5,
      qty: 0.001,
      leaves_qty: 0,
      last_exec_price: 22270,
      cum_exec_qty: 0.001,
      cum_exec_value: 22.27,
      cum_exec_fee: 0.013362,
      time_in_force: 'ImmediateOrCancel',
      create_type: 'CreateByTrailingStop',
      cancel_type: 'UNKNOWN',
      order_status: 'Filled',
      take_profit: 0,
      stop_loss: 0,
      trailing_stop: 25,
      create_time: '2022-07-18T09:50:21.361258085Z',
      update_time: '2022-07-18T09:52:55.556518213Z',
      reduce_only: true,
      close_on_trigger: true,
      position_idx: '2'
    }
  ]
}

*/