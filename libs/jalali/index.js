const jalali = require('jalali-moment');
const moment = require('moment')

exports.persianDate = () => {
    year   = jalali().locale('fa').toArray()[0];
    month  = jalali().locale('fa').toArray()[1] + 1;
    day    = jalali().locale('fa').toArray()[2];
    hour   = jalali().locale('fa').toArray()[3];
    minute = jalali().locale('fa').toArray()[4];
    second = jalali().locale('fa').toArray()[5];
    date = `${year}/${month}/${day} ${hour}:${minute}:${second}`;  
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