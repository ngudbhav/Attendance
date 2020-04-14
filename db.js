let mysql = require('mysql');

let connection = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'ngudbhav',
        database: 'attendance'
    }
);

connection.connect();
console.log('Database Connected!');

module.exports = connection;