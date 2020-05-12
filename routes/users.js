const express = require("express");
const app = express();
const router = express.Router();
const mySqlConnection = require("../db/db");
const bcrypt = require("bcrypt");
const rp = require("request-promise");
const $ = require("cheerio");
var Chart = require("chart.js");
// const url =
//   "https://www.iiitm.ac.in/index.php/en/component/content/category/79-latest-news?Itemid=437";
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
      attendanceChartsData(request, response);
    })
    .catch(function (err) {
      newsHead = "No News Available.";
      attendanceChartsData(request, response);
    });
}

let attendanceChartsList = [];
let attendanceSubjects = [];
function attendanceChartsData(request, response) {
  mySqlConnection.query(
    "SELECT * FROM attendance WHERE roll_no = ?",
    [user.roll_no],
    (err, rows) => {
      if (err) response.status(500).send(err);
      else {
        let temp = new Object();
        let attendanceCharts = [];
        for (row of rows) {
          temp = new Object();
          temp["label"] = "Present";
          temp["y"] = row.attendance;
          attendanceCharts = [];
          attendanceCharts.push(temp);
          temp = new Object();
          mySqlConnection.query(
            "SELECT * FROM subject WHERE subject_code = ?",
            [row.subject_code],
            (err, newRows) => {
              if (err) response.status(500).send(err);
              else {
                temp["y"] = newRows[0].faculty_attendance - row.attendance;
                temp["label"] = "Absent";
                attendanceSubjects.push(newRows[0].subject_name);
                attendanceCharts.push(temp);
                attendanceChartsList.push(attendanceCharts);
                if (row == rows[rows.length - 1])
                  theoryChartsData(request, response);
              }
            }
          );
        }
      }
    }
  );
}

let gradesChartsList = [];
let gradesSubjects = [];
function theoryChartsData(request, response) {
  mySqlConnection.query(
    "SELECT * FROM t_grades WHERE roll_no = ?",
    [user.roll_no],
    (err, rows) => {
      if (err) response.status(500).send(err);
      else {
        let temp = new Object();
        let gradesCharts = [];
        for (row of rows) {
          temp = new Object();
          temp["y"] =
            row.assignment_marks +
            row.attendance_marks +
            row.minor1 +
            row.minor2 +
            row.major;
          gradesCharts = [];
          gradesCharts.push(temp);
          temp = new Object();
          mySqlConnection.query(
            "SELECT * FROM max_t_grades WHERE subject_code = ?",
            [row.subject_code],
            (err, newRows) => {
              if (err) response.status(500).send(err);
              else {
                temp["y"] =
                  newRows.assignment_marks +
                  newRows.attendance_marks +
                  newRows.minor1 +
                  newRows.minor2 +
                  newRows.major -
                  (row.assignment_marks +
                    row.attendance_marks +
                    row.minor1 +
                    row.minor2 +
                    row.major);
                gradesSubjects.push(newRows[0].subject_name);
                gradesCharts.push(temp);
                gradesChartsList.push(gradesCharts);
                if (row == rows[rows.length - 1])
                  labChartsData(request, response);
              }
            }
          );
        }
      }
    }
  );
}

function labChartsData(request, response) {
  mySqlConnection.query(
    "SELECT * FROM l_grades WHERE roll_no = ?",
    [user.roll_no],
    (err, rows) => {
      if (err) response.status(500).send(err);
      else {
        let temp = new Object();
        let gradesCharts = [];
        for (row of rows) {
          temp = new Object();
          temp["y"] =
            row.assignment_marks +
            row.attendance_marks +
            row.mid_sem +
            row.major;
          gradesCharts = [];
          gradesCharts.push(temp);
          temp = new Object();
          mySqlConnection.query(
            "SELECT * FROM max_l_grades WHERE subject_code = ?",
            [row.subject_code],
            (err, newRows) => {
              if (err) response.status(500).send(err);
              else {
                temp["y"] =
                  newRows.assignment_marks +
                  newRows.attendance_marks +
                  newRows.mid_sem +
                  newRows.major -
                  (row.assignment_marks +
                    row.attendance_marks +
                    row.mid_sem +
                    row.major);
                gradesSubjects.push(newRows[0].subject_name);
                gradesCharts.push(temp);
                gradesChartsList.push(gradesCharts);
                if (row == rows[rows.length - 1])
                  // attendanceChart(request, response);
                  callRender(request, response);
              }
            }
          );
        }
      }
    }
  );
}

var attendanceChartsRender = [];
// function attendanceChart(response, render) {
//   let v = 0;
//   let i = "chartContainer" + v.toString();
//   for (data of attendanceChartsList) {
//     window.onload = function () {
//       var chart = new CanvasJS.Chart(i, {
//         theme: "dark2", // "light1", "light2", "dark1"
//         animationEnabled: false,
//         height: 120,
//         width: 170,
//         title: {
//           text: attendanceSubjects[subjectIterator],
//         },
//         data: [
//           {
//             type: "doughnut",
//             dataPoints: data,
//           },
//         ],
//         options: {
//           //   responsive: false//,
//           maintainAspectRatio: false,
//         },
//       });
//       attendanceChartsRender.push(chart);
//       if (data == attendanceChartsList[attendanceChartsList.length - 1])
//         gradesChart(request, response);
//     };
//     v++;
//     i = "chartContainer" + v.toString();
//   }
// }

var gradesChartRender = [];
// function gradesChart(response, render) {
//   let w = 0;
//   let j = "gradesContainer" + w.toString();
//   for (data of gradesChartsList) {
//     window.onload = function () {
//       var chart = new CanvasJS.Chart(j, {
//         theme: "dark2", // "light1", "light2", "dark1"
//         animationEnabled: false,
//         height: 120,
//         width: 170,
//         title: {
//           text: gradesSubjects[w - 1],
//         },
//         data: [
//           {
//             type: "doughnut",
//             dataPoints: data,
//           },
//         ],
//         options: {
//           //   responsive: false//,
//           maintainAspectRatio: false,
//         },
//       });
//       gradesChartRender.push(chart);
//       if (data == gradesChartsList[gradesChartsList.length - 1])
//         callRender(request, response);
//     };
//     w++;
//     j = "gradesContainer" + w.toString();
//   }
// }

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
      attendanceChartData: attendanceChartsList,
      attendanceSubjects: attendanceSubjects,
      subjectIterator: 1,
      gradesChartData: gradesChartsList,
      gradesSubjects: gradesSubjects,
      gradesIterator: 1,
      attendanceChartsRender: attendanceChartsRender,
      gradesChartRender: gradesChartRender,
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
