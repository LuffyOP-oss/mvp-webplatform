const request = require('request');
const mysql = require('mysql');
const hexToDec = require('hex-to-dec');


var options = {
    host: '',
    user: '',
    password: '',
    database: '',
    expiration: 1000*60*60*24*30*12
};

const db = mysql.createConnection(options);

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});

const apikey = "";
const Contract = "0xc6d603a9df53d1542552058c382bf115aace70c7";


console.log("Wallet Check Run");


//Check Wallet Token
setInterval(()=>{
    
    let query_options = "SELECT * FROM `options` WHERE LIMIT 1";    
    //Get last block
    db.query(query_options,(err, result)=>{
        if(err){ console.log("Wallet error 1 : " + err.message);}else{

            let uriEvent = "https://api.etherscan.io/api?module=logs&action=getLogs";
            uriEvent += "&fromBlock="+result[0]['last_block_token_check'];
            uriEvent += "&toBlock=latest";
            uriEvent += "&address="+Contract;
            uriEvent += "&topic0=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
            uriEvent += "&apikey=" + apikey;
            var Blocknumber = 0;

            request({
                uri: uriEvent,
                method: 'GET',
                timeout: 2000 //equal 10s
            }, function(err, res, body) {
                //nếu có lỗi
                if (err){
                    console.log("Wallet error 2: "+ err.message);
                }else{
                    let result = JSON.parse(body);
                    if(result['status'] == 1){
                        let blocklength = result['result'].length;
    
                        //Kiem tra tat ca event transfer
                        for(var i =0; i < blocklength;i++){
                            //
                            let wallet = result['result'][i]['topics'][2];
                            let block = hexToDec(result['result'][i]['blockNumber']);
                            let data = hexToDec(result['result'][i]['data']);
                            let timeStamp = hexToDec(result['result'][i]['timeStamp']);
                            let transactionHash = result['result'][i]['transactionHash']
                            wallet = wallet.replace('0x000000000000000000000000','0x');
                            let query_checkWallet = "";
    
                            //Kiem tra cac event transfer co vi cua user hay khong
                            db.query(query_checkWallet,(err,result)=>{
                                if(err){ console.log("Wallet error 4: "+err.message)}else{
    
                                    //Neu có ví của user
                                    if(result.length > 0){
                                        let userid = result[0]['user_id'];
                                        let totalToken = Number(result[0]['avalible_token']);
                                        let checkTrans = "";
                                        let idWallet = result[0]['wallet_id'];
                                        data = Number(data);
                                        let tong = totalToken + data;
                                        //Kiểm tra xem tx đó đã được xác nhận chưa
                                        db.query(checkTrans,(err,result)=>{
                                            if(err){ console.log("Wallet error 5: "+ err.message)}else{
    
                                                //Ghi nhận giao dịch đến ví
                                                if(result.length <= 0){
                                                    let updatewallet = "";
                                                    let insertTrans = "";
                                                    db.query(updatewallet,(err,result)=>{});
                                                    db.query(insertTrans,(err,result)=>{
                                                        if(!err){
                                                            let insertNotifi = ""
                                                            db.query(insertNotifi,(err,result)=>{});
                                                        }
                                                    });
                                                    
                                                }
                                            }
                                        })
                                    }
                                }
                            });
                            if(Blocknumber < block)
                                Blocknumber = block;
                        }
                        //Update Block
                        if(Blocknumber !== 0){
                            let query = ""
                            db.query(query);
                        }
                    }else{
                        console.log("Wallet error 3: "+ result['message']);
                    }
                }
                //in ra header
                //console.log(res);
                //in ra body nhận được
                //console.log(body);
                
            })
        }
    })
},20000);


//Check Wallet ETH
setInterval(()=>{
    
    //Lấy địa chỉ ví
    let queryGetWallet = "";
    db.query(queryGetWallet,(err,result)=>{
        if(err){
            console.log("Balance ETH Error 1: " + err.message);
        }else{
            if(result.length > 0){
                for(var i = 0;i<result.length;i++ ){
                    let walet = result[i]['address'];
                    let UserID =  result[i]['user_id'];
                    let walet_id = result[i]['wallet_id'];
                    let uri = "https://api.etherscan.io/api?module=account&action=txlist&address="+ walet;
                    uri += "&startblock="+result[i]['blockNumber']+"&endblock=999999999&sort=asc&apikey="+apikey;
                    
                    
                    request({
                        uri: uri,
                        method: 'GET',
                        timeout: 2000 //equal 10s
                    }, function(err, res, body) {
                        //nếu có lỗi
                        if (err){
                            console.log("Balance ETH Error 2: "+ err.message);
                        }else{
                            let result = JSON.parse(body);
                            if(result['status'] == 1){
                                let a = result['result'].length;
                                let blockNb = 0;
                                if(a > 0){
                                    for(var j = 0; j < a; j++){
                                        //
                                        let input = result['result'][j]['input'];
                                        let iserror = result['result'][j]['isError'];
                                        let to = result['result'][j]['to'];
                                        let blnb = result['result'][j]['blockNumber'];
                                        let value = result['result'][j]['value'];
                                        let transactionHash = result['result'][j]['hash'];
                                        let timeStamp = result['result'][j]['timeStamp'];


                                        if( input == '0x' && iserror == 0 && to == walet){
                                            let checkTrans = "";
                                            db.query(checkTrans,(err,result)=>{
                                                if(err){ console.log("Balance ETH Error 3: "+ err.message);}else{
                                                    //Ghi nhận giao dịch đến ví
                                                    if(result.length <= 0){
                                                        let query_checkWallet = "";
                                                        //Lấy số dư hiện tại của ví
                                                        db.query(query_checkWallet,(err,result2)=>{
                                                            let eth_balan = result2[0]["eth_balance"];
                                                            let totalEth =Number( eth_balan) + Number(value);
                                                            console.log(result2);
                                                            console.log( Number( eth_balan));
                                                            console.log( Number(value));
                                                            console.log(totalEth);

                                                            console.log("-------------------");

                                                            if(err){ console.log("Balance ETH Error 5: "+err.message)}else{
                                                                let updatewallet = "";
                                                                let insertTrans = "";
                                                                
                                                                db.query(updatewallet,(err,result)=>{
                                                                    if(!err){
                                                                        db.query(insertTrans,(err,result)=>{
                                                                            if(!err){
                                                                                let insertNotifi = ""
                                                                                db.query(insertNotifi,(err,result)=>{});
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                                
                                                            }
                                                        })
                                                    }
                                                }
                                            })
                                        }
                                        blockNb = blnb;
                                    }
                                }
                                // if(blockNb !== 0){
                                //     let updatewallet = "UPDATE `wallet` SET `blockNumber`='"+blockNb+"' WHERE `address` = '"+walet+"'";
                                //     db.query(updatewallet,(err,result)=>{});
                                // }
                            }
                        }
                    })
                }
            }
            
        }
    })
},20000);