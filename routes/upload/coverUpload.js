const path = require('path');
var multer = require('multer');

var stogare = multer.diskStorage({
    destination: (req, file,cb)=>{
        if(req.session === undefined){
            cb(null,'./public/media/temp');
        }
        else{
            cb(null,'./public/media/'+ req.session.username);
        }
    },
    filename: (req,file,cb)=>{
        cb(null,'cover.jpg')
    }
});


var uploadAvatar = multer({
    storage:stogare,
    limits: { fileSize: 4000000 },
    fileFilter: function (req, file, cb) {
        if(req.session === undefined){
            cb(null, false, new Error('authentication requirements'));
        }else{
            checkFile(file, cb,/jpg|png|jpeg|gif/);
        }
        
    }
}).single('image');

module.exports = function(app) {
    app.route('/uploadCover')
        .get( (req,res)=>{

        })
        .post((req,res)=>{
            uploadAvatar(req, res, function (err) {
                if (err) {
                    return res.json({ success: false, message: err['message'], data: null });
                }
                return res.json({ success: true, message: '', data: req.file });
              })
            
        })
}


function checkFile(file,cb,filetypes){
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if(extname && mimetype){
       cb(null,true);
    }else{
        cb(null, false, new Error('Only accept media files'));
    }
 }