const mysql = require("mysql");

const mySqlConnection = mysql.createConnection({
  host: "remotemysql.com",

  user: "rEm5rfwMmJ",

  password: "c1clM66WzV",

  database: "rEm5rfwMmJ",
});

mySqlConnection.connect((err) => {
  if (err) console.log(err);

  console.log("Database Connected!");
});

module.exports = mySqlConnection;
