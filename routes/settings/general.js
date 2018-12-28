var fs = require('fs');

module.exports = {
    settings_general_get:(req,res)=>{

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

                                        let country = "";
                                        db.query(country,(err,resu_country)=>{
                                            count = null;
                                            if(!err){
                                               let seting = "";
                                               db.query(seting,(err,st)=>{
                                                   if(!err){
                                                    bday= new Date(result[0]["birthday"]*1);
                                                    var bday_text = "";
                                                    bday_text+=bday.getFullYear()+"-";
                                                    bday_text+=bday.getMonth()<10? "0"+bday.getMonth():bday.getMonth();
                                                    bday_text+= "-";
                                                    bday_text+= bday.getDay()<10? "0"+bday.getDay():bday.getDay();

                                                    res.render('settings_general.ejs', { 
                                                        title: "Setting" + ' - Tourist Review',
                                                        seting: st[0],
                                                        namess: name,
                                                        info_user: result[0],
                                                        bd: bday_text,
                                                        username: useridd,
                                                        userid: useridd,
                                                        error: req.flash('error'),
                                                        success: req.flash('success'),
                                                        avatar: avatar,
                                                        cover: covers,
                                                        is_owner: owner,
                                                        country: resu_country,
                                                        token:token,
                                                        notifi :notifi,
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

                        
                    }else{
                        res.redirect('/');
                    }
                }
            });
        }
    },
    settings_general_post:(req,res)=>{
        if(req.session.username == undefined || req.body.firstname == undefined || req.body.lastname == undefined || req.body.displayName == undefined || req.body.language == undefined || req.body.sex == undefined || req.body.bday == undefined || req.body.address == undefined || req.body.country == undefined ){
            req.flash('error', res.__('error_1'));
            res.redirect(req.get('referer'));
            return;
        }else{
            //Check 
            var arrchar = req.body.displayName.split('');
            var displayname = "";
            if(arrchar.length>0){
            for(var i=0;i<arrchar.length;i++){
                if(arrchar[i].charCodeAt(0) == 46|| arrchar[i].charCodeAt(0) >= 48 && arrchar[i].charCodeAt(0) <= 57  ||  arrchar[i].charCodeAt(0) >= 56 && arrchar[i].charCodeAt(0) <= 90 || arrchar[i].charCodeAt(0) >= 79 && arrchar[i].charCodeAt(0) <= 122){
                    displayname += arrchar[i];
                }else{
                    req.flash('error', res.__('error_2'));
                    res.redirect(req.get('referer'));
                    return;
                }
            }}

            if(displayname.length < 6 || displayname.length > 20)
            {
                req.flash('error', res.__('error_2'));
                res.redirect(req.get('referer'));
                return;
            }
            displayname = displayname.toLowerCase();
            let qr = "SELECT * FROM `user` WHERE `username` ='"+displayname+"'";

            db.query(qr,(err,rs_qe)=>{
                if(!err){
                 if(rs_qe.length > 0){
                     if(rs_qe[0]["userid"] == req.session.username){
                        let query = "";
                        
                        db.query(query,(err,resu)=>{
                            if(!err){
                                req.flash('success', res.__('success_1'));
                                res.redirect(req.get('referer'));
                                return;
                            }else{
                                req.flash('error', res.__('error_1'));
                                res.redirect(req.get('referer'));
                                return;
                            }
                        })
                     }else{
                        req.flash('error', res.__('error_2'));
                        res.redirect(req.get('referer'));
                        return;
                     }
                    
                 }else{
                    let query = "";
                    db.query(query,(err,resu)=>{
                        if(!err){
                            req.flash('success', res.__('success_1'));
                            res.redirect(req.get('referer'));
                            return;
                        }else{
                            req.flash('error', res.__('error_1'));
                            res.redirect(req.get('referer'));
                            return;
                        }
                    })
                 }
                }
            })
        }
    }
}