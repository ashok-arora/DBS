var express = require("express");
var multer = require("multer");
const session = require("express-session");
var fs = require("fs");
var app = express();
var path = require("path");
const mysql = require("mysql");

app.use(
  session({
    secret: "seCReT",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 },
  })
);

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/uploads"); //you tell where to upload the files,
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + ".png");
  },
});

var upload = multer({
  storage: storage,
  onFileUploadStart: function (file) {
    console.log(file.originalname + " is starting ...");
  },
});

app.set("view engine", "ejs");

app.get("/", function (req, res, next) {
  res.sendFile(path.join(__dirname + "/multer.html"));
});

app.post("/profile", upload.single("pic"), function (request, response) {
  console.log(request.file);
  //   const img = request.file;
  //   console.log("1");
  //   fs.readFile(img.path, (err, data) => {
  //     console.log("1");
  //     connection.query(
  //       `INSERT INTO images(img) VALUES ?`,
  //       [img],
  //       (err, results) => {
  //         console.log(err);
  //       }
  //     );
  //     console.log("1");
  //   });
  //   return false;
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
