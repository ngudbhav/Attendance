var express = require('express');
var router = express.Router();
const db = require('../db.js');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault('Asia/Kolkata');
let threshold = new Date(moment().hours(9).minutes(30).seconds(0)._d).toISOString().slice(0, 19).replace('T', ' ');
let minimum = new Date(moment().hours(9).minutes(0).seconds(0)._d).toISOString().slice(0, 19).replace('T', ' ');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/markAttendance', (req, res, next) => {
  let name = req.body.name.toUpperCase();
  let time = req.body.time
  //Allow Attendance Mark before 9:30 AM everyday 
  if (time <= threshold && time >= minimum){
    db.query(`Select id, status from 9s where Name like ?`, `%${name}%`, (error, results) => {
      if (error) throw error;
      else {
        if (results.length) {
          let attendanceStatus = results[0].status;

          //Already attendance marked
          if (attendanceStatus) {
            res.send('Your Attendance is already marked!');
          }
          else {
            db.query('update 9s set status = 1, time = ? where id = ?', [time, results[0].id], (error, results) => {
              if (error) throw error;
              else {
                res.send('Attendance Successfully marked!');
              }
            });
          }
        }
        else {
          res.send('No Student found with the name. Make sure you typed the name as per the school records!');
        }
      }
    });
  }
  else{
    res.send('Attendance Marking is only allowed till 9:30 PM.');
  }
});

module.exports = router;
