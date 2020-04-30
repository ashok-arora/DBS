const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const bodyParser = require("body-parser");
const app = express();
var path = require("path");

app.use(expressLayouts);
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname + "/public")));

app.use(
  session({
    secret: "seCReT",

    resave: false,

    saveUninitialized: true,

    cookie: { maxAge: 360000 },
  })
);

app.use("/", require("./routes/index.js"));

app.use("/users", require("./routes/users.js"));

app.use("/admin", require("./routes/admin.js"));

// app.get("*", (req, res) => {
//   res.redirect("/");
// });

app.use(function (req, res) {
  res.status(404);
  app.use(express.static(path.join(__dirname + "../public/css")));
  res.sendFile(path.join(__dirname + "/404.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
