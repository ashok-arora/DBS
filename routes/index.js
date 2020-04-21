const express = require("express");
const router = express.Router();
var path = require("path");

router.get("/", (request, response) =>
  response.status(200).sendFile(path.join(__dirname + "/../home.html"))
);

router.get("/student_portal", function (request, response) {
  response.render("student_portal", {
    f_name: "abc",
  });
});

module.exports = router;
