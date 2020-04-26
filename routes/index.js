var express = require('express');
var router = express.Router();
var pdf = require("pdf-creator-node");
const fs = require('fs');
var html = fs.readFileSync('./template.html', 'utf8');
var options = {
  format: "A3",
  orientation: "portrait",
  border: "10mm",
  header: {
    height: "45mm",
    contents: '<div style="text-align: center;">Author: NGUdbhav</div>'
  },
  "footer": {
    "height": "28mm",
    "contents": {
      first: 'Cover page',
      2: 'Second page', // Any page number is working. 1-based index
      default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
      last: 'Last Page'
    }
  }
};
const pool = require('../db.js');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault('Asia/Kolkata');
let threshold = new Date(moment().hours(9).minutes(30).seconds(0)._d).toISOString().slice(0, 19).replace('T', ' ');
let minimum = new Date(moment().hours(9).minutes(0).seconds(0)._d).toISOString().slice(0, 19).replace('T', ' ');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/output', (req, res, next) => {
  pool.getConnection(function (error, db) {
    if (error) throw error;
    else {
      db.query('Select * from 9s where status = 1', (error, results) => {
        if (error) throw error;
        else {
          db.release();
          var document = {
            html: html,
            data: {
              users: results
            },
            path: "../output.pdf"
          };
          pdf.create(document, options)
            .then(resi => {
              res.download('../output.pdf');
            })
            .catch(error => {
              console.error(error)
            });
        }
      });
    }
  });
});

router.post('/markAttendance', (req, res, next) => {
  let name = req.body.name.toUpperCase();
  let time = req.body.time
  //Allow Attendance Mark before 9:30 AM and after 9:00 AM everyday 
  if (time <= threshold && time >= minimum){
    pool.getConnection(function (error, db) {
      if (error) throw error;
      else{
        db.query(`Select id, status from 9s where Name like ?`, `%${name}%`, (error, results) => {
          if (error) throw error;
          else {
            if (results.length) {
              let attendanceStatus = results[0].status;

              //Already attendance marked
              if (attendanceStatus) {
                res.send('Your Attendance is already marked!');
                db.release();
              }
              else {
                db.query('update 9s set status = 1, time = ? where id = ?', [time, results[0].id], (error, results) => {
                  if (error) throw error;
                  else {
                    res.send('Attendance Successfully marked!');
                    db.release();
                  }
                });
              }
            }
            else {
              res.send('No Student found with the name. Make sure you type the name as per the school records!');
              db.release();
            }
          }
        });
      }
    });
  }
  else{
    res.send('Attendance Marking is only allowed till 9:30 PM.');
  }
});

module.exports = router;
