const express = require("express");
const app = express();
const router = express.Router();
const mySqlConnection = require("../db/db");
const bcrypt = require("bcrypt");
let admin, edit;
let path = require("path");

app.use(express.static(path.join(__dirname + "../public/css")));
app.use(express.static(path.join(__dirname + "../public/js")));

function convertDate(str) {
  var date = new Date(str),
    mnth = ("0" + (date.getMonth() + 1)).slice(-2),
    day = ("0" + date.getDate()).slice(-2);
  return [date.getFullYear(), mnth, day].join("");
}

// Redirecting to Admin Login if no page detail provided in URL
router.get("/", (request, response) => {
  response.redirect("/admin/login");
});

// Get request for Admin Login
router.get("/login", (request, response) => {
  // If already logged in don't open login page
  if (!request.session.admin)
    response.status(200).sendFile(path.join(__dirname + "/../admin.html"));
  else response.redirect("/admin/portal");
});

// Post request for Admin Login
router.post("/login", function (request, response) {
  let id = request.body.id,
    password = request.body.password;
  mySqlConnection.query(
    "SELECT * FROM admin WHERE admin_id = ?",
    [id],
    (err, rows) => {
      if (err) response.status(500).send(err);
      admin = rows[0];
      if (admin) {
        const result = bcrypt.compareSync(password, admin.password);
        // Easy way to prevent extracting password form cookie, will try better solution later
        password = bcrypt.hashSync(password, 10);
        if (result) {
          request.session.admin = admin;
          response.redirect("/admin/portal");
        } else {
          response.status(400).send("Password incorrect");
        }
      } else {
        response.status(400).send("Enter correct id");
      }
    }
  );
});

// Get request for Admin Portal
router.get("/portal", (request, response) => {
  if (!request.session.admin) response.redirect("/admin/login");
  else {
    response.render("admin_portal", {
      admin_id: admin.admin_id,
      f_name: admin.f_name,
      m_name: admin.m_name,
      l_name: admin.l_name,
      post: admin.post,
      phone: admin.phone,
      Email: admin.Email,
      photo: admin.photo,
      style: "/css/admin_portal.css",
    });
  }
});

// Post request for Admin Portal
router.post("/portal", (request, response) => {
  let id = request.body.id,
    category = request.body.category;
  switch (category) {
    case "student":
      {
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
      }
      break;

    case "faculty":
      {
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
      }
      break;

    case "admin":
      {
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
      }
      break;

    case "club":
      {
        mySqlConnection.query(
          "SELECT * FROM club WHERE club_id = ?",
          [id],
          (err, rows) => {
            if (err) response.status(500).send(err);
            edit = rows[0];
            if (edit) {
              request.session.edit = edit;
              response.redirect("/admin/club_edit");
            } else {
              response.status(400).send("Id does not exist.");
            }
          }
        );
      }
      break;

    case "research":
      {
        mySqlConnection.query(
          "SELECT * FROM research WHERE research_id = ?",
          [id],
          (err, rows) => {
            if (err) response.status(500).send(err);
            edit = rows[0];
            if (edit) {
              request.session.edit = edit;
              response.redirect("/admin/research_edit");
            } else {
              response.status(400).send("Id does not exist.");
            }
          }
        );
      }
      break;

    case "subjects":
      {
        mySqlConnection.query(
          "SELECT * FROM batch WHERE batch_code = ?",
          [id],
          (err, rows) => {
            if (err) response.status(500).send(err);
            edit = rows;
            if (edit) {
              request.session.edit = edit;
              response.redirect("/admin/subjects_edit");
            } else {
              response.status(400).send("Id does not exist.");
            }
          }
        );
      }
      break;

    default:
      response.redirect("/admin/portal");
  }
});

// Get request for editing student data
router.get("/student_edit", (request, response) => {
  // Backlogs
  let backlogs = [];
  mySqlConnection.query(
    "SELECT * FROM backlogs WHERE roll_no = ?",
    [edit.roll_no],
    (err, rows) => {
      if (err) response.status(500).send(err);
      if (rows) {
        for (row of rows) {
          backlogs.push(row.subject_code);
        }
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
        branch_id = rows[0].branch_id;
        // Rendering Page
        response.render("student_edit", {
          roll_no: edit.roll_no,
          f_name: edit.f_name,
          m_name: edit.m_name,
          l_name: edit.l_name,
          batch_code: edit.batch_code,
          branch_id: branch_id,
          gender: edit.gender,
          dob: convertDate(edit.dob),
          phone: edit.phone,
          email: edit.email,
          cgpa: edit.cgpa,
          semester: edit.semester,
          hostel_no: edit.hostel_no,
          room: edit.room,
          backlogs: backlogs,
          style: "/css/admin_portal.css",
        });
      } else {
        branch_id = "Batch Code is wrong.";
        // Rendering Page
        response.render("student_edit", {
          roll_no: edit.roll_no,
          f_name: edit.f_name,
          m_name: edit.m_name,
          l_name: edit.l_name,
          batch_code: edit.batch_code,
          branch_id: branch_id,
          gender: edit.gender,
          dob: convertDate(edit.dob),
          phone: edit.phone,
          email: edit.email,
          cgpa: edit.cgpa,
          semester: edit.semester,
          hostel_no: edit.hostel_no,
          room: edit.room,
          backlogs: backlogs,
          style: "/css/admin_portal.css",
        });
      }
    }
  );
});

// Post request for editing student data
router.post("/student_edit", (request, response) => {
  let category = request.body.category;
  switch (category) {
    case "name":
      {
        let f_name = request.body.f_name,
          m_name = request.body.m_name,
          l_name = request.body.l_name;
        mySqlConnection.query(
          "UPDATE student SET f_name = ?, m_name = ?, l_name = ? WHERE roll_no = ?",
          [f_name, m_name, l_name, edit.roll_no],
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
                  response.status(400).send("Roll No. does not exist.");
                }
              }
            );
          }
        );
      }
      break;

    case "batch":
      {
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
                  response.status(400).send("Roll No. does not exist.");
                }
              }
            );
          }
        );
      }
      break;

    case "gender":
      {
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
                  response.status(400).send("Roll No. does not exist.");
                }
              }
            );
          }
        );
      }
      break;

    case "phone":
      {
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
                  response.status(400).send("Roll No. does not exist.");
                }
              }
            );
          }
        );
      }
      break;

    case "cgpa":
      {
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
                  response.status(400).send("Roll No. does not exist.");
                }
              }
            );
          }
        );
      }
      break;

    case "room":
      {
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
                  response.status(400).send("Roll No. does not exist.");
                }
              }
            );
          }
        );
      }
      break;

    case "backlogs":
      {
        let backlogs = request.body.backlogs;
        if (!(backlogs.length == 1 && backlogs[0] == "Add")) {
          let id = [];
          mySqlConnection.query(
            "SELECT * FROM backlogs WHERE roll_no = ?",
            [edit.roll_no],
            (err, rows) => {
              if (err) response.status(500).send(err);
              else {
                for (row of rows) {
                  id.push(row.s_no);
                }
                for (let i = 0; i < id.length; i++) {
                  if (backlogs[i] != "") {
                    mySqlConnection.query(
                      "SELECT * FROM batch_subjects WHERE batch_code = ?",
                      [edit.batch_code],
                      (err, rows) => {
                        if (err) response.status(500).send(err);
                        for (row in rows) {
                          if (row.subject_code == backlogs[i]) {
                            mySqlConnection.query(
                              "UPDATE backlogs SET subject_code = ? WHERE s_no = ?",
                              [backlogs[i], id[i]],
                              (err) => {
                                if (err) response.status(500).send(err);
                              }
                            );
                          }
                        }
                      }
                    );
                  } else {
                    mySqlConnection.query(
                      "DELETE FROM backlogs WHERE s_no = ?",
                      [id[i]],
                      (err) => {
                        if (err) response.status(500).send(err);
                      }
                    );
                  }
                }
                if (backlogs[backlogs.length - 1] != "Add") {
                  mySqlConnection.query(
                    "SELECT * FROM batch_subjects WHERE batch_code = ?",
                    [edit.batch_code],
                    (err, rows) => {
                      if (err) response.status(500).send(err);
                      for (row in rows) {
                        if (row.subject_code == backlogs[backlogs.length - 1]) {
                          mySqlConnection.query(
                            "INSERT INTO backlogs (subject_code, roll_no) VALUES (?)",
                            [[backlogs[backlogs.length - 1], edit.roll_no]],
                            (err) => {
                              if (err) response.status(500).send(err);
                            }
                          );
                        }
                      }
                    }
                  );
                }
              }
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
              response.status(400).send("Roll No. does not exist.");
            }
          }
        );
      }
      break;

    case "photo":
      {
        // Photo change
      }
      break;
  }
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

  // Rendering Page
  response.render("faculty_edit", {
    faculty_id: edit.faculty_id,
    f_name: edit.f_name,
    m_name: edit.m_name,
    l_name: edit.l_name,
    post: edit.post,
    branch_id: edit.branch_id,
    gender: edit.gender,
    dob: convertDate(edit.dob),
    room: edit.room,
    phone: edit.phone,
    email: edit.email,
    subjects: subjects,
    style: "/css/admin_portal.css",
  });
});

// Post request for editing faculty data
router.post("/faculty_edit", (request, response) => {
  let category = request.body.category;
  switch (category) {
    case "name":
      {
        let f_name = request.body.f_name,
          m_name = request.body.m_name,
          l_name = request.body.l_name;
        mySqlConnection.query(
          "UPDATE faculty SET f_name = ?, m_name = ?, l_name = ? WHERE faculty_id = ?",
          [f_name, m_name, l_name, edit.faculty_id],
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
      }
      break;

    case "post":
      {
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
      }
      break;

    case "gender":
      {
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
      }
      break;

    case "room":
      {
        let room = request.body.room;
        mySqlConnection.query(
          "UPDATE faculty SET room = ? WHERE faculty_id = ?",
          [room, edit.faculty_id],
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
      }
      break;

    case "phone":
      {
        let phone = request.body.phone,
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
      }
      break;

    case "photo":
      {
        // Photo change
      }
      break;
  }
});

// Get request for editing admin data
router.get("/admin_edit", (request, response) => {
  // Rendering Page
  response.render("admin_edit", {
    admin_id: edit.admin_id,
    f_name: edit.f_name,
    m_name: edit.m_name,
    l_name: edit.l_name,
    post: edit.post,
    Email: edit.Email,
    phone: edit.phone,
    photo: edit.photo,
    style: "/css/admin_portal.css",
  });
});

// Post request for editing admin data
router.post("/admin_edit", (request, response) => {
  let category = request.body.category;
  switch (category) {
    case "name":
      {
        let f_name = request.body.f_name,
          m_name = request.body.m_name,
          l_name = request.body.l_name;
        mySqlConnection.query(
          "UPDATE admin SET f_name = ?, m_name = ?, l_name = ? WHERE admin_id = ?",
          [f_name, m_name, l_name, edit.admin_id],
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
      }
      break;

    case "phone":
      {
        let phone = request.body.phone,
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
      }
      break;

    case "photo":
      {
        // Photo change
      }
      break;
  }
});

// Get request for editing club data
router.get("/club_edit", (request, response) => {
  // Members
  let members = [];
  mySqlConnection.query(
    "SELECT * FROM student_club WHERE club_id = ?",
    [edit.club_id],
    (err, rows) => {
      if (err) response.status(500).send(err);
      if (rows) {
        for (row of rows) {
          members.push(row.roll_no);
        }
        members.push("Add");
      } else {
        members = ["Add"];
      }
    }
  );

  // Faculty phone and email
  let phone = "",
    email = "";
  mySqlConnection.query(
    "SELECT * FROM faculty WHERE faculty_id = ?",
    [edit.faculty_coordinator],
    (err, rows) => {
      if (err) response.status(500).send(err);
      if (rows) {
        phone = rows[0].phone;
        email = rows[0].email;
        // Rendering Page
        response.render("club_edit", {
          club_id: edit.club_id,
          club_name: edit.club_name,
          club_room_no: edit.club_room_no,
          faculty_coordinator: edit.faculty_coordinator,
          phone: phone,
          email: email,
          members: members,
          style: "/css/admin_portal.css",
        });
      }
    }
  );
});

// Post request for editing club data
router.post("/club_edit", (request, response) => {
  let category = request.body.category;
  switch (category) {
    case "name":
      {
        let club_name = request.body.club_name;
        mySqlConnection.query(
          "UPDATE club SET club_name = ? WHERE club_id = ?",
          [club_name, edit.club_id],
          (err) => {
            if (err) response.status(500).send(err);
            mySqlConnection.query(
              "SELECT * FROM club WHERE club_id = ?",
              [edit.club_id],
              (err, rows) => {
                if (err) response.status(500).send(err);
                edit = rows[0];
                if (edit) {
                  request.session.edit = edit;
                  response.redirect("/admin/club_edit");
                } else {
                  response.status(400).send("Id does not exist.");
                }
              }
            );
          }
        );
      }
      break;

    case "coordinator":
      {
        let faculty_coordinator = request.body.faculty_coordinator,
          phone = request.body.phone,
          email = request.body.email;
        mySqlConnection.query(
          "UPDATE club SET faculty_coordinator = ? WHERE club_id = ?",
          [faculty_coordinator, edit.club_id],
          (err) => {
            if (err) response.status(500).send(err);
            mySqlConnection.query(
              "UPDATE faculty SET phone = ?, email = ? WHERE faculty_id = ?",
              [phone, email, faculty_coordinator],
              (err) => {
                if (err) response.status(500).send(err);
                mySqlConnection.query(
                  "SELECT * FROM club WHERE club_id = ?",
                  [edit.club_id],
                  (err, rows) => {
                    if (err) response.status(500).send(err);
                    edit = rows[0];
                    if (edit) {
                      request.session.edit = edit;
                      response.redirect("/admin/club_edit");
                    } else {
                      response.status(400).send("Id does not exist.");
                    }
                  }
                );
              }
            );
          }
        );
      }
      break;

    case "room":
      {
        let club_room_no = request.body.club_room_no;
        mySqlConnection.query(
          "UPDATE club SET club_room_no = ? WHERE club_id = ?",
          [club_room_no, edit.club_id],
          (err) => {
            if (err) response.status(500).send(err);
            mySqlConnection.query(
              "SELECT * FROM club WHERE club_id = ?",
              [edit.club_id],
              (err, rows) => {
                if (err) response.status(500).send(err);
                edit = rows[0];
                if (edit) {
                  request.session.edit = edit;
                  response.redirect("/admin/club_edit");
                } else {
                  response.status(400).send("Id does not exist.");
                }
              }
            );
          }
        );
      }
      break;

    case "members":
      {
        let members = request.body.members;
        if (!(members.length == 1 && members[0] == "Add")) {
          let id = [];
          mySqlConnection.query(
            "SELECT * FROM student_club WHERE club_id = ?",
            [edit.club_id],
            (err, rows) => {
              if (err) response.status(500).send(err);
              for (let i = 0; i < rows.length; i++) {
                id.push(rows[i].s_no);
              }
            }
          );
          for (let i = 0; i < id.length; i++) {
            mySqlConnection.query(
              "UPDATE student_club SET roll_no = ? WHERE s_no = ?",
              [members[i], id[i]],
              (err) => {
                if (err) response.status(500).send(err);
              }
            );
          }
          if (members[members.length - 1] != "Add") {
            // input =
            //   `("` +
            //   members[members.length - 1].toString() +
            //   `", "` +
            //   edit.club_id.toString() +
            mySqlConnection.query(
              "INSERT INTO student_club (roll_no, club_id) VALUES (?)",
              [members[members.length - 1], edit.club_id],
              (err) => {
                if (err) response.status(500).send(err);
              }
            );
          }
        }
        mySqlConnection.query(
          "SELECT * FROM club WHERE club_id = ?",
          [edit.club_id],
          (err, rows) => {
            if (err) response.status(500).send(err);
            edit = rows[0];
            if (edit) {
              request.session.edit = edit;
              response.redirect("/admin/club_edit");
            } else {
              response.status(400).send("Id does not exist.");
            }
          }
        );
      }
      break;
  }
});

// Get request for editing Research data
router.get("/research_edit", (request, response) => {
  // Members
  let students = [];
  mySqlConnection.query(
    "SELECT * FROM research_assistants WHERE research_id = ?",
    [edit.research_id],
    (err, rows) => {
      if (err) response.status(500).send(err);
      if (rows) {
        for (row of rows) {
          students.push(row.roll_no);
        }
        students.push("Add");
      } else {
        students = ["Add"];
      }
    }
  );

  let proposers = [];
  mySqlConnection.query(
    "SELECT * FROM research_proposers WHERE research_id = ?",
    [edit.research_id],
    (err, rows) => {
      if (err) response.status(500).send(err);
      if (rows) {
        for (row of rows) {
          proposers.push(row.faculty_id);
        }
        proposers.push("Add");
      } else {
        proposers = ["Add"];
      }
      // Rendering Page
      response.render("research_edit", {
        research_id: edit.research_id,
        research_name: edit.research_name,
        room: edit.room,
        expected_completion_date: convertDate(edit.expected_completion_date),
        proposers: proposers,
        students: students,
        style: "/css/admin_portal.css",
      });
    }
  );
});

// Post request for editing Research data
router.post("/research_edit", (request, response) => {
  let category = request.body.category;
  switch (category) {
    case "name":
      {
        let research_name = request.body.research_name;
        mySqlConnection.query(
          "UPDATE research SET research_name = ? WHERE research_id = ?",
          [research_name, edit.research_id],
          (err) => {
            if (err) response.status(500).send(err);
            mySqlConnection.query(
              "SELECT * FROM research WHERE research_id = ?",
              [edit.research_id],
              (err, rows) => {
                if (err) response.status(500).send(err);
                edit = rows[0];
                if (edit) {
                  request.session.edit = edit;
                  response.redirect("/admin/research_edit");
                } else {
                  response.status(400).send("Id does not exist.");
                }
              }
            );
          }
        );
      }
      break;

    case "date":
      {
        let expected_completion_date = request.body.expected_completion_date;
        mySqlConnection.query(
          "UPDATE research SET expected_completion_date = ? WHERE research_id = ?",
          [expected_completion_date, edit.reseach_id],
          (err) => {
            if (err) response.status(500).send(err);
            mySqlConnection.query(
              "SELECT * FROM research WHERE research_id = ?",
              [edit.research_id],
              (err, rows) => {
                if (err) response.status(500).send(err);
                edit = rows[0];
                if (edit) {
                  request.session.edit = edit;
                  response.redirect("/admin/research_edit");
                } else {
                  response.status(400).send("Id does not exist.");
                }
              }
            );
          }
        );
      }
      break;

    case "proposers":
      {
        let proposers = request.body.proposers;
        if (!(proposers.length == 1 && proposers[0] == "Add")) {
          let id = [];
          mySqlConnection.query(
            "SELECT * FROM research_proposers WHERE research_id = ?",
            [edit.research_id],
            (err, rows) => {
              if (err) response.status(500).send(err);
              for (let i = 0; i < rows.length; i++) {
                id.push(rows[i].s_no);
              }
            }
          );
          for (let i = 0; i < id.length; i++) {
            mySqlConnection.query(
              "UPDATE research_proposers SET faculty_id = ? WHERE s_no = ?",
              [proposers[i], id[i]],
              (err) => {
                if (err) response.status(500).send(err);
              }
            );
          }
          if (proposers[proposers.length - 1] != "Add") {
            // input =
            //   `("` +
            //   proposers[proposers.length - 1].toString() +
            //   `", "` +
            //   edit.research_id.toString() +
            //   `")`;
            mySqlConnection.query(
              "INSERT INTO research_proposers (faculty_id, research_id) VALUES (?)",
              [proposers[proposers.length - 1], edit.research_id],
              (err) => {
                if (err) response.status(500).send(err);
              }
            );
          }
        }
        mySqlConnection.query(
          "SELECT * FROM research WHERE research_id = ?",
          [edit.research_id],
          (err, rows) => {
            if (err) response.status(500).send(err);
            edit = rows[0];
            if (edit) {
              request.session.edit = edit;
              response.redirect("/admin/research_edit");
            } else {
              response.status(400).send("Id does not exist.");
            }
          }
        );
      }
      break;

    case "students":
      {
        let students = request.body.students;
        if (!(students.length == 1 && students[0] == "Add")) {
          let id = [];
          mySqlConnection.query(
            "SELECT * FROM research_assistants WHERE research_id = ?",
            [edit.research_id],
            (err, rows) => {
              if (err) response.status(500).send(err);
              for (let i = 0; i < rows.length; i++) {
                id.push(rows[i].s_no);
              }
            }
          );
          for (let i = 0; i < id.length; i++) {
            mySqlConnection.query(
              "UPDATE research_assistants SET roll_no = ? WHERE s_no = ?",
              [students[i], id[i]],
              (err) => {
                if (err) response.status(500).send(err);
              }
            );
          }
          if (students[students.length - 1] != "Add") {
            // input =
            //   `("` +
            //   students[students.length - 1].toString() +
            //   `", "` +
            //   edit.research_id.toString() +
            //   `")`;
            mySqlConnection.query(
              "INSERT INTO research_assistants (roll_no, research_id) VALUES (?)",
              [students[students.length - 1], edit.reseach_id],
              (err) => {
                if (err) response.status(500).send(err);
              }
            );
          }
        }
        mySqlConnection.query(
          "SELECT * FROM research WHERE research_id = ?",
          [edit.research_id],
          (err, rows) => {
            if (err) response.status(500).send(err);
            edit = rows[0];
            if (edit) {
              request.session.edit = edit;
              response.redirect("/admin/research_edit");
            } else {
              response.status(400).send("Id does not exist.");
            }
          }
        );
      }
      break;
  }
});

// Get request for editing Subject data
router.get("/subjects_edit", (request, response) => {
  // Subjects
  let subjects = [];
  mySqlConnection.query(
    "SELECT * FROM batch_subjects WHERE batch_code = ?",
    [edit.batch_code],
    (err, rows) => {
      if (err) response.status(500).send(err);
      if (rows) {
        for (row of rows) {
          subjects.push(row.subject_code);
        }
        subjects.push("Add");
      } else {
        subjects = ["Add"];
      }
      // Rendering Page
      response.render("subjects_edit", {
        batch_code: edit.batch_code,
        branch_id: edit.branch_id,
        subjects: subjects,
        style: "/css/admin_portal.css",
      });
    }
  );
});

// Post request for editing Subject data
router.post("/subjects_edit", (request, response) => {
  let category = request.body.category;
  switch (category) {
    case "subjects":
      {
        let subjects = request.body.subjects;
        if (!(subjects.length == 1 && subjects[0] == "Add")) {
          let id = [];
          mySqlConnection.query(
            "SELECT * FROM batch_subjects WHERE batch_code = ?",
            [edit.batch_code],
            (err, rows) => {
              if (err) response.status(500).send(err);
              for (let i = 0; i < rows.length; i++) {
                id.push(rows[i].s_no);
              }
            }
          );
          for (let i = 0; i < id.length; i++) {
            mySqlConnection.query(
              "UPDATE batch_subjects SET subject_code = ? WHERE batch_code = ?",
              [subjects[i], id[i]],
              (err) => {
                if (err) response.status(500).send(err);
              }
            );
          }
          if (subjects[subjects.length - 1] != "Add") {
            // input =
            //   `("` +
            //   subjects[subjects.length - 1].toString() +
            //   `", "` +
            //   edit.batch_code.toString() +
            //   `")`;
            mySqlConnection.query(
              "INSERT INTO batch_subjects (subject_code, batch_code) VALUES (?)",
              [subjects[subjects.length - 1], edit.batch_code],
              (err) => {
                if (err) response.status(500).send(err);
              }
            );
          }
        }
        mySqlConnection.query(
          "SELECT * FROM batch WHERE batch_code = ?",
          [id],
          (err, rows) => {
            if (err) response.status(500).send(err);
            edit = rows;
            if (edit) {
              request.session.edit = edit;
              response.redirect("/admin/subjects_edit");
            } else {
              response.status(400).send("Id does not exist.");
            }
          }
        );
      }
      break;
  }
});

// Get request for Admin Password Change
router.get("/change_password", (request, response) => {
  if (request.session.admin) {
    response.render("change_password", {
      style: "/css/admin_portal.css",
      req: "./change_password",
      back: "/portal",
    });
  }
});

// Post request for Admin Password Change
router.post("/change_password", function (request, response) {
  let { password, newPassword, confirmNewPassword } = request.body;
  if (newPassword == confirmNewPassword) {
    if (bcrypt.compareSync(password, fUser.password)) {
      password = bcrypt.hashSync(password, 10);
      mySqlConnection.query(
        "UPDATE admin SET password = ? WHERE admin_id = ?",
        [bcrypt.hashSync(newPassword, 10), admin.admin_id],
        (err) => {
          if (err) response.status(500).send(err);
          else {
            newPassword = bcrypt.hashSync(newPassword, 10);
            confirmNewPassword = bcrypt.hashSync(confirmNewPassword, 10);
            response.redirect("/admin/logout");
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
  if (request.session.admin) {
    request.session.destroy(() => {
      response.redirect("/admin/login");
    });
  }
});

module.exports = router;
