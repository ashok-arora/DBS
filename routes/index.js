const express = require("express");
const router = express.Router();
var path = require("path");

router.get("/", (request, response) =>
  response.status(200).sendFile(path.join(__dirname + "/../home.html"))
);

module.exports = router;
