var socket = io();
let usdtSellPrice = 0;
let usdtBuyPrice = 0;
socket.on("usdtPrice", price => {
  usdtSellPrice = JSON.parse(price).sell;
  usdtBuyPrice = JSON.parse(price).buy;
  let buy = document.querySelector('.usdtBuy');
  let sell = document.querySelector('.usdtSell');
  buy.innerText = JSON.parse(price).buy.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  sell.innerText = JSON.parse(price).sell.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
})
socket.on("top10", data => {
  let {symbol, price, volume, priceChange} = data;
  if(symbol == "BTCUSDT" || symbol == "ETHUSDT" || symbol=="DOGEUSDT" || symbol=="ETCUSDT" || symbol == "BCHUSDT" || symbol=="LTCUSDT" || symbol=="TRXUSDT" || symbol=="BNBUSDT" || symbol=="XRPUSDT"){
    let priceContainer = document.querySelector(`.crypto-currency-bar .${symbol} .col-price .dollar`);
    let tomanBuyPriceContainer = document.querySelector(`.crypto-currency-bar .${symbol} .col-price .buy-price`)
    let tomanSellPriceContainer = document.querySelector(`.crypto-currency-bar .${symbol} .col-price .sell-price`)
    let changeContainer = document.querySelector(`.crypto-currency-bar .${symbol} .col-change`)
    let volumeContainer = document.querySelector(`.crypto-currency-bar .${symbol} .col-volume`);

    priceContainer.innerText = '$ ' + price;
    volumeContainer.innerText = '$ ' + volume.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    tomanBuyPriceContainer.innerText = 'IRT ' + Math.round(price * usdtSellPrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    tomanSellPriceContainer.innerText = 'IRT ' + Math.round(price * usdtBuyPrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    changeContainer.innerText = priceChange + '%';
    if(priceChange > 0){
      changeContainer.classList.add('green')
      changeContainer.classList.remove('red')
    }else{
      changeContainer.classList.add('red')
      changeContainer.classList.remove('green')
    }
  }

});
updatePrice = () => {
fetch("https://shayannikzad.ir/usdtprice").then(res => res.json()).then(data => {
  let buy = document.querySelector('.usdtBuy');
  let sell = document.querySelector('.usdtSell');
  buy.innerText = data.buy.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  sell.innerText = data.sell.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") 
}).catch(err => console.log(err));
}