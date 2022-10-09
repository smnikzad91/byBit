let {multiply, divide, format, pow, subtract, log, add, largerEq, smallerEq, smaller, larger} = require('mathjs');
const bybit = require('./../exchange/bybit')
const Setting = require('./../../models/Setting')

exports.type = async ({oArray, cArray}) => {
    let length = oArray.length
    let types = []
    for(let i=0; i<length; i++){
        if(largerEq(cArray[i], oArray[i])){
            types.push("bulish")
        }else{
            types.push("bearish")
        }
    }
    return { status: true, types }
}

exports.closeType = async ({oArray, cArray, hArray, lArray}) => {
    let closeType = [], bodyPercentArray=[], highShadowPercentArray=[], lowShadowPercentArray=[], klineDistance, bodyDistance, highShadowDistance, lowShadowDistance, bodyPercent, highShadowPercent, lowShadowPercent;
    let step;
    cArray.forEach((close, index) => {
        let klineDistance = subtract(hArray[index], lArray[index])
            step = divide(klineDistance, 3);
            if(largerEq(close, lArray[index]) && smaller(close, add(lArray[index], step))){
                closeType.push("lowClose")
            }else if(largerEq(close, add(lArray[index], step)) && smaller(close, subtract(hArray[index], step))){
                closeType.push("midClose")
            }else{
                closeType.push("highClose")
            }
    })
    return { status: true, data: {closeType} }
}

exports.getBuffer = async (symbol) => {
    try{
        let [{timeframes}] = await Setting.find().select(['-_id']);
        let { klines } = await bybit.getLocalKlines(symbol, timeframes.trade, 4)
        let { oArray, cArray, hArray, lArray } = klines
        let bodyPercentArray=[], highShadowPercentArray=[], lowShadowPercentArray=[], bodyPercent, highShadowPercent, lowShadowPercent;
        let {types} = await this.type({ oArray, cArray })
        types.forEach((type, index) => {
            if(type == "bulish"){        
                bodyPercent = multiply(divide(subtract(cArray[index], oArray[index]), oArray[index]), 100).toFixed(8)
                highShadowPercent = multiply(divide(subtract(hArray[index], cArray[index]), cArray[index]), 100).toFixed(8)
                lowShadowPercent = multiply(divide(subtract(oArray[index], lArray[index]), lArray[index]), 100).toFixed(8)
                bodyPercentArray.push(bodyPercent)
                highShadowPercentArray.push(highShadowPercent);
                lowShadowPercentArray.push(lowShadowPercent);
            }else if(type == "bearish"){            
                bodyPercent = multiply(divide(subtract(oArray[index], cArray[index]), cArray[index]), 100).toFixed(8)
                highShadowPercent = multiply(divide(subtract(hArray[index], oArray[index]), oArray[index]), 100).toFixed(8)
                lowShadowPercent = multiply(divide(subtract(cArray[index], lArray[index]), lArray[index]), 100).toFixed(8)
                bodyPercentArray.push(bodyPercent)
                highShadowPercentArray.push(highShadowPercent);
                lowShadowPercentArray.push(lowShadowPercent);
            }
        })
        let maxBody = Math.max.apply(Math, bodyPercentArray)
        let shadows = highShadowPercentArray.concat(lowShadowPercentArray);
        shadows.sort().reverse();
        let maxShadow = shadows[0];
        let buffer = divide(maxShadow, 9).toFixed(4);
        return { status: true, buffer }
    }catch(err){
        return { status: false }
    }
}

exports.getExtermum = async (symbol, interval, count) => {
    try{
        let candles = await bybit.getLocalKlines(symbol, interval, count)
        let { status } = candles
        if(status){
            let { cArray } = candles.klines
            let {lastPrice} = await bybit.getLastPrice(symbol)
            let max = Math.max( ...cArray );
            let min = Math.min( ...cArray );
            let highDistance = max - lastPrice;
            let lowDistance  = lastPrice - min;
            let highPercent  = await multiply(divide(highDistance, max), 100).toFixed(2);
            let lowPercent   = await multiply( divide(lowDistance, min), 100).toFixed(2);
            let longR2R      = await divide(lowPercent, highPercent).toFixed(2)
            let shortR2R     = await divide(highPercent, lowPercent).toFixed(2)
            return { status: true, max, min, highPercent, lowPercent, longR2R, shortR2R }
        }else{
            return { status: false }
        }
    }catch(err){
        return { status: false }
    }
}

exports.calculatePositionParameters = async (symbol, side) => {
    let callbackRate, stopLossStopPrice, stopLossLimitPrice, activationPrice;
    let [{timeframes}] = await Setting.find().select(['-_id']);
    let { pricePercision } = await bybit.getIncrements(symbol)
    let { buffer } = await this.getBuffer(symbol)
    let extermumInfo = await this.getExtermum(symbol, timeframes.short, 180)
    let { min, max, highPercent, lowPercent, longR2R, shortR2R } = extermumInfo;

    if(side == "buy"){
        callbackRate = parseFloat(multiply(parseFloat(buffer), 15)).toFixed(2);
        stopLossStopPrice = parseFloat(subtract(parseFloat(min), divide(multiply(parseFloat(min), parseFloat(callbackRate)), 100))).toFixed(pricePercision);
        stopLossLimitPrice = min.toFixed(pricePercision);
        activationPrice = parseFloat(subtract(parseFloat(max), divide(multiply(parseFloat(max), parseFloat(buffer * 2)), 100))).toFixed(pricePercision);
    }else if(side == "sell"){
        callbackRate = parseFloat(multiply(parseFloat(buffer), 15)).toFixed(2);
        stopLossStopPrice = parseFloat(add(parseFloat(max), divide(multiply(parseFloat(max), parseFloat(callbackRate)), 100))).toFixed(pricePercision);
        stopLossLimitPrice = max.toFixed(pricePercision);
        activationPrice = parseFloat(add(parseFloat(min), divide(multiply(parseFloat(min), parseFloat(buffer * 2)), 100))).toFixed(pricePercision);
    }else{
        return { status: false }
    }
    return { status: true, stopLossStopPrice, stopLossLimitPrice, activationPrice, callbackRate, highPercent, lowPercent, longR2R, shortR2R  }
}

exports.getQty = async (symbol, margin, leverage) => {
    try{
        let { volumePercision } = await bybit.getIncrements(symbol);
        let { lastPrice } = await bybit.getLastPrice(symbol);
        // let volume = divide(multiply(margin, leverage), lastPrice)
        let volume = (margin * leverage) / lastPrice;
        // let qty = multiply(Math.floor(divide(volume, volumePercision)), volumePercision)
        let qty = Math.floor((volume / volumePercision)) * volumePercision
        try{
            qty = String(qty)
            let qtyArr = qty.split('.')
            if(qtyArr[1].length > 10){
                qty = parseFloat(qty)
                qty = qty.toFixed(1)
            }
        }catch(err){ 
            console.log(err)
         }

        return { status: true, qty }
    }catch(err){
        return { status: false }
    }
}