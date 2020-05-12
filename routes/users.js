const express = require("express");
const app = express();
const router = express.Router();
const mySqlConnection = require("../db/db");
const bcrypt = require("bcrypt");
const rp = require("request-promise");
const $ = require("cheerio");
var user,
  m_name = "",
  assignment_number = "";
var path = require("path");

app.use(express.static(path.join(__dirname + "../public/css")));
app.use(express.static(path.join(__dirname, "./public/assets")));

// Get request to Student Login
router.get("/student_login", (request, response) => {
  // If already logged in don't open login page and redirect to student portal
  if (!request.session.user)
    response.status(200).sendFile(path.join(__dirname + "/../student.html"));
  else response.redirect("/users/student_portal");
});

// Post request for Student Login
router.post("/student_login", function (request, response) {
  let { roll_no, password } = request.body;
  mySqlConnection.query(
    "SELECT * FROM student WHERE roll_no = ?",
    [roll_no],
    (err, rows) => {
      if (err) response.status(500).send(err);
      user = rows[0];
      if (user) {
        const result = bcrypt.compareSync(password, user.password);
        // Easy way to prevent extracting password form cookie, will try better solution later
        password = bcrypt.hashSync(password, 10);
        if (result) {
          request.session.user = user;
          findStudentSubjects(request, response);
        } else {
          response.status(400).send("Incorrect Password");
        }
      } else {
        response.status(400).send("Invalid Roll No.");
      }
    }
  );
});

// Post request for student portal
function findStudentSubjects(request, response) {
  if (!request.session.user) response.redirect("/users/student_login");
  if (user != undefined) {
    // Middle Name
    if (user.m_name) m_name = user.m_name;
    else m_name = "";

    // Assignments
    let subjects = [];
    mySqlConnection.query(
      "SELECT * FROM batch_subjects WHERE batch_code = ?",
      [user.batch_code],
      (err, rows) => {
        if (err) response.status(500).send(err);
        if (rows) {
          for (row of rows) {
            subjects.push(row.subject_code);
          }
          findStudentAssignments(request, response, subjects);
        } else {
          assignment_number = "No Assignments";
          response.redirect("/users/student_portal");
        }
      }
    );
  }
}

function findStudentAssignments(request, response, subjects) {
  let assignments = [];
  if (subjects.length != 0) {
    mySqlConnection.query("SELECT * FROM assignment", (err, rows) => {
      if (err) response.status(500).send(err);
      for (row of rows) {
        for (subject of subjects) {
          if (row.subject_code == subject) {
            assignments.push(row.assignment_name);
          }
        }
      }
      let number = assignments.length;
      if (number != 1) assignment_number = number.toString() + " Assignments";
      else assignment_number = number.toString() + " Assignment";
      news(request, response);
    });
  }
}

let newsHead;
function news(request, response) {
  rp(
    "https://www.iiitm.ac.in/index.php/en/component/content/category/79-latest-news?Itemid=437"
  )
    .then(function (html) {
      newsHead = $(".introtext > h3 > span", html).text();
      newsHead = newsHead.substring(0, 150);
      newsHead += "...";
      callRender(request, response);
    })
    .catch(function (err) {
      newsHead = "No News Available.";
      callRender(request, response);
    });
}

function callRender(request, response) {
  response.redirect("/users/student_portal");
}

// Get request for Student Portal
router.get("/student_portal", (request, response) => {
  if (!request.session.user) response.redirect("/users/student_login");
  if (user != undefined) {
    response.render("student_portal", {
      roll_no: user.roll_no,
      f_name: user.f_name,
      m_name: m_name,
      l_name: user.l_name,
      assignment_number: assignment_number,
      phone: user.phone,
      email: user.email,
      photo: user.photo,
      batch_code: user.batch_code,
      newsHead: newsHead,
    });
  }
});

// Post request for Student Portal

// Get request for Faculty Login
router.get("/faculty_login", (request, response) => {
  if (!request.session.user)
    response.status(200).sendFile(path.join(__dirname + "/../faculty.html"));
  else response.redirect("/users/faculty_portal");
});

// Post request for Faculty Login
app.post("/faculty_login", function (request, response) {
  let { username, password } = request.body;
  if (username && password) {
    connection.query(
      "SELECT * FROM students WHERE username = ? AND password = ?",
      [username, password],
      function (error, results, fields) {
        if (results.length > 0) {
          request.session.loggedin = true;
          request.session.username = username;
          response.redirect("/users/faculty_portal");
        } else {
          response.send("Incorrect Username and/or Password!");
        }
        response.end();
      }
    );
  } else {
    response.send("Please enter Username and Password!");
    response.end();
  }
});

router.get("/logout", (request, response) => {
  if (request.session.user) {
    request.session.destroy(() => {
      response.redirect("/");
    });
  }
});

module.exports = router;
