const express = require("express");
const router = express.Router();
var path = require("path");

router.get("/", (request, response) =>
  response.status(200).sendFile(path.join(__dirname + "/../home.html"))
);

router.get("/contact_us", (request, response) => {
  response.status(200).sendFile(path.join(__dirname + "/../contact-us.html"));
});


module.exports = router;
