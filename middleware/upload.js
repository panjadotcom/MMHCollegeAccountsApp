const multer = require('multer');

var storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, __dirname + '/../public/resources/static/uploads/xlsx');
    },
    filename: (req, file, callback) => {
      callback(null, Date.now() + '-' + file.originalname);
    }
  });

  var excellFilter = (req, file, callback) =>{
      if (!file.originalname.match(/\.(xls|xlsx)$/i)) {
        return callback(new Error("Only excell files are allowed!"), false);          
      }
      else if ( (file.mimetype.includes("excel")) ||
      (file.mimetype.includes("spreadsheetml"))) {
        callback(null, true);
      } else {
        return callback(new Error("Only excell files are allowed!"), false);
      }
  };
   
  var uploadFile = multer({ storage: storage , fileFilter : excellFilter});

module.exports = uploadFile;