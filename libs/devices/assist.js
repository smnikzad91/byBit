const broker =  require('./../mqtt/broker');
setTimeout(()=> {
    this.sendMessage("09119100991", "سلام")
}, 5000)

exports.sayAlarm = async (symbol, condition) => {
    broker.publish("assist", { command: "condition", symbol, condition })
}
exports.sendMessage = async (number, message) => {
    broker.publish("assist", { command: "message", number, message })
}
exports.makeCall = async (number) => {
    broker.publish("assist", { command: "call", number })
}