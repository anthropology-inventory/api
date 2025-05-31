// middleware/uploadMiddleware.js
const multer = require("multer");
const { storage } = require("../utils/cloudinary"); // or wherever your cloudinary config is

const upload = multer({ storage });

module.exports = upload;
