const request = require('request');
const mysql = require('mysql');
const hexToDec = require('hex-to-dec');

var options = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tret',
    expiration: 1000*60*60*24*30*12
};

const db = mysql.createConnection(options);

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});

module.exports.notifyCount = async function (username){
    
    let query = "SELECT * FROM `notification` WHERE `id_user` = '"+username+"' AND `status` = 0";
    db.query(query,(err,result)=>{
        if(err){
            return 0;
        }
        else{
            return "Test";//result.length;
        }
    });
}

