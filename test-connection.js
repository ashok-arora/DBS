var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "ashok",
  password: ""
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});