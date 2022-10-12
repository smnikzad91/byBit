const createError   = require('http-errors');
const express       = require('express');
const path          = require('path');
const cookieParser  = require('cookie-parser');
const logger        = require('morgan');
const mongoose      = require('mongoose');
const exchange      = require('./libs/exchange/bybit')
const { checkUser } = require('./middlewares/authMiddleware')
require('dotenv').config()

exchange.fillDatabase();
global.saveKline = true; 
// global.shouldTrade = false;
// global.saveKline = false;




mongoose.connect(`mongodb://${process.env.dbAddress}:${process.env.dbPort}/${process.env.dbName}?authSource=${process.env.dbAuthSource}`, { auth: {username: process.env.dbUserName, password: process.env.dbPassword}, useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log(`connected to mongodb`))
    .catch(err => console.log(err));



const { createClient }    = require('redis')
let client = new createClient({
  url: 'redis://localhost',
  socket: {
    port: process.env.redisPort
  },
  password: process.env.redisPassword
})
client.connect()



const symbolRouter   = require('./routes/symbolRouter')
const alarmRouter    = require('./routes/alarmRouter')
const ichimokuRouter = require('./routes/ichimokuRouter');
const orderRouter    = require('./routes/orderRouter')
const authRoutes     = require('./routes/authRoutes')
const testRouter     = require('./routes/testRouter')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(symbolRouter)
app.use(alarmRouter);
app.use(ichimokuRouter)
app.use(orderRouter)
app.use(authRoutes);
app.use(testRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(10000, console.log("server is running"))
// require('./libs/socket/position')
// require('./libs/socket/order')
require('./libs/socket/kline')
// require('./libs/socket/execution')


module.exports = app;
  