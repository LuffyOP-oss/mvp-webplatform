var fs = require('fs');
const md5 = require('md5');
var speakeasy = require('speakeasy');
var QRCode = require('qrcode');
const wallet = require('ethereumjs-wallet');

module.exports = {
    settings_2fa_get: (req, res) => {

        if (req.session.username !== undefined) {
            var username = req.session.username;
            //Get info user
            let query = "";
            db.query(query, (err, result) => {
                if (err) { res.redirect('/'); } else {
                    if (result.length > 0) {
                        //data
                        var name = "";
                        var useridd = "";
                        var avatar = "/media/default-avatar.png";
                        var covers = "/media/default-cover.png";
                        var owner = false;
                        var token = "";
                        var notifi = new Array();
                        var notifyCount = 0;

                        let notifiCount = "";

                        db.query(notifiCount, (err, result2) => {
                            if (!err) {
                                notifyCount = result2.length;
                                let notify = "";
                                db.query(notify, (err, ressu) => {
                                    if (!err) {
                                        name = result[0]['firstname'] + " " + result[0]['lastname'];
                                        if (result[0]['username'] !== null) {
                                            useridd = result[0]['username'];
                                        } else {
                                            useridd = result[0]['userid'];
                                        }

                                        if (name.length > 16) {
                                            name = name.substr(0, 16) + "...";
                                        }

                                        if (fs.existsSync('./public/media/' + result[0]['userid'] + "/avatar.jpg")) {
                                            avatar = "/media/" + result[0]['userid'] + "/avatar.jpg";
                                        }
                                        if (fs.existsSync('./public/media/' + result[0]['userid'] + "/cover.jpg")) {
                                            covers = "/media/" + result[0]['userid'] + "/cover.jpg";
                                        }

                                        if (req.session.token !== undefined) {
                                            token = req.session.token;
                                        }
                                        if (ressu.length > 0) {
                                            for (var j = 0; j < ressu.length; j++) {
                                                if (ressu[j]['link'].indexOf('wallet_') !== -1) {
                                                    var date = new Date(ressu[j]['timer'] / 1);
                                                    let time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ", " + date.getDay() + ", THG " + date.getMonth() + ", " + date.getFullYear()
                                                    let content = "";
                                                    let viewed = "";
                                                    let content_value = ressu[j]['content'].split('_');
                                                    if (content_value[0] == 'IN') {
                                                        let value = 0;
                                                        if (content_value[1] == "TRET") {
                                                            value = (content_value[2] / 100000000).toFixed(2);
                                                        } else {
                                                            value = (content_value[2] / 1000000000000000000).toFixed(6);
                                                        }
                                                        content += res.__('notifi_trans_1') + "<p>" + value + " " + content_value[1] + "</p>"
                                                    }
                                                    if (ressu[j]['status'] == 0) {
                                                        viewed = "unview";
                                                    }
                                                    else {
                                                        viewed = "";
                                                    }
                                                    notifi[j] = {
                                                        id: ressu[j]['id_notification'],
                                                        avatar: "/media/avatartret.jpg",
                                                        link: "/transaction/" + ressu[j]['link'].split('_')[1],
                                                        content: content,
                                                        time: time,
                                                        viewed: viewed
                                                    }
                                                }
                                            }
                                        }

                                        if (req.session.facode === undefined) {
                                            if (result[0]['2fa_code'] == null) {
                                                req.session.facode = speakeasy.generateSecret({ length: 20 })['base32'];
                                            } else {
                                                req.session.facode = result[0]['2fa_code'];
                                            }
                                        }


                                        QRCode.toDataURL("otpauth://totp/SecretKey?secret=" + req.session.facode, function (err, image_data) {
                                            if (!err) {
                                                let referral_bonus = "SELECT * FROM `options` LIMIT 1";
                                                db.query(referral_bonus, (err, st) => {
                                                    if (!err) {
                                                        res.render('settings_2fa.ejs', {
                                                            title: "Change Password" + ' - Tourist Review',
                                                            userinfo: result[0],
                                                            seting: st[0],
                                                            facode: req.session.facode,
                                                            qrcode: image_data,
                                                            namess: name,
                                                            username: useridd,
                                                            userid: useridd,
                                                            error: req.flash('error'),
                                                            success: req.flash('success'),
                                                            avatar: avatar,
                                                            cover: covers,
                                                            is_owner: owner,
                                                            token: token,
                                                            notifi: notifi,
                                                            notificount: notifyCount
                                                        });
                                                    }
                                                })
                                            }
                                        })

                                    }
                                });
                            }
                        })


                    } else {
                        res.redirect('/');
                    }
                }
            });
        }
    },
    settings_2fa_post: (req, res) => {
        
        if (req.body.facode == undefined || req.body.password == undefined) {
            if(req.body.dis_2fa_password !== undefined && req.body.facode !== undefined){
                let fa_code = "";
                db.query(fa_code, (err, resu) => {
                    if(!err){
                        req.flash('success', res.__('success_1'));
                        res.redirect(req.get('referer'));
                        return;
                    }
                })
            }else{
                req.flash('error', res.__('error_1'));
                res.redirect(req.get('referer'));
                return;
            }
            
        } else {
            //Check Password
            let checkpass = ""
            db.query(checkpass, (err, ressu) => {
                if (!err) {
                    if (ressu.length > 0) {
                        var verified = speakeasy.totp.verify({
                            secret: req.session.facode,
                            encoding: 'base32',
                            token: req.body.facode
                        });

                        if (verified) {
                            let fa_code = "";
                            db.query(fa_code, (err, resu) => {
                                if (!err) {
                                    let checkuser = "";
                                    db.query(checkuser, (err, resu2) => {
                                        if (!err) {
                                            if (resu2.length < 1) {
                                                let check_token_bonus = "";
                                                db.query(check_token_bonus, (err, resu3) => {
                                                    if (!err) {
                                                        const myWallet = wallet.generate();

                                                        let insert_wallet = "";
                                                        db.query(insert_wallet, (err, resu4) => {
                                                            if (!err) {
                                                                let insert_trans = "";
                                                                db.query(insert_trans, (err, resu5) => {
                                                                    if(!err){
                                                                        let insert_notifi = "";
                                                                        db.query(insert_notifi, (err, resu5) => {
                                                                            if(!err){
                                                                                req.flash('success', res.__('success_1'));
                                                                                res.redirect(req.get('referer'));
                                                                                return;
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }else{
                                                req.flash('success', res.__('success_1'));
                                                res.redirect(req.get('referer'));
                                                return;
                                            }
                                        }
                                    });
                                }
                            })

                        } else {
                            req.flash('error', res.__('error_2fa'));
                            res.redirect(req.get('referer'));
                            return;
                        }
                    } else {
                        req.flash('error', res.__('login_mess_4'));
                        res.redirect(req.get('referer'));
                        return;
                    }
                }
            })
        }
    }
}