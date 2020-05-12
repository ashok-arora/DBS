const express = require("express");
const app = express();
const router = express.Router();
const mySqlConnection = require("../db/db");
const bcrypt = require("bcrypt");
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
      schedule(request, response);
    });
  }
}

let studentSchedule = new Object();
function schedule(request, response) {
  let date = new Date();
  let weekday = new Array(7);
  weekday[0] = "Sunday";
  weekday[1] = "Monday";
  weekday[2] = "Tuesday";
  weekday[3] = "Wednesday";
  weekday[4] = "Thursday";
  weekday[5] = "Friday";
  weekday[6] = "Saturday";
  let day = weekday[date.getDay()];
  mySqlConnection.query(
    "SELECT * FROM s_time_table WHERE batch_code = ? AND day = ?",
    [user.batch_code, day],
    (err, rows) => {
      if (err) response.status(500).send(err);
      if (rows.length != 0) {
        if (rows[0].t_9 != "") studentSchedule["09:00 - 10:00"] = rows[0].t_9;
        else studentSchedule["09:00 - 10:00"] = "Free";
        if (rows[0].t_10 != "") studentSchedule["10:00 - 11:00"] = rows[0].t_10;
        else studentSchedule["10:00 - 11:00"] = "Free";
        if (rows[0].t_11 != "") studentSchedule["11:00 - 12:00"] = rows[0].t_11;
        else studentSchedule["11:00 - 12:00"] = "Free";
        if (rows[0].t_12 != "") studentSchedule["12:00 - 13:00"] = rows[0].t_12;
        else studentSchedule["12:00 - 13:00"] = "Free";
        if (rows[0].t_2 != "") studentSchedule["14:00 - 15:00"] = rows[0].t_2;
        else studentSchedule["14:00 - 15:00"] = "Free";
        if (rows[0].t_3 != "") studentSchedule["15:00 - 16:00"] = rows[0].t_3;
        else studentSchedule["15:00 - 16:00"] = "Free";
        if (rows[0].t_4 != "") studentSchedule["16:00 - 17:00"] = rows[0].t_4;
        else studentSchedule["16:00 - 17:00"] = "Free";
        if (rows[0].t_5 != "") studentSchedule["17:00 - 18:00"] = rows[0].t_5;
        else studentSchedule["17:00 - 18:00"] = "Free";
      } else {
        studentSchedule["09:00 - 10:00"] = "Free";
        studentSchedule["10:00 - 11:00"] = "Free";
        studentSchedule["11:00 - 12:00"] = "Free";
        studentSchedule["12:00 - 13:00"] = "Free";
        studentSchedule["14:00 - 15:00"] = "Free";
        studentSchedule["15:00 - 16:00"] = "Free";
        studentSchedule["16:00 - 17:00"] = "Free";
        studentSchedule["17:00 - 18:00"] = "Free";
      }
      attendanceData(request, response);
    }
  );
}

let studentAttendance = [];
let facultyAttendance = [];
let attendanceSubjects = [];
function attendanceData(request, response) {
  mySqlConnection.query(
    "SELECT * FROM attendance WHERE roll_no = ?",
    [user.roll_no],
    (err, rows) => {
      if (err) response.status(500).send(err);
      if (rows) {
        for (row of rows) {
          studentAttendance.push(row.attendance);
          mySqlConnection.query(
            "SELECT * FROM subject WHERE subject_code = ?",
            [row.subject_code],
            (err, newRows) => {
              if (err) response.status(500).send(err);
              else {
                facultyAttendance.push(newRows[0].faculty_attendance);
                attendanceSubjects.push(newRows[0].subject_name);
                if (row == rows[rows.length - 1]) theoryData(request, response);
              }
            }
          );
        }
      }
    }
  );
}

let studentTGrades = [];
let maxTGrades = [];
let gradesSubjects = [];
function theoryData(request, response) {
  mySqlConnection.query(
    "SELECT * FROM t_grades WHERE roll_no = ?",
    [user.roll_no],
    (err, rows) => {
      if (err) response.status(500).send(err);
      if (rows) {
        for (row of rows) {
          temp = new Object();
          temp["Assignment"] = row.assignment_marks;
          temp["Attendance"] = row.attendance_marks;
          temp["Minor 1"] = row.minor1;
          temp["Minor 2"] = row.minor2;
          temp["Major"] = row.major;
          studentTGrades.push(temp);
          temp = new Object();
          mySqlConnection.query(
            "SELECT * FROM max_t_grades WHERE subject_code = ?",
            [row.subject_code],
            (err, newRows) => {
              if (err) response.status(500).send(err);
              else {
                temp["Assignment"] = newRows.assignment_marks;
                temp["Attendance"] = newRows.attendance_marks;
                temp["Minor 1"] = newRows.minor1;
                temp["Minor 2"] = newRows.minor2;
                temp["Major"] = newRows.major;
                maxTGrades.push(temp);
                gradesSubjects.push(newRows.subject_code);
                if (row == rows[rows.length - 1]) labData(request, response);
              }
            }
          );
        }
      }
    }
  );
}

let studentLGrades = [];
let maxLGrades = [];
function labData(request, response) {
  mySqlConnection.query(
    "SELECT * FROM l_grades WHERE roll_no = ?",
    [user.roll_no],
    (err, rows) => {
      if (err) response.status(500).send(err);
      if (rows) {
        for (row of rows) {
          temp = new Object();
          temp["Assignment"] = row.assignment_marks;
          temp["Attendance"] = row.attendance_marks;
          temp["Mid-Sem"] = row.mid_sem;
          temp["Major"] = row.major;
          studentLGrades.push(temp);
          temp = new Object();
          mySqlConnection.query(
            "SELECT * FROM max_l_grades WHERE subject_code = ?",
            [row.subject_code],
            (err, newRows) => {
              if (err) response.status(500).send(err);
              else {
                temp["Assignment"] = newRows.assignment_marks;
                temp["Attendance"] = newRows.attendance_marks;
                temp["Mid-Sem"] = newRows.mid_sem;
                temp["Major"] = newRows.major;
                maxLGrades.push(temp);
                gradesSubjects.push(newRows.subject_code);
                if (row == rows[rows.length - 1]) callRender(request, response);
              }
            }
          );
        }
      }
    }
  );
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
      studentSchedule: studentSchedule,
      studentAttendance: studentAttendance,
      facultyAttendance: facultyAttendance,
      attendanceSubjects: attendanceSubjects,
      studentTGrades: studentTGrades,
      maxTGrades: maxTGrades,
      studentLGrades: studentLGrades,
      maxLGrades: maxLGrades,
      gradesSubjects: gradesSubjects,
      style: "/css/student_portal.css",
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
router.post("/faculty_login", function (request, response) {
  let { faculty_id, password } = request.body;
  mySqlConnection.query(
    "SELECT * FROM faculty WHERE faculty_id = ?",
    [faculty_id],
    (err, rows) => {
      if (err) response.status(500).send(err);
      user = rows[0];
      if (user) {
        const result = bcrypt.compareSync(password, user.password);
        // Easy way to prevent extracting password form cookie, will try better solution later
        password = bcrypt.hashSync(password, 10);
        if (result) {
          request.session.user = user;
          response.redirect("/users/faculty_portal");
        } else {
          response.status(400).send("Incorrect Password");
        }
      } else {
        response.status(400).send("Invalid Id");
      }
    }
  );
});

// Get request for Faculty Portal
router.get("/faculty_portal", (request, response) => {
  if (!request.session.user) response.redirect("/users/faculty_login");
  if (user != undefined) {
    response.render("faculty_portal", {
      roll_no: user.roll_no,
      f_name: user.f_name,
      m_name: m_name,
      l_name: user.l_name,
      assignment_number: assignment_number,
      phone: user.phone,
      email: user.email,
      photo: user.photo,
      batch_code: user.batch_code,
    });
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
