const express = require("express");

const expressLayouts = require("express-ejs-layouts");

const session = require("express-session");

const bodyParser = require("body-parser");

const app = express();

app.use(expressLayouts);

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  session({
    secret: "seCReT",

    resave: false,

    saveUninitialized: true,

    cookie: { maxAge: 360000 }
  })
);

app.get("*", (req, res) => {
  res.render("student_portal", {
    name: "abc",
    roll: "2019BCS-XXX",
    sem: "I"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
