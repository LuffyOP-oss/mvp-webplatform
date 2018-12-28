var fs = require('fs');
const md5 = require('md5');

module.exports = {
    settings_changepass_get:(req,res)=>{

        if(req.session.username !== undefined){
            var username = req.session.username;
            //Get info user
            let query = "";
            db.query(query,(err,result)=>{
                if(err){ res.redirect('/');}else{
                    if(result.length > 0){
                        //data
                        var name = "";
                        var useridd = "";
                        var avatar = "/media/default-avatar.png";
                        var covers = "/media/default-cover.png";
                        var owner = false;
                        var token ="";
                        var notifi = new Array();
                        var notifyCount = 0;

                        let notifiCount = "";

                        db.query(notifiCount,(err,result2)=>{
                            if(!err){
                                notifyCount = result2.length;
                                let notify = "";
                                db.query(notify,(err,ressu)=>{
                                    if(!err){
                                        name = result[0]['firstname']+ " "+ result[0]['lastname'];
                                        if(result[0]['username'] !== null){
                                            useridd = result[0]['username'];
                                        }else{
                                            useridd = result[0]['userid'];
                                        }
                                        
                                        if(name.length>16){
                                            name = name.substr(0,16)+"...";
                                        }
    
                                        if(fs.existsSync('./public/media/'+ result[0]['userid']+"/avatar.jpg")){
                                            avatar = "/media/"+result[0]['userid']+"/avatar.jpg";
                                        }
                                        if(fs.existsSync('./public/media/'+ result[0]['userid']+"/cover.jpg")){
                                            covers = "/media/"+result[0]['userid']+"/cover.jpg";
                                        }
    
                                        if(req.session.token !== undefined){
                                            token = req.session.token;
                                        }
                                        if(ressu.length >0 ){
                                            for(var j=0;j<ressu.length;j++){
                                                if(ressu[j]['link'].indexOf('wallet_') !== -1){
                                                    var date = new Date(ressu[j]['timer'] /1);
                                                    let time = date.getHours() +":"+ date.getMinutes() +":"+ date.getSeconds()+", "+date.getDay()+", THG "+date.getMonth() +", "+ date.getFullYear()
                                                    let content = "";
                                                    let viewed = "";
                                                    let content_value = ressu[j]['content'].split('_');
                                                    if(content_value[0] == 'IN'){
                                                        let value = 0;
                                                        if(content_value[1] == "TRET"){
                                                            value = (content_value[2]/100000000).toFixed(2);
                                                        }else{
                                                            value = (content_value[2]/1000000000000000000).toFixed(6);
                                                        }
                                                        content += res.__('notifi_trans_1') + "<p>" +value+" "+content_value[1]+"</p>"
                                                    }
                                                    if(ressu[j]['status'] == 0){
                                                        viewed = "unview";
                                                    }
                                                    else{
                                                        viewed = "";
                                                    }
                                                    notifi[j]={
                                                        id:ressu[j]['id_notification'],
                                                        avatar: "/media/avatartret.jpg",
                                                        link: "/transaction/"+ressu[j]['link'].split('_')[1],
                                                        content: content,
                                                        time: time,
                                                        viewed: viewed
                                                    }
                                                }
                                            }
                                        }

                                        let seting = "";
                                        db.query(seting,(err,st)=>{
                                            if(!err){
                                             res.render('setting_changePassword.ejs', { 
                                                 title: "Change Password" + ' - Tourist Review',
                                                 seting: st[0],
                                                 namess: name,
                                                 username: useridd,
                                                 userid: useridd,
                                                 error: req.flash('error'),
                                                 success: req.flash('success'),
                                                 avatar: avatar,
                                                 cover: covers,
                                                 is_owner: owner,
                                                 token:token,
                                                 notifi :notifi,
                                                 notificount: notifyCount
                                             });
                                            }
                                        })
                                        
                                    }
                                });
                            }
                        })

                        
                    }else{
                        res.redirect('/');
                    }
                }
            });
        }
    },
    settings_changepass_post:(req,res)=>{
        if(req.body.old_password == undefined || req.body.new_password == undefined || req.body.retype_password == undefined){
            req.flash('error', res.__('error_1'));
            res.redirect(req.get('referer'));
            return;
        }else{
            if(req.body.new_password.length < 8 ){
                req.flash('error', res.__('mat_khau_qua_ngan'));
                res.redirect(req.get('referer'));
                return;
            }
            //Check Password
            let checkpass = ""
            db.query(checkpass,(err,ressu)=>{
                if(!err){
                    if(ressu.length > 0 ){
                        if(req.body.new_password !== req.body.retype_password){
                            req.flash('error', res.__('mat_khau_nhap_lai_khong_khop'));
                            res.redirect(req.get('referer'));
                            return;
                        }else{
                            let change = "";
                            db.query(change,(err,resss)=>{
                                if(!err){
                                    req.flash('success', res.__('success_1'));
                                    res.redirect(req.get('referer'));
                                    return;
                                }
                            })
                        }
                    }else{
                        req.flash('error', res.__('login_mess_4'));
                        res.redirect(req.get('referer'));
                        return;
                    }
                }
            })
        }
    }
}