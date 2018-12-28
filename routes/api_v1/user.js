const jwt = require('jsonwebtoken');
const md5 = require('md5');
var nodemailer =  require('nodemailer');

module.exports = {
    login: (req, res) => {
        if(req.body.email === undefined || req.body.password === undefined ) 
        {
            return res.json({ success: false, message: 'Missing data !', data: null });
        }else{
            let query = "";
            db.query(query,(err,result)=>{
                if(err){
                }else{
                    if(result.length == 0){
                        return res.json({ success: false, message: 'user not found', data: null });
                    }else{
                        if(result[0]["password"] !==  md5(req.body.password)){
                            return res.json({ success: false, message: 'incorrect password', data: null });
                        }

                        if(result[0]["status"] ===  0){
                            return res.json({ success: false, message: 'account not verify email', data: null });
                        }

                        var login_code = md5(result[0]["email"] + Date.now());
                        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                        var data=login_code+"_"+result[0]["userid"];
                        
                        //Add Token Login
                        let query = "";
                        db.query(query,(err,result)=>{});
                        
                        var token = jwt.sign(data,'', {});
                        req.session.token = token;
                          res.json({ success: true, message: '', token: token });
                    }
                }
            });
        }
    },
    register: (req, res) => {
        if(req.body.firstname === undefined || req.body.lastname === undefined || req.body.email === undefined 
            || req.body.password === undefined || req.body.day === undefined || req.body.month === undefined 
            || req.body.year === undefined || req.body.sex === undefined || req.body.city === undefined || req.body.country === undefined) 
        {
            return res.json({ success: false, message: 'Missing data !', data: null });
        }else{
            if(req.body.password.length < 6){
                return res.json({ success: false, message: 'Requires password of 6 characters', data: null });
            }
            let query = "SELECT * FROM `user` WHERE `email`='"+req.body.email.toLowerCase()+"'";
            db.query(query, (err, result) => {
                if (err) {
                    return res.json({ success: false, message: err.sqlMessage, data: null });
                }
                if(result.length > 0){
                    return res.json({ success: false, message: 'Email already exists !', data: null });
                }else{
                    var tokenVeri = jwt.sign({a:'verify',e:req.body.email,d: Date.now()},'tretsecretemail', {});
                    let query = "";
                    db.query(query,(err,result)=>{
                        if(err){return res.send({ success: false, message: err, data: null });}
                        else{

                            var transporter =  nodemailer.createTransport({ // config mail server
                                host: '',
                                port: 587,
                                secure: false, // true for 465, false for other ports
                                auth: {
                                    user: '',
                                    pass: ''
                                },
                                tls: {
                                    rejectUnauthorized: false
                                }
                            });
                            var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
                                from: '"Tourist Review" <no-reply@touristreview.io>',
                                to: ''+req.body.email,
                                subject: 'TouristReview Verify Your Email',
                                text: 'You recieved message from ' + req.body.email,
                                html: '<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/><title>Verify Your Email</title><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head><body style="margin: 0;padding: 0;background-color: whitesmoke;"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td style="padding: 10px 0 30px 0;"><table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border: 0px solid #cccccc;border-collapse: collapse;"><tbody><tr><td align="center" style="padding: 27px 0;color: #153643;font-size: 28px;font-weight: bold;font-family: Arial, sans-serif;background-color: #04445d;height: 40px;/* vertical-align: middle; */"><img src="https://touristreview.io/assets/images/logo.png" alt="TouristReview Logo" width="37" height="auto" style="/* display: block; */vertical-align: bottom;"><span style=" display: -webkit-inline-box; color: #fff; font-size: 22px;">TOURIST </span><span style=" font-weight: 100; color: #fff; font-size: 22px;"> REVIEW</span></td></tr><tr><td bgcolor="#ffffff" style="padding: 10px 20px;text-align: center;"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td style="padding: 20px 0 5px 0;color: #153643;font-family: Arial, sans-serif;font-size: 16px;line-height: 20px;">Thank you for creating an account at TouristReview</td></tr><tr><td style="padding: 4px 0 28px 0px;color: #153643;font-family: Arial, sans-serif;font-size: 16px;line-height: 20px;">Verify your email below to complete your account registration.</td></tr><tr> <td style=" padding: 30px;"> <a href="https://mvp.touristreview.io/auth/'+tokenVeri+'" style=" text-decoration-line: none; color: #fff; background-color: #10ade4; padding: 14px; border-radius: 20px; font-size: 14px; font-weight:;">YES, THIS IS MY EMAIL</a> </td></tr></tbody></table></td></tr><tr><td style="padding: 30px 30px 30px 30px;background-color: #008ec5;"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;" width="75%">® TouristReview 2018<br><a href="#" style="color: #ffffff;"><font color="#ffffff">Unsubscribe</font></a> to this newsletter instantly</td><td align="right" width="25%"><table border="0" cellpadding="0" cellspacing="0"><tbody><tr><td style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold;"><a href="https://twitter.com/TRET_Global" style="color: #ffffff;"><img src="https://touristreview.io/assets/images/tw-logo.png" alt="Twitter" width="38" height="38" style="display: block;" border="0"></a></td><td style="font-size: 0; line-height: 0;" width="20">&nbsp;</td><td style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold;"><a href="https://www.facebook.com/TouristReviewGlobal/" style="color: #ffffff;"><img src="https://touristreview.io/assets/images/facebook-logo.png" alt="Facebook" width="38" height="38" style="display: block;" border="0"></a></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></body></body></html>'
                            }
                            transporter.sendMail(mainOptions, function(err, info){
                                if (err) {
                                    console.log(err);
                                } else {
                                }
                                
                            });
                            return res.json({ success: true, message: '', data: null });
                        }
                    });

                }
            });
        }
    }
};


function jsUcfirst(string) 
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}
