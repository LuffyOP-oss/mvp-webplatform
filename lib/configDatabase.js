const mysql = require('mysql');

var options = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tret',
    expiration: 1000*60*60*24*30*12
};

const db = mysql.createConnection(options);