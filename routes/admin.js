const express = require("express");
const app = express();
const router = express.Router();
const mySqlConnection = require("../db/db");
const bcrypt = require("bcrypt");
let user, edit;
let path = require("path");

app.use(express.static(path.join(__dirname + "../public/css")));

// Redirecting to Admin Login if no page detail provided in URL
router.get("/", (request, response) => {
  response.redirect("/users/admin_login");
});

// Get request for Admin Login
router.get("/admin_login", (request, response) => {
  // If already logged in don't open login page
  if (!request.session.user)
    response.status(200).sendFile(path.join(__dirname + "/../admin.html"));
  else response.redirect("/users/admin_portal");
});

// Get request for Admin Portal
router.get("/admin_portal", (request, response) => {
  let m_name = "";
  if (m_name) m_name = user.m_name;
  response.render("admin_portal", {
    admin_id: user.admin_id,
    f_name: user.f_name,
    m_name: m_name,
    l_name: user.l_name,
    post: user.post,
    phone: user.phone,
    email: user.email,
    photo: user.photo,
  });
});

// Get request for editing student data
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
    phone: edit.phone,
    email: edit.email,
    cgpa: edit.cgpa,
    semester: edit.semester,
    hostel_no: edit.hostel_no,
    room: edit.room,
    backlogs: backlogs,
    // subjects: subjects,
  });
});

// Get request for editing faculty data
router.get("/faculty_edit", (request, response) => {
  // Subjects
  let subjects = [];
  mySqlConnection.query(
    "SELECT * FROM subject WHERE taught_by = ?",
    [edit.faculty_id],
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
    faculty_id: edit.faculty_id,
    f_name: edit.f_name,
    m_name: m_name,
    l_name: edit.l_name,
    post: edit.post,
    branch_id: edit.branch_id,
    gender: edit.gender,
    dob: edit.dob,
    room: edit.room,
    phone: edit.phone,
    email: edit.email,
    subjects: subjects,
  });
});

// Get request for editing admin data
router.get("/admin_edit", (request, response) => {
  // Middle Name
  let m_name = "";
  if (edit.m_name) m_name = edit.m_name;

  // Rendering Page
  response.render("admin_edit", {
    admin_id: edit.admin_id,
    f_name: edit.f_name,
    m_name: m_name,
    l_name: edit.l_name,
    post: edit.post,
    email: edit.email,
    phone: edit.phone,
    photo: edit.photo,
  });
});

// Post request for Admin Login
router.post("/admin_login", function (request, response) {
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

// Post request for Admin Portal
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
      break;
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

    case "phone":
      let phone = request.body.batch_code,
        email = request.body.email;
      mySqlConnection.query(
        "UPDATE student SET phone = ?, email = ? WHERE roll_no = ?",
        [phone, email, edit.roll_no],
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

    case "photo":
      break;
  }
});

// Post request for editing faculty data
router.post("/faculty_edit", (request, response) => {
  let category = request.body.category;
  switch (category) {
    case "id":
      let faculty_id = request.body.faculty_id;
      mySqlConnection.query(
        "UPDATE faculty SET faculty_id = ? WHERE faculty_id = ?",
        [faculty_id, edit.faculty_id],
        (err) => {
          if (err) response.status(500).send(err);
          mySqlConnection.query(
            "SELECT * FROM faculty WHERE faculty_id = ?",
            [faculty_id],
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
        }
      );
      break;

    case "name":
      let f_name = request.body.f_name,
        m_name = request.body.m_name,
        l_name = request.body.l_name;
      if (m_name == "") {
        mySqlConnection.query(
          "UPDATE faculty SET f_name = ?, l_name = ? WHERE faculty_id = ?",
          [f_name, l_name, edit.faculty_id],
          (err) => {
            if (err) response.status(500).send(err);
          }
        );
      } else {
        mySqlConnection.query(
          "UPDATE faculty SET f_name = ?, m_name = ?, l_name = ? WHERE faculty_id = ?",
          [f_name, m_name, l_name, edit.faculty_id],
          (err) => {
            if (err) response.status(500).send(err);
          }
        );
      }
      mySqlConnection.query(
        "SELECT * FROM faculty WHERE faculty_id = ?",
        [edit.faculty_id],
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
      break;

    case "post":
      let post = request.body.post,
        branch_id = request.body.branch_id;
      mySqlConnection.query(
        "UPDATE faculty SET post = ?, branch_id = ? WHERE faculty_id = ?",
        [post, branch_id, edit.faculty_id],
        (err) => {
          if (err) response.status(500).send(err);
          mySqlConnection.query(
            "SELECT * FROM faculty WHERE faculty_id = ?",
            [edit.faculty_id],
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
        }
      );
      break;

    case "gender":
      let gender = request.body.gender,
        dob = request.body.dob;
      mySqlConnection.query(
        "UPDATE faculty SET gender = ?, dob = ? WHERE faculty_id = ?",
        [gender, dob, edit.faculty_id],
        (err) => {
          if (err) response.status(500).send(err);
          mySqlConnection.query(
            "SELECT * FROM faculty WHERE faculty_id = ?",
            [edit.faculty_id],
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
            "SELECT * FROM faculty WHERE faculty_id = ?",
            [edit.faculty_id],
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
            "SELECT * FROM faculty WHERE faculty_id = ?",
            [edit.faculty_id],
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
        }
      );
      break;

    case "phone":
      let phone = request.body.batch_code,
        email = request.body.email;
      mySqlConnection.query(
        "UPDATE faculty SET phone = ?, email = ? WHERE faculty_id = ?",
        [phone, email, edit.faculty_id],
        (err) => {
          if (err) response.status(500).send(err);
          mySqlConnection.query(
            "SELECT * FROM faculty WHERE faculty_id = ?",
            [edit.faculty_id],
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
        }
      );
      break;

    case "photo":
      break;
  }
});

// Post request for editing admin data
router.post("/admin_edit", (request, response) => {
  let category = request.body.category;
  switch (category) {
    case "id":
      let admin_id = request.body.admin_id;
      mySqlConnection.query(
        "UPDATE admin SET admin_id = ? WHERE admin_id = ?",
        [admin_id, edit.admin_id],
        (err) => {
          if (err) response.status(500).send(err);
          mySqlConnection.query(
            "SELECT * FROM admin WHERE admin_id = ?",
            [admin_id],
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
        }
      );
      break;

    case "name":
      let f_name = request.body.f_name,
        m_name = request.body.m_name,
        l_name = request.body.l_name;
      if (m_name == "") {
        mySqlConnection.query(
          "UPDATE admin SET f_name = ?, l_name = ? WHERE admin_id = ?",
          [f_name, l_name, edit.admin_id],
          (err) => {
            if (err) response.status(500).send(err);
          }
        );
      } else {
        mySqlConnection.query(
          "UPDATE admin SET f_name = ?, m_name = ?, l_name = ? WHERE admin_id = ?",
          [f_name, m_name, l_name, edit.admin_id],
          (err) => {
            if (err) response.status(500).send(err);
          }
        );
      }
      mySqlConnection.query(
        "SELECT * FROM admin WHERE admin_id = ?",
        [edit.admin_id],
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
      break;

    case "phone":
      let phone = request.body.batch_code,
        Email = request.body.Email;
      mySqlConnection.query(
        "UPDATE admin SET phone = ?, Email = ? WHERE admin_id = ?",
        [phone, Email, edit.admin_id],
        (err) => {
          if (err) response.status(500).send(err);
          mySqlConnection.query(
            "SELECT * FROM admin WHERE admin_id = ?",
            [edit.admin_id],
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
        }
      );
      break;

    case "photo":
      break;
  }
});

module.exports = router;
