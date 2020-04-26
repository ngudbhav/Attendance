var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var CronJob = require('cron').CronJob;
const pool = require('./db');
const accountSid = 'AC321211839a160ac721af1194062778e6';
const authToken = 'ff2912cca4051e94e9cab173a28ba8d1';
const client = require('twilio')(accountSid, authToken);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

var job = new CronJob(
  '* 30 9 * * *',
  function () {
    console.log('execute');
    client.messages
      .create({
        from: 'whatsapp:+14155238886',
        body: 'Generate your report here: https://nosegay-attendance.herokuapp.com/output',
        to: 'whatsapp:+917014878106'
      }).then((message) => {
        console.log(message.sid);
      }).catch((error) => {
        console.log(error);
        throw error;
      });
  },
  null,
  true,
  'Asia/Kolkata'
);
job.start();

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
