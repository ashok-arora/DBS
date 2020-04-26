const express = require("express");
const app = express();
const router = express.Router();
const mySqlConnection = require("../db/db");
const bcrypt = require("bcrypt");
let user, edit;
let path = require("path");

// app.use(express.static(path.join(__dirname + "/../public/js")));

router.get("/", (request, response) => {
  response.redirect("/users/admin_login");
});

router.get("/admin_login", (request, response) => {
  if (!request.session.user)
    response.status(200).sendFile(path.join(__dirname + "/../student.html"));
  else response.redirect("/users/admin_portal");
});

router.get("/admin_portal", (request, response) => {
  response.render("admin_portal", {
    name: "abc",
    roll: "2019BCS-XXX",
    sem: "I",
  });
});

router.get("/student_edit", (request, response) => {
  //Backlogs
  let backlogs = [];
  mySqlConnection.query(
    "SELECT * FROM backlogs WHERE roll_no = ?",
    [edit.roll_no],
    (err, rows) => {
      if (err) response.status(500).send(err);
      if (rows) {
        backlogs = rows;
        backlogs.push("Add");
      } else {
        backlogs = ["Add"];
      }
    }
  );

  // Branch
  let branch_id = "";
  mySqlConnection.query(
    "SELECT * FROM batch WHERE batch_code = ?",
    [edit.batch_code],
    (err, rows) => {
      if (err) response.status(500).send(err);
      if (rows) {
        branch_id = rows[0];
        // if (rows.length == 1) backlogs = rows[0];
        // else {
        //   for (let i = 0; i < rows.length; i++) {
        //     club += rows[i];
        //     if (i == rows.length - 2) {
        //       club += " and ";
        //     } else if (i != rows.length - 1) {
        //       club += ", ";
        //     }
        //   }
        // }
      } else {
        branch_id = "Batch Code is wrong.";
      }
    }
  );

  // Subjects from batch_subjects
  let subjects = [];
  mySqlConnection.query(
    "SELECT * FROM batch_subjects WHERE batch_code = ?",
    [edit.batch_code],
    (err, rows) => {
      if (err) response.status(500).send(err);
      if (rows) {
        subjects = rows;
        subjects.push("Add");
      } else {
        subjects = ["Add"];
      }
    }
  );

  // Middle Name
  let m_name = "";
  if (edit.m_name) m_name = edit.m_name;

  // Rendering Page
  response.render("student_edit", {
    roll_no: edit.roll_no,
    f_name: edit.f_name,
    m_name: m_name,
    l_name: edit.l_name,
    batch_code: edit.batch_code,
    branch_id: branch_id,
    gender: edit.gender,
    dob: edit.dob,
    cgpa: edit.cgpa,
    semester: edit.semester,
    hostel_no: edit.hostel_no,
    room: edit.room,
    backlogs: backlogs,
    subjects: subjects,
  });
});

router.get("/faculty_edit", (request, response) => {
  response.render("faculty_edit", {
    name: "abc",
    roll: "2019BCS-XXX",
    sem: "I",
  });
});

router.get("/admin_edit", (request, response) => {
  response.render("admin_edit", {
    name: "abc",
    roll: "2019BCS-XXX",
    sem: "I",
  });
});

router.post("/admin_login", function (request, response) {
  // "Add" string in backlogs take care of it
  let(id, password) = request.body;
  mySqlConnection.query(
    "SELECT * FROM admin WHERE admin_id = ?",
    [id],
    (err, rows) => {
      if (err) response.status(500).send(err);
      user = rows[0];
      if (user) {
        const result = bcrypt.compareSync(password, user.password);
        // Easy way to prevent extracting password form cookie, will try better solution later
        password = bcrypt.hashSync(password, 10);
        if (result) {
          request.session.user = user;
          response.redirect("/admin/admin_portal");
        } else {
          response.status(400).send("Password incorrect");
        }
      } else {
        response.status(400).send("Enter correct id");
      }
    }
  );
});

router.post("/admin_portal", (request, response) => {
  let(id, category) = request.body;
  switch (category) {
    case "student":
      mySqlConnection.query(
        "SELECT * FROM student WHERE roll_no = ?",
        [id],
        (err, rows) => {
          if (err) response.status(500).send(err);
          edit = rows[0];
          if (edit) {
            request.session.edit = edit;
            response.redirect("/admin/student_edit");
          } else {
            response.status(400).send("Roll No. does not exist.");
          }
        }
      );
    // if (id) {
    //   connection.query(
    //     "SELECT * FROM student WHERE roll_no = ?",
    //     [id],
    //     function (error, results, fields) {
    //       if (results.length > 0) {
    //         request.session.loggedin = true;
    //         request.session.username = username;
    //         response.redirect("/users/student_portal");
    //       } else {
    //         response.send("Roll No. does not exist");
    //       }
    //       response.end();
    //     }
    //   );
    // } else {
    //   response.send("Please enter Roll No.");
    // }
    // break;
    case "faculty":
      mySqlConnection.query(
        "SELECT * FROM faculty WHERE faculty_id = ?",
        [id],
        (err, rows) => {
          if (err) response.status(500).send(err);
          edit = rows[0];
          if (edit) {
            request.session.edit = edit;
            response.redirect("/admin/faculty_edit");
          } else {
            response.status(400).send("Id does not exist.");
          }
        }
      );
      // if (id) {
      //   connection.query(
      //     "SELECT * FROM students WHERE roll_no = ?",
      //     [roll_no],
      //     function (error, results, fields) {
      //       if (results.length > 0) {
      //         request.session.loggedin = true;
      //         request.session.username = username;
      //         response.redirect("/users/student_portal");
      //       } else {
      //         response.send("Roll No. does not exist");
      //       }
      //       response.end();
      //     }
      //   );
      // } else {
      //   response.send("Please enter Faculty id");
      // }
      break;
    case "admin":
      mySqlConnection.query(
        "SELECT * FROM admin WHERE admin_id = ?",
        [id],
        (err, rows) => {
          if (err) response.status(500).send(err);
          edit = rows[0];
          if (edit) {
            request.session.edit = edit;
            response.redirect("/admin/admin_edit");
          } else {
            response.status(400).send("Id does not exist.");
          }
        }
      );
      // if (id) {
      //   connection.query(
      //     "SELECT * FROM students WHERE roll_no = ?",
      //     [roll_no],
      //     function (error, results, fields) {
      //       if (results.length > 0) {
      //         request.session.loggedin = true;
      //         request.session.username = username;
      //         response.redirect("/users/student_portal");
      //       } else {
      //         response.send("Roll No. does not exist");
      //       }
      //       response.end();
      //     }
      //   );
      // } else {
      //   response.send("Please enter Admin id");
      // }
      break;
    default:
      response.render("/admin/admin_portal");
  }
});

// Post request for editing student data
router.post("/student_edit", (request, response) => {
  let category = request.body.category;
  switch (category) {
    case "roll":
      let roll_no = request.body.roll_no;
      mySqlConnection.query(
        "UPDATE student SET roll_no = ? WHERE roll_no = ?",
        [roll_no, edit.roll_no],
        (err) => {
          if (err) response.status(500).send(err);
          mySqlConnection.query(
            "SELECT * FROM student WHERE roll_no = ?",
            [roll_no],
            (err, rows) => {
              if (err) response.status(500).send(err);
              edit = rows[0];
              if (edit) {
                request.session.edit = edit;
                response.redirect("/admin/student_edit");
              } else {
                response.status(400).send("Update unsuccessful.");
              }
            }
          );
        }
      );
      break;

    case "name":
      let f_name = request.body.f_name,
        m_name = request.body.m_name,
        l_name = request.body.l_name;
      if (m_name == "") {
        mySqlConnection.query(
          "UPDATE student SET f_name = ?, l_name = ? WHERE roll_no = ?",
          [f_name, l_name, edit.roll_no],
          (err) => {
            if (err) response.status(500).send(err);
          }
        );
      } else {
        mySqlConnection.query(
          "UPDATE student SET f_name = ?, m_name = ?, l_name = ? WHERE roll_no = ?",
          [f_name, m_name, l_name, edit.roll_no],
          (err) => {
            if (err) response.status(500).send(err);
          }
        );
      }
      mySqlConnection.query(
        "SELECT * FROM student WHERE roll_no = ?",
        [edit.roll_no],
        (err, rows) => {
          if (err) response.status(500).send(err);
          edit = rows[0];
          if (edit) {
            request.session.edit = edit;
            response.redirect("/admin/student_edit");
          } else {
            response.status(400).send("Update unsuccessful.");
          }
        }
      );
      break;

    case "batch":
      let batch_code = request.body.batch_code;
      mySqlConnection.query(
        "UPDATE student SET batch_code = ? WHERE roll_no = ?",
        [batch_code, edit.roll_no],
        (err) => {
          if (err) response.status(500).send(err);
          mySqlConnection.query(
            "SELECT * FROM student WHERE roll_no = ?",
            [edit.roll_no],
            (err, rows) => {
              if (err) response.status(500).send(err);
              edit = rows[0];
              if (edit) {
                request.session.edit = edit;
                response.redirect("/admin/student_edit");
              } else {
                response.status(400).send("Update unsuccessful.");
              }
            }
          );
        }
      );
      break;

    case "gender":
      let gender = request.body.gender,
        dob = request.body.dob;
      mySqlConnection.query(
        "UPDATE student SET gender = ?, dob = ? WHERE roll_no = ?",
        [gender, dob, edit.roll_no],
        (err) => {
          if (err) response.status(500).send(err);
          mySqlConnection.query(
            "SELECT * FROM student WHERE roll_no = ?",
            [edit.roll_no],
            (err, rows) => {
              if (err) response.status(500).send(err);
              edit = rows[0];
              if (edit) {
                request.session.edit = edit;
                response.redirect("/admin/student_edit");
              } else {
                response.status(400).send("Update unsuccessful.");
              }
            }
          );
        }
      );
      break;

    case "cgpa":
      let cgpa = request.body.cgpa,
        semester = request.body.semester;
      mySqlConnection.query(
        "UPDATE student SET cgpa = ?, semester = ? WHERE roll_no = ?",
        [cgpa, semester, edit.roll_no],
        (err) => {
          if (err) response.status(500).send(err);
          mySqlConnection.query(
            "SELECT * FROM student WHERE roll_no = ?",
            [edit.roll_no],
            (err, rows) => {
              if (err) response.status(500).send(err);
              edit = rows[0];
              if (edit) {
                request.session.edit = edit;
                response.redirect("/admin/student_edit");
              } else {
                response.status(400).send("Update unsuccessful.");
              }
            }
          );
        }
      );
      break;

    case "room":
      let hostel_no = request.body.hostel_no,
        room = request.body.room;
      mySqlConnection.query(
        "UPDATE student SET hostel_no = ?, room = ? WHERE roll_no = ?",
        [hostel_no, room, edit.roll_no],
        (err) => {
          if (err) response.status(500).send(err);
          mySqlConnection.query(
            "SELECT * FROM student WHERE roll_no = ?",
            [edit.roll_no],
            (err, rows) => {
              if (err) response.status(500).send(err);
              edit = rows[0];
              if (edit) {
                request.session.edit = edit;
                response.redirect("/admin/student_edit");
              } else {
                response.status(400).send("Update unsuccessful.");
              }
            }
          );
        }
      );
      break;

    case "backlogs":
      let number = request.body.number,
        backlogs = request.body.backlogs;
      if (!(backlogs.length == 1 && backlogs[0] == "Add")) {
        let id = [];
        mySqlConnection.query(
          "SELECT * FROM backlogs WHERE roll_no = ?",
          [edit.roll_no],
          (err, rows) => {
            if (err) response.status(500).send(err);
            for (let i = 0; i < rows.length; i++) {
              id.push(rows[i].s_no);
            }
          }
        );
        // if (id.length == number) {
        //   for (let i = 0; i < number; i++) {
        //     mySqlConnection.query(
        //       "UPDATE backlogs SET subject_code = ? WHERE s_no = ?",
        //       [backlogs[i], id[i]],
        //       (err) => {
        //         if (err) response.status(500).send(err);
        //       }
        //     );
        //   }
        // } else {
        for (let i = 0; i < id.length; i++) {
          mySqlConnection.query(
            "UPDATE backlogs SET subject_code = ? WHERE s_no = ?",
            [backlogs[i], id[i]],
            (err) => {
              if (err) response.status(500).send(err);
            }
          );
        }
        if (backlogs[backlogs.length - 1] != "Add") {
          mySqlConnection.query(
            "INSERT INTO backlogs (roll_no, subject_code) VALUES = ?",
            [edit.roll_no, backlogs[backlogs.length - 1]],
            (err) => {
              if (err) response.status(500).send(err);
            }
          );
        }
        // }
      }
      mySqlConnection.query(
        "SELECT * FROM student WHERE roll_no = ?",
        [edit.roll_no],
        (err, rows) => {
          if (err) response.status(500).send(err);
          edit = rows[0];
          if (edit) {
            request.session.edit = edit;
            response.redirect("/admin/student_edit");
          } else {
            response.status(400).send("Roll No. update unsuccessful.");
          }
        }
      );
      break;
  }
});

// router.post("/faculty_edit", (request, response) => {
//   let(username, password) = request.body;
//   if (username && password) {
//     connection.query(
//       "SELECT * FROM students WHERE username = ? AND password = ?",
//       [username, password],
//       function (error, results, fields) {
//         if (results.length > 0) {
//           request.session.loggedin = true;
//           request.session.username = username;
//           response.redirect("/users/student_portal");
//         } else {
//           response.send("Incorrect Username and/or Password!");
//         }
//         response.end();
//       }
//     );
//   } else {
//     response.send("Please enter Username and Password!");
//     response.end();
//   }
// });

// router.post("/admin_edit", (request, response) => {
//   let(username, password) = request.body;
//   if (username && password) {
//     connection.query(
//       "SELECT * FROM students WHERE username = ? AND password = ?",
//       [username, password],
//       function (error, results, fields) {
//         if (results.length > 0) {
//           request.session.loggedin = true;
//           request.session.username = username;
//           response.redirect("/users/student_portal");
//         } else {
//           response.send("Incorrect Username and/or Password!");
//         }
//         response.end();
//       }
//     );
//   } else {
//     response.send("Please enter Username and Password!");
//     response.end();
//   }
// });

module.exports = router;
