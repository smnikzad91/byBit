const jalali = require('jalali-moment');
const moment = require('moment')

exports.persianDate = () => {
    let year   = jalali().locale('fa').toArray()[0];
    let month  = jalali().locale('fa').toArray()[1] + 1;
    let day    = jalali().locale('fa').toArray()[2];
    let hour   = jalali().locale('fa').toArray()[3];
    let minute = jalali().locale('fa').toArray()[4];
    let second = jalali().locale('fa').toArray()[5];
    let date = `${year}/${month}/${day} ${hour}:${minute}:${second}`;  
    return {date, year, month, day, hour, minute, second}   
}


exports.gregorianDate = () => {
    let second = moment().second();
    let minute = moment().minute();
    let hour = moment().hour();
    let day = moment().day() + 1;
    let month = moment().month() + 1;
    let year = moment().year();
    let date = `${year}/${month}/${day}-${hour}:${minute}:${second}`;
    return { second, minute, hour, day, month, year, date }
}