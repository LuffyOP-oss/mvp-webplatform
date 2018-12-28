const express = require('express');
const subdomain = require('express-subdomain');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const useragent = require('express-useragent');
const i18n = require("i18n");
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const app = express();
const jwt = require('jsonwebtoken');
const flash = require('connect-flash-plus');


const { getHomePage } = require('./routes/index');
const { addPlayerPage, addPlayer, deletePlayer, editPlayer, editPlayerPage } = require('./routes/player');


//Khai bao function API
const { login,register } = require('./routes/api_v1/user');

//Khai báo router WEB Application
const { auth,loginPage,reSendEmail } = require('./routes/user');
const { personaPage } = require('./routes/u');
const { wallet } = require('./routes/wallet/wallet');
const {settings_general_get,settings_general_post} = require('./routes/settings/general');
const {settings_changepass_get,settings_changepass_post} = require('./routes/settings/changePassword');
const {settings_2fa_get,settings_2fa_post} = require('./routes/settings/2fa');

//Subdomain Upload require
const uploadAvatar = require('./routes/upload/avatarUpload')
const uploadCover = require('./routes/upload/coverUpload')
//Port express
const port = 9999;

var Auth = require('./routes/control/auth.sevice');

// create connection to database
// the mysql.createConnection function takes in a configuration object which contains host, user, password and the database name.
var options = {
    host: '',
    user: '',
    password: '',
    database: '',
    expiration: 1000*60*60*24*30*12
};

var sessionStore = new MySQLStore(options);
const db = mysql.createConnection(options);


app.use(session({
    key: '',
    secret: '',
    cookie: { maxAge: 1000*60*60*24*30*12 },
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
}));

// connect to database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = db;

// configure middleware
app.set('port', process.env.port || port); // set express to use this port
app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // configure template engine
app.set('superSecret', "");

app.use(flash());
app.use(useragent.express());
app.use(session({ secret: '' }));
app.use(i18n.init);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse form data client
app.use(express.static(path.join(__dirname, 'public'))); // configure express to use public folder


i18n.configure({
    locales: ['en', 'vi'],
    directory: __dirname + '/locales',
    cookie: 'lang',
    defaultLocale: 'en',
});
app.use(i18n.init);

//Middleware Check Login
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


// routes for the app
var routerAPI = express.Router();
var routerUPLOAD = express.Router();

app.use((req, res, next) => {
    var tokenSession;
    if(req.query._csrf !== undefined){
        tokenSession = req.query._csrf;
    }else{
        tokenSession = req.session.token;
    }
    
    if (tokenSession === undefined) {
        next();
    } else {
        
        jwt.verify(tokenSession, app.get(''), function (err, decoded) {
            if (err) {
                req.session.destroy();
                next();
            } else {
                var decode = decoded.split('_');
                let query = "";
                db.query(query, (err, result) => { 
                    if(err){
                        req.session.username = undefined;;
                        next();
                    }else{
                        if(result.length !==0){
                            let query = "";
                            db.query(query,(err,ress)=>{
                                if(!err){
                                    req.session.username = result[0]['username'];
                                    res.cookie('lang', ress[0]['language'], { maxAge: 900000 });
                                    next();
                                }else{
                                    req.session.username = result[0]['username'];
                                    next();
                                }
                            })
                        }else{
                            req.session.username = undefined;
                            next();
                        }
                    }
                });
            }
        });
    }
});

uploadAvatar(routerUPLOAD);
uploadCover(routerUPLOAD);


routerAPI.post('/login', login);
routerAPI.post('/register', register);
app.get('/auth/:token',auth);
app.get('/auth',(req,res)=>{res.redirect("/");});
app.get('/reg-success',(req,res)=>{res.render("reg-success.ejs")});

//Middleware JWT
routerAPI.use(function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});



routerAPI.post('/user', login);


//Subdomain _________________________________________
app.use(subdomain('api', routerAPI));
app.use(subdomain('upload', routerUPLOAD));
//Subdomain _________________________________________




app.get('/login',(req,res)=>{ 
    if(req.session.username !== undefined)
    { 
        res.redirect('/');
    }
    else{
        res.render('pageLogin.ejs',{mess:req.session.messlogin})
    }
});

app.post('/login', loginPage);
app.get('/', getHomePage);
app.get('/logout', (req,res)=>{
    var tokenSession = req.session.token;
    if (tokenSession === undefined) {
    } else {
        jwt.verify(tokenSession, app.get('superSecret'), function (err, decoded) {
            if (err) {
            } else {
                var decode = decoded.split('_');
                let query = "";
                db.query(query, (err, result) => { 
                    if(err){
                    }else{
                        if(result.length !==0){
                            let query = "";
                            db.query(query, (err, result) => { });
                        }
                    }
                });
            }
        });
    }
    req.session.destroy();
    res.redirect('/');
});


app.use((req, res, next) => {
    if(req.session.username !== undefined)
    { 
        next();
    }else{
        res.redirect('/');
    }
});


app.get('/settings/general', settings_general_get);
app.post('/settings/general', settings_general_post);

app.get('/settings/changepassword', settings_changepass_get);
app.post('/settings/changepassword', settings_changepass_post);

app.get('/settings/twoFactor', settings_2fa_get);
app.post('/settings/twoFactor', settings_2fa_post);

app.get('/wallet',wallet);
app.get('/:username', personaPage);


app.get('/add', addPlayerPage);

app.get('/login/resendemail/:token', reSendEmail);
app.get('/edit/:id', editPlayerPage);
app.get('/delete/:id', deletePlayer);
app.post('/add', addPlayer);
app.post('/edit/:id', editPlayer);




// set the app to listen on the port
var server = app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

const io = require('socket.io')(server);

io.on("connection",(socket)=>{
    console.log("conenect");
})