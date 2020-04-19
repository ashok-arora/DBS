const express = require("express");
const app = express();
const router = express.Router();
var path = require("path");

app.use(express.static(path.join(__dirname + "../public/css")));

router.get("/student_portal", (req, res) => {
  res.render("student_portal", {
    name: "abc",
    roll: "2019BCS-XXX",
    sem: "I",
  });
});

module.exports = router;
