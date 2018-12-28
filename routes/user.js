const jwt = require('jsonwebtoken');
const md5 = require('md5');
var nodemailer = require('nodemailer');

module.exports = {
    auth: (req, res) => {
        if (req.params.token == undefined) {
            res.redirect("/");
        } else {
            jwt.verify(req.params.token, '', function (err, decoded) {
                if (err) {
                    //Nếu có lỗi giải mã token
                    //
                    return res.render('verify_error.ejs', {
                        title: 1,
                        error: true,
                        content: 1
                    });
                } else {
                    //Nếu quá thời gian
                    if (decoded['d'] + 3600 > Date.now()) {
                        return res.render('verify_error.ejs', {
                            title: 1,
                            error: true,
                            content: 2
                        });
                    }

                    //Nếu không có lỗi gì
                    let query = "";
                    db.query(query, (err, result) => {
                        //Nếu có lỗi query SQL
                        if (err) {
                            return res.render('verify_error.ejs', {
                                title: 1,
                                error: true,
                                content: 1
                            });
                        } else {
                            if (result[0]['status'] !== 0) {
                                res.redirect('/');
                            } else {
                                let query = "";
                                db.query(query, (err, result) => {
                                    if (err) { }
                                });
                                //Tạo thư mục media
                                var fs = require('fs');
                                var dir = './public/media/'+ result[0]['userid'];

                                if (!fs.existsSync(dir)){
                                    fs.mkdirSync(dir);
                                }
                                return res.render('verify_error.ejs', {
                                    title: 2,
                                    error: false,
                                    content: 3
                                });
                            }
                        }
                    });
                }

            });
        }
    },
    loginPage: (req, res) => {

        if (req.body.email === undefined) {
            return res.render('pageLogin.ejs', { mess: res.__('login_mess_1') });
        }
        if (req.body.password === undefined) {
            return res.render('pageLogin.ejs', { mess: res.__('login_mess_2') });
        }
        let query = "";
        db.query(query, (err, result) => {
            if (err) {
            } else {
                if (result.length == 0) {
                    return res.render('pageLogin.ejs', { mess: res.__('login_mess_3') });
                } else {
                    if(result[0]['password'] === md5(req.body.password)){
                        if (result[0]["status"] === 0) {
                            //tạo Token verify
                            var token = jwt.sign(req.body.email, 'token', {});
                            return res.render('verify_mail.ejs', { token:token });
                        }else{
                            var login_code = md5(result[0]["email"] + Date.now());
                            var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                            var data = login_code + "_" + result[0]["userid"];

        
                            //Add Token Login
                            let query = "";
                            db.query(query, (err, result) => { 
                                if(err){
                                    console.log(err);
                                    res.redirect('/');
                                }else{
                                    var token = jwt.sign(data, '', {});
                                    req.session.token = token;
                                    
                                    res.redirect('/');
                                    console.log('Login Success');
                                }
                            });
        
                            
                        }
                        //return res.render('pageLogin.ejs', { mess: res.__('login_mess_5') });
                    }else{
                        return res.render('pageLogin.ejs', { mess: res.__('login_mess_4') });
                    }
                    
                }
            }
        });
    },
    reSendEmail:(req,res)=>{
        if(req.params.token == undefined){
            res.redirect('/');
        }else{
            jwt.verify(req.params.token, 'token', function (err, decoded) {
                if (err) {
                    res.redirect('/');
                }else{
                    let query = "";
                    db.query(query, (err, result) => {
                        if(!err){
                            var tokenVeri = jwt.sign({a:'verify',e:result['email'],d: Date.now()},'', {});
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
                                to: ''+result['email'],
                                subject: 'TouristReview Verify Your Email',
                                text: 'You recieved message from ' + result['email'],
                                html: '<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/><title>Verify Your Email</title><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head><body style="margin: 0;padding: 0;background-color: whitesmoke;"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td style="padding: 10px 0 30px 0;"><table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border: 0px solid #cccccc;border-collapse: collapse;"><tbody><tr><td align="center" style="padding: 27px 0;color: #153643;font-size: 28px;font-weight: bold;font-family: Arial, sans-serif;background-color: #04445d;height: 40px;/* vertical-align: middle; */"><img src="https://touristreview.io/assets/images/logo.png" alt="TouristReview Logo" width="37" height="auto" style="/* display: block; */vertical-align: bottom;"><span style=" display: -webkit-inline-box; color: #fff; font-size: 22px;">TOURIST </span><span style=" font-weight: 100; color: #fff; font-size: 22px;"> REVIEW</span></td></tr><tr><td bgcolor="#ffffff" style="padding: 10px 20px;text-align: center;"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td style="padding: 20px 0 5px 0;color: #153643;font-family: Arial, sans-serif;font-size: 16px;line-height: 20px;">Thank you for creating an account at TouristReview</td></tr><tr><td style="padding: 4px 0 28px 0px;color: #153643;font-family: Arial, sans-serif;font-size: 16px;line-height: 20px;">Verify your email below to complete your account registration.</td></tr><tr> <td style=" padding: 30px;"> <a href="https://mvp.touristreview.io/auth/'+tokenVeri+'" style=" text-decoration-line: none; color: #fff; background-color: #10ade4; padding: 14px; border-radius: 20px; font-size: 14px; font-weight:;">YES, THIS IS MY EMAIL</a> </td></tr></tbody></table></td></tr><tr><td style="padding: 30px 30px 30px 30px;background-color: #008ec5;"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;" width="75%">® TouristReview 2018<br><a href="#" style="color: #ffffff;"><font color="#ffffff">Unsubscribe</font></a> to this newsletter instantly</td><td align="right" width="25%"><table border="0" cellpadding="0" cellspacing="0"><tbody><tr><td style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold;"><a href="https://twitter.com/TRET_Global" style="color: #ffffff;"><img src="https://touristreview.io/assets/images/tw-logo.png" alt="Twitter" width="38" height="38" style="display: block;" border="0"></a></td><td style="font-size: 0; line-height: 0;" width="20">&nbsp;</td><td style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold;"><a href="https://www.facebook.com/TouristReviewGlobal/" style="color: #ffffff;"><img src="https://touristreview.io/assets/images/facebook-logo.png" alt="Facebook" width="38" height="38" style="display: block;" border="0"></a></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></body></body></html>'
                            }
                            transporter.sendMail(mainOptions, function(err, info){
                                if (err) {
                                    console.log(err);
                                } else {
                                }
                                
                            });
                            res.render('reSendEmail.ejs',{content: res.__('resendemail_content_1')});
                        }
                    });
                    
                }
            });
            
        }
    }
}

function jsUcfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}