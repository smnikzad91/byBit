const mosca = require('mosca')
const server = new mosca.Server({ port:1369 })
const assist = require('./../devices/assist')

// const ltokenController = require('./../../controllers/lTokenContrroler')
exports.publish = (topic, payload) => {
  let message = {
    topic, payload: JSON.stringify(payload),
    qos: 0, 
    retain: false 
  };
  
  server.publish(message, function() {
    // console.log('done!');
  });
}

// setTimeout(() => {
//   publish("assist", { command: "condition", symbol: "MATIC", condition: "below" })
  
// }, 7000);


server.on('clientConnected', function(client) {
    console.log('client connected', client.id);
});


server.on('clientDisconnected', function(client) {
  console.log('client DisConnected', client.id);
});

// fired when a message is received
server.on('published', function(packet, client) {
  if(client){
    let payload = packet.payload.toString();
    if(packet.topic === "joy"){
      if(payload === "BUY"){
        // ltokenController.joyBuy();
        console.log("Buy")
      }else if( payload === "SELL" ){
        // ltokenController.joySell();
        console.log("Sell")
      }
    }else if(packet.topic == "sendAuthCode"){
      let { authCode, authNumber: number } = JSON.parse(payload)
      let message = `Hi dear.\nUse the following code for authenticate!\nCode: ${authCode}`
      console.log({ number, message })
      assist.sendMessage(number, message)
    }
    
  }
  
});

server.on('ready', setup);
function setup() {
  console.log('Mosca server is up and running');
}

