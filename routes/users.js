const express = require("express");
const app = express();
const router = express.Router();
const mySqlConnection = require("../db/db");
const bcrypt = require("bcrypt");
var sUser,
  fUser,
  assignment_number = "";
var path = require("path");

app.use(express.static(path.join(__dirname + "../public/css")));
app.use(express.static(path.join(__dirname, "./public/assets")));
app.use(express.static(path.join(__dirname + "../public/js")));

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
      sUser = rows[0];
      if (sUser) {
        const result = bcrypt.compareSync(password, sUser.password);
        // Easy way to prevent extracting password form cookie, will try better solution later
        password = bcrypt.hashSync(password, 10);
        if (result) {
          request.session.sUser = sUser;
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
  if (!request.session.sUser) response.redirect("/users/student_login");
  if (sUser != undefined) {
    // Assignments
    let subjects = [];
    mySqlConnection.query(
      "SELECT * FROM batch_subjects WHERE batch_code = ?",
      [sUser.batch_code],
      (err, rows) => {
        if (err) response.status(500).send(err);
        if (rows) {
          for (row of rows) {
            subjects.push(row.subject_code);
          }
          findStudentAssignments(request, response, subjects);
        } else {
          assignment_number = "No Assignments";
          schedule(request, response);
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
  studentSchedule = new Object();
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
    [sUser.batch_code, day],
    (err, rows) => {
      if (err) response.status(500).send(err);
      if (rows.length) {
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
  studentAttendance = [];
  facultyAttendance = [];
  attendanceSubjects = [];
  mySqlConnection.query(
    "SELECT * FROM attendance WHERE roll_no = ?",
    [sUser.roll_no],
    (err, rows) => {
      if (err) response.status(500).send(err);
      if (rows.length) {
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
      } else {
        theoryData(request, response);
      }
    }
  );
}

let studentTGrades = [];
let maxTGrades = [];
let gradesTSubjects = [];
function theoryData(request, response) {
  studentTGrades = [];
  maxTGrades = [];
  gradesTSubjects = [];
  mySqlConnection.query(
    "SELECT * FROM t_grades WHERE roll_no = ?",
    [sUser.roll_no],
    (err, rows) => {
      if (err) response.status(500).send(err);
      if (rows.length) {
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
                temp["Assignment"] = newRows[0].assignment_marks;
                temp["Attendance"] = newRows[0].attendance_marks;
                temp["Minor 1"] = newRows[0].minor1;
                temp["Minor 2"] = newRows[0].minor2;
                temp["Major"] = newRows[0].major;
                maxTGrades.push(temp);
                gradesTSubjects.push(newRows[0].subject_code);
                if (row == rows[rows.length - 1]) labData(request, response);
              }
            }
          );
        }
      } else {
        labData(request, response);
      }
    }
  );
}

let studentLGrades = [];
let maxLGrades = [];
let gradesLSubjects = [];
function labData(request, response) {
  studentLGrades = [];
  maxLGrades = [];
  gradesLSubjects = [];
  mySqlConnection.query(
    "SELECT * FROM l_grades WHERE roll_no = ?",
    [sUser.roll_no],
    (err, rows) => {
      if (err) response.status(500).send(err);
      if (rows.length) {
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
                temp["Assignment"] = newRows[0].assignment_marks;
                temp["Attendance"] = newRows[0].attendance_marks;
                temp["Mid-Sem"] = newRows[0].mid_sem;
                temp["Major"] = newRows[0].major;
                maxLGrades.push(temp);
                gradesLSubjects.push(newRows[0].subject_code);
                if (row == rows[rows.length - 1]) callRender(request, response);
              }
            }
          );
        }
      } else {
        callRender(request, response);
      }
    }
  );
}

function callRender(request, response) {
  response.redirect("/users/student_portal");
}

// Get request for Student Portal
router.get("/student_portal", (request, response) => {
  if (!request.session.sUser) response.redirect("/users/student_login");
  if (sUser != undefined) {
    response.render("student_portal", {
      roll_no: sUser.roll_no,
      f_name: sUser.f_name,
      m_name: sUser.m_name,
      l_name: sUser.l_name,
      assignment_number: assignment_number,
      phone: sUser.phone,
      email: sUser.email,
      photo: sUser.photo,
      batch_code: sUser.batch_code,
      studentSchedule: studentSchedule,
      studentAttendance: studentAttendance,
      facultyAttendance: facultyAttendance,
      attendanceSubjects: attendanceSubjects,
      studentTGrades: studentTGrades,
      maxTGrades: maxTGrades,
      gradesTSubjects: gradesTSubjects,
      studentLGrades: studentLGrades,
      maxLGrades: maxLGrades,
      gradesLSubjects: gradesLSubjects,
      style: "/css/student_portal.css",
    });
  }
});

// Get request for Faculty Login
router.get("/faculty_login", (request, response) => {
  if (!request.session.fUser)
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
      fUser = rows[0];
      if (fUser) {
        const result = bcrypt.compareSync(password, fUser.password);
        // Easy way to prevent extracting password form cookie, will try better solution later
        password = bcrypt.hashSync(password, 10);
        if (result) {
          request.session.fUser = fUser;
          fSchedule(request, response);
        } else {
          response.status(400).send("Incorrect Password");
        }
      } else {
        response.status(400).send("Invalid Id");
      }
    }
  );
});

let facultySchedule = new Object();
function fSchedule(request, response) {
  facultySchedule = new Object();
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
    "SELECT * FROM f_time_table WHERE faculty_id = ? AND day = ?",
    [fUser.faculty_id, day],
    (err, rows) => {
      if (err) response.status(500).send(err);
      if (rows.length) {
        if (rows[0].t_9 != "") facultySchedule["09:00 - 10:00"] = rows[0].t_9;
        else facultySchedule["09:00 - 10:00"] = "Free";
        if (rows[0].t_10 != "") facultySchedule["10:00 - 11:00"] = rows[0].t_10;
        else facultySchedule["10:00 - 11:00"] = "Free";
        if (rows[0].t_11 != "") facultySchedule["11:00 - 12:00"] = rows[0].t_11;
        else facultySchedule["11:00 - 12:00"] = "Free";
        if (rows[0].t_12 != "") facultySchedule["12:00 - 13:00"] = rows[0].t_12;
        else facultySchedule["12:00 - 13:00"] = "Free";
        if (rows[0].t_2 != "") facultySchedule["14:00 - 15:00"] = rows[0].t_2;
        else facultySchedule["14:00 - 15:00"] = "Free";
        if (rows[0].t_3 != "") facultySchedule["15:00 - 16:00"] = rows[0].t_3;
        else facultySchedule["15:00 - 16:00"] = "Free";
        if (rows[0].t_4 != "") facultySchedule["16:00 - 17:00"] = rows[0].t_4;
        else facultySchedule["16:00 - 17:00"] = "Free";
        if (rows[0].t_5 != "") facultySchedule["17:00 - 18:00"] = rows[0].t_5;
        else facultySchedule["17:00 - 18:00"] = "Free";
      } else {
        facultySchedule["09:00 - 10:00"] = "Free";
        facultySchedule["10:00 - 11:00"] = "Free";
        facultySchedule["11:00 - 12:00"] = "Free";
        facultySchedule["12:00 - 13:00"] = "Free";
        facultySchedule["14:00 - 15:00"] = "Free";
        facultySchedule["15:00 - 16:00"] = "Free";
        facultySchedule["16:00 - 17:00"] = "Free";
        facultySchedule["17:00 - 18:00"] = "Free";
      }
      facultyRender(request, response);
    }
  );
}

function facultyRender(request, response) {
  response.redirect("/users/faculty_portal");
}

// Get request for Faculty Portal
router.get("/faculty_portal", (request, response) => {
  if (!request.session.fUser) response.redirect("/users/faculty_login");
  if (fUser != undefined) {
    response.render("faculty_portal", {
      roll_no: fUser.roll_no,
      f_name: fUser.f_name,
      m_name: fUser.m_name,
      l_name: fUser.l_name,
      assignment_number: assignment_number,
      phone: fUser.phone,
      email: fUser.email,
      photo: fUser.photo,
      batch_code: fUser.batch_code,
      facultySchedule: facultySchedule,
      style: "/css/faculty_portal.css",
    });
  }
});

// Post request for Faculty Portal
router.post("/faculty_portal", (request, response) => {
  let category = request.body.category;
  switch (category) {
    case "assignment":
      {
        let subject_code = request.body.subject_code,
          assignment_name = request.body.assignment_name,
          due_date = request.body.due_date;
        mySqlConnection.query(
          "SELECT * FROM subject WHERE taught_by = ?",
          [fUser.faculty_id],
          (err, rows) => {
            if (err) response.status(500).send(err);
            if (rows) {
              for (row of rows) {
                if (row.subject_code == subject_code) {
                  mySqlConnection.query(
                    "INSERT INTO assignment (subject_code, assignment_name, due_date) VALUES (?)",
                    [subject_code, assignment_name, due_date],
                    (err) => {
                      if (err) response.status(500).send(err);
                      else fSchedule(request, response);
                    }
                  );
                }
              }
              response.status(400).send("Subject Code is wrong.");
            } else {
              response.status(400).send("You don't teach any subject.");
            }
          }
        );
      }
      break;

    case "fAttendance":
      {
        let subject_code = request.body.subject_code;
        mySqlConnection.query(
          "SELECT * FROM subject WHERE taught_by = ?",
          [fUser.faculty_id],
          (err, rows) => {
            if (err) response.status(500).send(err);
            if (rows) {
              for (row of rows) {
                if (row.subject_code == subject_code) {
                  mySqlConnection.query(
                    "UPDATE subject SET faculty_attendace = ? WHERE subject_code = ?",
                    [row.faculty_attendance + 1, subject_code],
                    (err) => {
                      if (err) response.status(500).send(err);
                      else fSchedule(request, response);
                    }
                  );
                }
              }
              response.status(400).send("Subject Code is wrong.");
            } else {
              response.status(400).send("You don't teach any subject.");
            }
          }
        );
      }
      break;

    case "grades":
      {
        let term = request.body.term,
          subject_code = request.body.subject_code,
          roll_no = request.body.roll_no,
          grades = request.body.grades;
        mySqlConnection.query(
          "SELECT * FROM subject WHERE taught_by = ?",
          [fUser.faculty_id],
          (err, rows) => {
            if (err) response.status(500).send(err);
            if (rows) {
              for (row of rows) {
                if (row.subject_code == subject_code) {
                  mySqlConnection.query(
                    "SELECT * FROM t_grades WHERE subject_code = ? AND roll_no = ?",
                    [subject_code, roll_no],
                    (err, rows) => {
                      if (err) response.status(500).send(err);
                      if (rows) {
                        switch (term) {
                          case "assignment":
                            {
                              mySqlConnection.query(
                                "UPDATE t_grades SET assignment_marks = ? WHERE subject_code = ? AND roll_no = ?",
                                [grades, subject_code, roll_no],
                                (err) => {
                                  if (err) response.status(500).send(err);
                                  else fSchedule(request, response);
                                }
                              );
                            }
                            break;

                          case "attendance":
                            {
                              mySqlConnection.query(
                                "UPDATE t_grades SET attendance_marks = ? WHERE subject_code = ? AND roll_no = ?",
                                [grades, subject_code, roll_no],
                                (err) => {
                                  if (err) response.status(500).send(err);
                                  else fSchedule(request, response);
                                }
                              );
                            }
                            break;

                          case "minor1":
                            {
                              mySqlConnection.query(
                                "UPDATE t_grades SET minor1 = ? WHERE subject_code = ? AND roll_no = ?",
                                [grades, subject_code, roll_no],
                                (err) => {
                                  if (err) response.status(500).send(err);
                                  else fSchedule(request, response);
                                }
                              );
                            }
                            break;

                          case "minor2":
                            {
                              mySqlConnection.query(
                                "UPDATE t_grades SET minor2 = ? WHERE subject_code = ? AND roll_no = ?",
                                [grades, subject_code, roll_no],
                                (err) => {
                                  if (err) response.status(500).send(err);
                                  else fSchedule(request, response);
                                }
                              );
                            }
                            break;

                          case "major":
                            {
                              mySqlConnection.query(
                                "UPDATE t_grades SET major = ? WHERE subject_code = ? AND roll_no = ?",
                                [grades, subject_code, roll_no],
                                (err) => {
                                  if (err) response.status(500).send(err);
                                  else fSchedule(request, response);
                                }
                              );
                            }
                            break;

                          default:
                            response.status(400).send("Please select term.");
                        }
                      } else {
                        mySqlConnection.query(
                          "SELECT * FROM l_grades WHERE subject_code = ? AND roll_no = ?",
                          [subject_code, roll_no],
                          (err, rows) => {
                            if (err) response.status(500).send(err);
                            if (rows) {
                              switch (term) {
                                case "assignment":
                                  {
                                    mySqlConnection.query(
                                      "UPDATE l_grades SET assignment_marks = ? WHERE subject_code = ? AND roll_no = ?",
                                      [grades, subject_code, roll_no],
                                      (err) => {
                                        if (err) response.status(500).send(err);
                                        else fSchedule(request, response);
                                      }
                                    );
                                  }
                                  break;

                                case "attendance":
                                  {
                                    mySqlConnection.query(
                                      "UPDATE l_grades SET attendance_marks = ? WHERE subject_code = ? AND roll_no = ?",
                                      [grades, subject_code, roll_no],
                                      (err) => {
                                        if (err) response.status(500).send(err);
                                        else fSchedule(request, response);
                                      }
                                    );
                                  }
                                  break;

                                case "mid_sem":
                                  {
                                    mySqlConnection.query(
                                      "UPDATE l_grades SET mid_sem = ? WHERE subject_code = ? AND roll_no = ?",
                                      [grades, subject_code, roll_no],
                                      (err) => {
                                        if (err) response.status(500).send(err);
                                        else fSchedule(request, response);
                                      }
                                    );
                                  }
                                  break;

                                case "major":
                                  {
                                    mySqlConnection.query(
                                      "UPDATE l_grades SET major = ? WHERE subject_code = ? AND roll_no = ?",
                                      [grades, subject_code, roll_no],
                                      (err) => {
                                        if (err) response.status(500).send(err);
                                        else fSchedule(request, response);
                                      }
                                    );
                                  }
                                  break;

                                default:
                                  response
                                    .status(400)
                                    .send("Please select term.");
                              }
                            }
                          }
                        );
                      }
                    }
                  );
                }
              }
              response.status(400).send("Subject Code is wrong.");
            } else {
              response.status(400).send("You don't teach any subject.");
            }
          }
        );
      }
      break;

    case "sAttendance":
      {
        let subject_code = request.body.subject_code,
          roll_no = request.body.roll_no;
        mySqlConnection.query(
          "SELECT * FROM subject WHERE taught_by = ?",
          [fUser.faculty_id],
          (err, rows) => {
            if (err) response.status(500).send(err);
            if (rows) {
              for (row of rows) {
                if (row.subject_code == subject_code) {
                  mySqlConnection.query(
                    "SELECT * FROM attendance WHERE subject_code = ? AND roll_no = ?",
                    [subject_code, roll_no],
                    (err, srows) => {
                      if (err) response.status(500).send(err);
                      if (srows) {
                        mySqlConnection.query(
                          "UPDATE attendance SET attendance = ? WHERE subject_code = ? AND roll_no = ?",
                          [srows[0].attendance + 1, subject_code, roll_no],
                          (err) => {
                            if (err) response.status(500).send(err);
                            else fSchedule(request, response);
                          }
                        );
                      } else {
                        response.status(400).send("Roll No. is wrong.");
                      }
                    }
                  );
                }
              }
              response.status(400).send("Subject Code is wrong.");
            } else {
              response.status(400).send("You don't teach any subject.");
            }
          }
        );
      }
      break;

    default:
      fSchedule(request, response);
  }
});

// Get request for Student Password Change
router.get("/s_change_password", (request, response) => {
  if (request.session.sUser) {
    response.render("change_password", {
      style: "/css/admin_portal.css",
      req: "./s_change_password",
      back: "/student_portal",
    });
  }
});

// Post request for Student Password Change
router.post("/s_change_password", function (request, response) {
  let { password, newPassword, confirmNewPassword } = request.body;
  if (newPassword == confirmNewPassword) {
    if (bcrypt.compareSync(password, sUser.password)) {
      password = bcrypt.hashSync(password, 10);
      mySqlConnection.query(
        "UPDATE student SET password = ? WHERE roll_no = ?",
        [bcrypt.hashSync(newPassword, 10), sUser.roll_no],
        (err) => {
          if (err) response.status(500).send(err);
          else {
            newPassword = bcrypt.hashSync(newPassword, 10);
            confirmNewPassword = bcrypt.hashSync(confirmNewPassword, 10);
            response.redirect("/users/logout");
          }
        }
      );
    } else {
      response.status(400).send("Wrong Password.");
    }
  } else {
    response.status(400).send("Passwords do not match.");
  }
});

// Get request for Faculty Password Change
router.get("/f_change_password", (request, response) => {
  if (request.session.fUser) {
    response.render("change_password", {
      style: "/css/admin_portal.css",
      req: "./f_change_password",
      back: "/faculty_portal",
    });
  }
});

// Post request for Faculty Password Change
router.post("/f_change_password", function (request, response) {
  let { password, newPassword, confirmNewPassword } = request.body;
  if (newPassword == confirmNewPassword) {
    if (bcrypt.compareSync(password, fUser.password)) {
      password = bcrypt.hashSync(password, 10);
      mySqlConnection.query(
        "UPDATE faculty SET password = ? WHERE faculty_id = ?",
        [bcrypt.hashSync(newPassword, 10), fUser.faculty_id],
        (err) => {
          if (err) response.status(500).send(err);
          else {
            newPassword = bcrypt.hashSync(newPassword, 10);
            confirmNewPassword = bcrypt.hashSync(confirmNewPassword, 10);
            response.redirect("/users/logout");
          }
        }
      );
    } else {
      response.status(400).send("Wrong Password.");
    }
  } else {
    response.status(400).send("Passwords do not match.");
  }
});

router.get("/logout", (request, response) => {
  if (request.session.sUser || request.session.fUser) {
    request.session.destroy(() => {
      response.redirect("/");
    });
  }
});

module.exports = router;
