var url = require('url');
var WebSocket = require('ws');
var crypto = require('crypto');
var endpoint = "wss://stream.bytick.com/realtime_private"
// console.log('attempting to connect to WebSocket %j', endpoint);
var client = new WebSocket(endpoint);
const apiKey = "pKLZp97HMLSpJ18qYh"
const apiSecret = "4sZCmHvedwAr7RlnqS1xZ02wx26Qbx4OhD7M"
client.on('open', function () {
	console.log('Connected To Position Socket Server');
	const expires = new Date().getTime() + 10000;
	const signature = crypto.createHmac("sha256", apiSecret).update("GET/realtime" + expires).digest("hex");
	const payload={
		op: "auth",
		args: [apiKey, expires.toFixed(0), signature],
	}
	client.send(JSON.stringify(payload));
	setInterval(()=>{client.ping()}, 30000);
	client.ping();
	client.send(JSON.stringify({"op": "subscribe", "args": ['position']}));
});

client.on('message', function (e) {
    let response = JSON.parse(e)
    try{
		let { action } = response
		if(action == "update"){
			let { data: positions } = response;
			positions.forEach(async position => {
				// console.log(position)
			})
		}

	}catch(err){}
});
client.on('ping', function (data, flags) {
	// console.log("ping received");
});
client.on('pong', function (data, flags) {
	// console.log("pong received");
});