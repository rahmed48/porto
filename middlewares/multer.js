const multer = require("multer");
const path = require("path");
const fs = require("fs");
// import uuid from "uuid/v4";

// Set storage engine
const storage = multer.diskStorage({
  destination: "public/images",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const storageProfile = multer.diskStorage({
  destination: "public/resume",
  filename: function (req, file, cb) {
    // cb(null, Date.now() + path.extname(file.originalname));
    cb(null, file.originalname);
  },
});

const storageMultiple = multer.diskStorage({
  destination: function (req, file, cb) {
    var dir = "public/images";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadMultiple = multer({
  storage: storageMultiple,
  limits: { fileSize: 1000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).array("image", 12);

const uploadProfile = multer({
  storage: storageProfile,
  limits: { fileSize: 100000000 },
  fileFilter: function (req, file, cb) {
    checkFileTypeProfile(file, cb);
  },
}).fields([{ name: "profileimg" }, { name: "aboutimg" }, { name: "resume" }]);

const upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("image");

// // Check file Type
function checkFileType(file, cb) {
  // Allowed ext
  const fileTypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb("Error: Images Only !!!");
  }
}

function checkFileTypeProfile(file, cb) {
  // Allowed ext
  const fileTypes = /jpeg|jpg|png|gif|pdf/;
  // Check ext
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb("Error: Images & Pdf Only !!!");
  }
}

module.exports = { uploadMultiple, upload, uploadProfile };
