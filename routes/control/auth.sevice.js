exports.requireLogin= (req, res, next) => {
    var tokenSession = req.session.token;
    if (tokenSession === undefined) {
        next();
    } else {
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if (err) {
                req.session.destroy();
                next();
            } else {
                var decode = decoded.split('_');
                let query = "SELECT * FROM `token` WHERE `login_code` ='"+decode[0]+"' LIMIT 1";
                db.query(query, (err, result) => { 
                    if(err){
                        req.session.destroy();
                        next();
                    }else{
                        if(result.length !==0){
                            req.session.username = result['username'];
                        }else{
                            req.session.destroy();
                            next();
                        }
                    }
                });
            }
        });
    }
};