let mysql = require('mysql');

let connection = mysql.createPool(
    {
        host: 'us-cdbr-iron-east-01.cleardb.net',
        user: 'b0f0922903b95b',
        password: 'bad0c884',
        database: 'heroku_24009b64347e0d1'
    }
);

//connection.connect();
console.log('Database Connected!');

module.exports = connection;