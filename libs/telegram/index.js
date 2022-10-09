const TelegramBot = require('node-telegram-bot-api');
let { persianDate } = require('./../jalali')

const token = "5012280019:AAH9_d0eBpSNldx2oSaiirCPkVtqo0vKfyo"
const bot = new TelegramBot(token, {polling: true});
const adminId = 576170170
const channelId = -1001751759895 ;
const adminId2 = 43452740

bot.on('message', (msg) => {
    let chatId = msg.chat.id;  
    bot.sendMessage(chatId, 'Please Do Not Message Me!');
});

exports.sendAdminMessage = message => {
    bot.sendMessage(adminId, message);
    bot.sendMessage(adminId2, message);
}

exports.sendSignal = (symbol, side, entry, stopLossStopPrice, stopLossLimitPrice, activationPrice, callbackRate, longR2R, shortR2R, buffer, leverage, target) => {
    let emoji = "";
    if(side == "buy"){
        emoji = "📗"
    }else{
        emoji = "📕"
    }
    bot.sendMessage(channelId, `🔊 New order !\n${emoji} ${side} ${symbol}\n🔓 Entry: ${entry}\n🏹 Target: ${target}\n🎚 Leverage: ${leverage}
🔀 Callback Rate: ${callbackRate}%\n⏰ ${persianDate().date}`)
}