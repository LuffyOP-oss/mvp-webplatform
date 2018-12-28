var multer = require('multer');

var stogare = multer.diskStorage({
    destination: (req, file,cb)=>{
        cb(null,'../../public/media/'+ req.session.username)
    },
    filename: (req,file,cb)=>{
        cb(null,file.originalname)
    }
});
var uploadAvatar = multer({
    storage:stogare,
    limits:{fileSize:10},
    fileFilter: function (req, file, cb) {
        checkFile(file, cb)
    }
}).single("image");


function checkFile(file,cb){
    const filetypes = /jpg|png|jpeg|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if(extname && mimetype){
       cb(null,true);
    }else{
       cb({message: ""});
    }
 }