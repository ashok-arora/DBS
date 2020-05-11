const express = require("express");
const app = express();
const router = express.Router();
const mySqlConnection = require("../db/db");
const bcrypt = require("bcrypt");
let user, edit, add_id;
let path = require("path");

app.use(express.static(path.join(__dirname + "../public/css")));
app.use(express.static(path.join(__dirname + "../public/js")));

// Redirecting to Super Admin Login if no page detail provided in URL
router.get("/", (request, response) => {
  response.redirect("/super/login");
});

// Get request for Super Admin Login
router.get("/login", (request, response) => {
  // If already logged in don't open login page
  if (!request.session.user)
    response.status(200).sendFile(path.join(__dirname + "/../super.html"));
  else response.redirect("/super/portal");
});

// Post request for Super Admin Login
router.post("/login", function (request, response) {
  let id = request.body.id,
    password = request.body.password;
  mySqlConnection.query(
    "SELECT * FROM admin WHERE admin_id = ?",
    [id],
    (err, rows) => {
      if (err) response.status(500).send(err);
      user = rows[0];
      // Checking if the admin is super user or not
      if (user.super) {
        if (user) {
          const result = bcrypt.compareSync(password, user.password);
          // Easy way to prevent extracting password form cookie, will try better solution later
          password = bcrypt.hashSync(password, 10);
          if (result) {
            request.session.user = user;
            response.redirect("/super/portal");
          } else {
            response.status(400).send("Password incorrect");
          }
        } else {
          response.status(400).send("Enter correct id");
        }
      } else {
        response.status(400).send("Not a super user");
      }
    }
  );
});

// Get request for Super Admin Portal
router.get("/portal", (request, response) => {
  // If not logged in open login page
  if (!request.session.user) response.redirect("/super/login");
  let m_name = "";
  if (user.m_name) m_name = user.m_name;
  response.render("super_portal", {
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

// Post request for Super Admin Portal
router.post("/portal", (request, response) => {
  let category = request.body.category;
  switch (category) {
    case "admin":
      {
        let task = request.body.task;
        switch (task) {
          case "view":
            {
              mySqlConnection.query("SELECT * FROM admin", (err, rows) => {
                if (err) response.status(500).send(err);
                if (rows) {
                  response.render("table", {
                    table: rows,
                  });
                } else {
                  response.status(400).send("Table is empty.");
                }
              });
            }
            break;
          case "add":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM admin WHERE admin_id = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  if (rows.length) {
                    response.status(400).send("Id already exists.");
                  } else {
                    add_id = id;
                    response.redirect("/super/admin_add");
                  }
                }
              );
            }
            break;
          case "update":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM admin WHERE admin_id = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  edit = rows[0];
                  if (edit) {
                    request.session.edit = edit;
                    response.redirect("/super/admin");
                  } else {
                    response.status(400).send("Id does not exist.");
                  }
                }
              );
            }
            break;
          case "remove":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "DELETE FROM admin WHERE admin_id = ?",
                [id],
                (err) => {
                  if (err) response.status(500).send(err);
                  response.redirect("/super/portal");
                }
              );
            }
            break;
        }
      }
      break;

    case "assignment":
      {
        let task = request.body.task;
        switch (task) {
          case "view":
            {
              mySqlConnection.query("SELECT * FROM assignment", (err, rows) => {
                if (err) response.status(500).send(err);
                if (rows) {
                  response.render("table", {
                    table: rows,
                  });
                } else {
                  response.status(400).send("Table is empty.");
                }
              });
            }
            break;
          case "add":
            {
              response.redirect("/super/assignment_add");
            }
            break;
          case "update":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM assignment WHERE s_no = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  edit = rows[0];
                  if (edit) {
                    request.session.edit = edit;
                    response.redirect("/super/assignment");
                  } else {
                    response.status(400).send("Id does not exist.");
                  }
                }
              );
            }
            break;
          case "remove":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "DELETE FROM assignment WHERE s_no = ?",
                [id],
                (err) => {
                  if (err) response.status(500).send(err);
                  response.redirect("/super/portal");
                }
              );
            }
            break;
        }
      }
      break;

    case "attendance":
      {
        let task = request.body.task;
        switch (task) {
          case "view":
            {
              mySqlConnection.query("SELECT * FROM attendance", (err, rows) => {
                if (err) response.status(500).send(err);
                if (rows) {
                  response.render("table", {
                    table: rows,
                  });
                } else {
                  response.status(400).send("Table is empty.");
                }
              });
            }
            break;
          case "add":
            {
              response.redirect("/super/attendance_add");
            }
            break;
          case "update":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM attendance WHERE s_no = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  edit = rows[0];
                  if (edit) {
                    request.session.edit = edit;
                    response.redirect("/super/attendance");
                  } else {
                    response.status(400).send("Id does not exist.");
                  }
                }
              );
            }
            break;
          case "remove":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "DELETE FROM attendance WHERE s_no = ?",
                [id],
                (err) => {
                  if (err) response.status(500).send(err);
                  response.redirect("/super/portal");
                }
              );
            }
            break;
        }
      }
      break;

    case "backlogs":
      {
        let task = request.body.task;
        switch (task) {
          case "view":
            {
              mySqlConnection.query("SELECT * FROM backlogs", (err, rows) => {
                if (err) response.status(500).send(err);
                if (rows) {
                  response.render("table", {
                    table: rows,
                  });
                } else {
                  response.status(400).send("Table is empty.");
                }
              });
            }
            break;
          case "add":
            {
              response.redirect("/super/backklogs_add");
            }
            break;
          case "update":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM backlogs WHERE s_no = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  edit = rows[0];
                  if (edit) {
                    request.session.edit = edit;
                    response.redirect("/super/backlogs");
                  } else {
                    response.status(400).send("Id does not exist.");
                  }
                }
              );
            }
            break;
          case "remove":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "DELETE FROM backlogs WHERE s_no = ?",
                [id],
                (err) => {
                  if (err) response.status(500).send(err);
                  else response.redirect("/super/portal");
                }
              );
            }
            break;
        }
      }
      break;

    case "batch":
      {
        let task = request.body.task;
        switch (task) {
          case "view":
            {
              mySqlConnection.query("SELECT * FROM batch", (err, rows) => {
                if (err) response.status(500).send(err);
                if (rows.length) {
                  response.render("table", {
                    table: rows,
                  });
                } else {
                  response.status(400).send("Table is empty.");
                }
              });
            }
            break;
          case "add":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM batch WHERE batch_code = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  if (rows.length) {
                    response.status(400).send("Id already exists.");
                  } else {
                    add_id = id;
                    response.redirect("/super/batch_add");
                  }
                }
              );
            }
            break;
          case "update":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM batch WHERE batch_code = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  edit = rows[0];
                  if (edit) {
                    request.session.edit = edit;
                    response.redirect("/super/batch");
                  } else {
                    response.status(400).send("Id does not exist.");
                  }
                }
              );
            }
            break;
          case "remove":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM student WHERE batch_code = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  if (rows) {
                    response
                      .status(400)
                      .send(
                        "Can't Delete. There are some students with this Batch Code."
                      );
                  } else {
                    mySqlConnection.query(
                      "DELETE FROM batch WHERE batch_code = ?",
                      [id],
                      (err) => {
                        if (err) response.status(500).send(err);
                        mySqlConnection.query(
                          "DELETE FROM batch_subjects WHERE batch_code = ?",
                          [id],
                          (err) => {
                            if (err) response.status(500).send(err);
                            mySqlConnection.query(
                              "DELETE FROM s_time_table WHERE batch_code = ?",
                              [id],
                              (err) => {
                                if (err) response.status(500).send(err);
                                response.redirect("/super/portal");
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                }
              );
            }
            break;
        }
      }
      break;

    case "batch_subjects":
      {
        let task = request.body.task;
        switch (task) {
          case "view":
            {
              mySqlConnection.query(
                "SELECT * FROM batch_subjects",
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  if (rows) {
                    response.render("table", {
                      table: rows,
                    });
                  } else {
                    response.status(400).send("Table is empty.");
                  }
                }
              );
            }
            break;
          case "add":
            {
              response.redirect("/super/batch_subjects_add");
            }
            break;
          case "update":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM batch_subjects WHERE s_no = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  edit = rows[0];
                  if (edit) {
                    request.session.edit = edit;
                    response.redirect("/super/batch_subjects");
                  } else {
                    response.status(400).send("Id does not exist.");
                  }
                }
              );
            }
            break;
          case "remove":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "DELETE FROM batch_subjects WHERE s_no = ?",
                [id],
                (err) => {
                  if (err) response.status(500).send(err);
                  response.redirect("/super/portal");
                }
              );
            }
            break;
        }
      }
      break;

    case "branch":
      {
        let task = request.body.task;
        switch (task) {
          case "view":
            {
              mySqlConnection.query("SELECT * FROM branch", (err, rows) => {
                if (err) response.status(500).send(err);
                if (rows) {
                  response.render("table", {
                    table: rows,
                  });
                } else {
                  response.status(400).send("Table is empty.");
                }
              });
            }
            break;
          case "add":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM branch WHERE branch_id = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  if (rows.length) {
                    response.status(400).send("Id already exists.");
                  } else {
                    add_id = id;
                    response.redirect("/super/branch_add");
                  }
                }
              );
            }
            break;
          case "update":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM branch WHERE branch_id = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  edit = rows[0];
                  if (edit) {
                    request.session.edit = edit;
                    response.redirect("/super/branch");
                  } else {
                    response.status(400).send("Id does not exist.");
                  }
                }
              );
            }
            break;
          case "remove":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM faculty WHERE branch_id = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  if (rows.length) {
                    response
                      .status(400)
                      .send(
                        "Can't delete. There is some faculty with this branch_id."
                      );
                  } else {
                    mySqlConnection.query(
                      "DELETE FROM branch WHERE branch_id = ?",
                      [id],
                      (err) => {
                        if (err) response.status(500).send(err);
                        response.redirect("/super/portal");
                      }
                    );
                  }
                }
              );
            }
            break;
        }
      }
      break;

    case "club":
      {
        let task = request.body.task;
        switch (task) {
          case "view":
            {
              mySqlConnection.query("SELECT * FROM club", (err, rows) => {
                if (err) response.status(500).send(err);
                if (rows) {
                  response.render("table", {
                    table: rows,
                  });
                } else {
                  response.status(400).send("Table is empty.");
                }
              });
            }
            break;
          case "add":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM club WHERE club_id = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  if (rows.length) {
                    response.status(400).send("Id already exists.");
                  } else {
                    add_id = id;
                    response.redirect("/super/club_add");
                  }
                }
              );
            }
            break;
          case "update":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM club WHERE club_id = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  edit = rows[0];
                  if (edit) {
                    request.session.edit = edit;
                    response.redirect("/super/club");
                  } else {
                    response.status(400).send("Id does not exist.");
                  }
                }
              );
            }
            break;
          case "remove":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "DELETE FROM club WHERE club_id = ?",
                [id],
                (err) => {
                  if (err) response.status(500).send(err);
                  mySqlConnection.query(
                    "DELETE FROM student_club WHERE club_id = ?",
                    [id],
                    (err) => {
                      if (err) response.status(500).send(err);
                      else response.redirect("/super/portal");
                    }
                  );
                }
              );
            }
            break;
        }
      }
      break;

    case "faculty":
      {
        let task = request.body.task;
        switch (task) {
          case "view":
            {
              mySqlConnection.query("SELECT * FROM faculty", (err, rows) => {
                if (err) response.status(500).send(err);
                if (rows) {
                  response.render("table", {
                    table: rows,
                  });
                } else {
                  response.status(400).send("Table is empty.");
                }
              });
            }
            break;
          case "add":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM faculty WHERE faculty_id = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  if (rows.length) {
                    response.status(400).send("Id already exists.");
                  } else {
                    add_id = id;
                    response.redirect("/super/faculty_add");
                  }
                }
              );
            }
            break;
          case "update":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM faculty WHERE faculty_id = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  edit = rows[0];
                  if (edit) {
                    request.session.edit = edit;
                    response.redirect("/super/faculty");
                  } else {
                    response.status(400).send("Id does not exist.");
                  }
                }
              );
            }
            break;
          case "remove":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM club WHERE faculty_coordinator = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  if (rows.length) {
                    response
                      .status(400)
                      .send(
                        "Can't delete. There are some clubs associated with this Faculty Id."
                      );
                  } else {
                    mySqlConnection.query(
                      "SELECT * FROM subject WHERE taught_by = ?",
                      [id],
                      (err, rows) => {
                        if (err) response.status(500).send(err);
                        if (rows.length) {
                          response
                            .status(400)
                            .send(
                              "Can't delete. This faculty teaches some subjects."
                            );
                        } else {
                          mySqlConnection.query(
                            "SELECT * FROM subject WHERE proposer = ?",
                            [id],
                            (err, rows) => {
                              if (err) response.status(500).send(err);
                              if (rows.length) {
                                response
                                  .status(400)
                                  .send(
                                    "Can't delete. This faculty has proposed some subjects."
                                  );
                              } else {
                                mySqlConnection.query(
                                  "DELETE FROM faculty WHERE faculty_id = ?",
                                  [id],
                                  (err) => {
                                    if (err) response.status(500).send(err);
                                    mySqlConnection.query(
                                      "DELETE FROM f_time_table WHERE faculty_id = ?",
                                      [id],
                                      (err) => {
                                        if (err) response.status(500).send(err);
                                        mySqlConnection.query(
                                          "DELETE FROM research_proposers WHERE faculty_id = ?",
                                          [id],
                                          (err) => {
                                            if (err)
                                              response.status(500).send(err);
                                            response.redirect("/super/portal");
                                          }
                                        );
                                      }
                                    );
                                  }
                                );
                              }
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            }
            break;
        }
      }
      break;

    case "funds":
      {
        let task = request.body.task;
        switch (task) {
          case "view":
            {
              mySqlConnection.query("SELECT * FROM funds", (err, rows) => {
                if (err) response.status(500).send(err);
                if (rows) {
                  response.render("table", {
                    table: rows,
                  });
                } else {
                  response.status(400).send("Table is empty.");
                }
              });
            }
            break;
          case "add":
            {
              response.redirect("/super/funds_add");
            }
            break;
          case "update":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM funds WHERE s_no = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  edit = rows[0];
                  if (edit) {
                    request.session.edit = edit;
                    response.redirect("/super/funds");
                  } else {
                    response.status(400).send("Id does not exist.");
                  }
                }
              );
            }
            break;
          case "remove":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "DELETE FROM funds WHERE s_no = ?",
                [id],
                (err) => {
                  if (err) response.status(500).send(err);
                  response.redirect("/super/portal");
                }
              );
            }
            break;
        }
      }
      break;

    case "f_time_table":
      {
        let task = request.body.task;
        switch (task) {
          case "view":
            {
              mySqlConnection.query(
                "SELECT * FROM f_time_table",
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  if (rows) {
                    response.render("table", {
                      table: rows,
                    });
                  } else {
                    response.status(400).send("Table is empty.");
                  }
                }
              );
            }
            break;
          case "add":
            {
              response.redirect("/super/f_time_table_add");
            }
            break;
          case "update":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM f_time_table WHERE s_no = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  edit = rows[0];
                  if (edit) {
                    request.session.edit = edit;
                    response.redirect("/super/f_time_table");
                  } else {
                    response.status(400).send("Id does not exist.");
                  }
                }
              );
            }
            break;
          case "remove":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "DELETE FROM f_time_table WHERE s_no = ?",
                [id],
                (err) => {
                  if (err) response.status(500).send(err);
                  response.redirect("/super/portal");
                }
              );
            }
            break;
        }
      }
      break;

    case "hostel":
      {
        let task = request.body.task;
        switch (task) {
          case "view":
            {
              mySqlConnection.query("SELECT * FROM hostel", (err, rows) => {
                if (err) response.status(500).send(err);
                if (rows) {
                  response.render("table", {
                    table: rows,
                  });
                } else {
                  response.status(400).send("Table is empty.");
                }
              });
            }
            break;
          case "add":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM hostel WHERE hostel_number = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  if (rows.length) {
                    response.status(400).send("Id already exists.");
                  } else {
                    add_id = id;
                    response.redirect("/super/hostel_add");
                  }
                }
              );
            }
            break;
          case "update":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM hostel WHERE hostel_number = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  edit = rows[0];
                  if (edit) {
                    request.session.edit = edit;
                    response.redirect("/super/hostel");
                  } else {
                    response.status(400).send("Id does not exist.");
                  }
                }
              );
            }
            break;
          case "remove":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM student WHERE hostel_no = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  if (rows.length) {
                    response
                      .status(400)
                      .send(
                        "Can't delete. There are some students who live in this hostel."
                      );
                  } else {
                    mySqlConnection.query(
                      "DELETE FROM hostel WHERE hostel_number = ?",
                      [id],
                      (err) => {
                        if (err) response.status(500).send(err);
                        response.redirect("/super/portal");
                      }
                    );
                  }
                }
              );
            }
            break;
        }
      }
      break;

    case "l_grades":
      {
        let task = request.body.task;
        switch (task) {
          case "view":
            {
              mySqlConnection.query("SELECT * FROM l_grades", (err, rows) => {
                if (err) response.status(500).send(err);
                if (rows) {
                  response.render("table", {
                    table: rows,
                  });
                } else {
                  response.status(400).send("Table is empty.");
                }
              });
            }
            break;
          case "add":
            {
              response.redirect("/super/l_grades_add");
            }
            break;
          case "update":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM l_grades WHERE s_no = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  edit = rows[0];
                  if (edit) {
                    request.session.edit = edit;
                    response.redirect("/super/l_grades");
                  } else {
                    response.status(400).send("Id does not exist.");
                  }
                }
              );
            }
            break;
          case "remove":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "DELETE FROM l_grades WHERE s_no = ?",
                [id],
                (err) => {
                  if (err) response.status(500).send(err);
                  response.redirect("/super/portal");
                }
              );
            }
            break;
        }
      }
      break;

    case "max_l_grades":
      {
        let task = request.body.task;
        switch (task) {
          case "view":
            {
              mySqlConnection.query(
                "SELECT * FROM max_l_grades",
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  if (rows) {
                    response.render("table", {
                      table: rows,
                    });
                  } else {
                    response.status(400).send("Table is empty.");
                  }
                }
              );
            }
            break;
          case "add":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM max_l_grades WHERE subject_code = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  if (rows.length) {
                    response.status(400).send("Id already exists.");
                  } else {
                    add_id = id;
                    response.redirect("/super/max_l_grades_add");
                  }
                }
              );
            }
            break;
          case "update":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM max_l_grades WHERE subject_code = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  edit = rows[0];
                  if (edit) {
                    request.session.edit = edit;
                    response.redirect("/super/max_l_grades");
                  } else {
                    response.status(400).send("Id does not exist.");
                  }
                }
              );
            }
            break;
          case "remove":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "DELETE FROM max_l_grades WHERE subject_code = ?",
                [id],
                (err) => {
                  if (err) response.status(500).send(err);
                  response.redirect("/super/portal");
                }
              );
            }
            break;
        }
      }
      break;

    case "max_t_grades":
      {
        let task = request.body.task;
        switch (task) {
          case "view":
            {
              mySqlConnection.query(
                "SELECT * FROM max_t_grades",
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  if (rows) {
                    response.render("table", {
                      table: rows,
                    });
                  } else {
                    response.status(400).send("Table is empty.");
                  }
                }
              );
            }
            break;
          case "add":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM max_t_grades WHERE subject_code = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  if (rows.length) {
                    response.status(400).send("Id already exists.");
                  } else {
                    add_id = id;
                    response.redirect("/super/max_t_grades_add");
                  }
                }
              );
            }
            break;
          case "update":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM max_t_grades WHERE subject_code = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  edit = rows[0];
                  if (edit) {
                    request.session.edit = edit;
                    response.redirect("/super/max_t_grades");
                  } else {
                    response.status(400).send("Id does not exist.");
                  }
                }
              );
            }
            break;
          case "remove":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "DELETE FROM max_t_grades WHERE subject_code = ?",
                [id],
                (err) => {
                  if (err) response.status(500).send(err);
                  response.redirect("/super/portal");
                }
              );
            }
            break;
        }
      }
      break;

    case "research":
      {
        let task = request.body.task;
        switch (task) {
          case "view":
            {
              mySqlConnection.query("SELECT * FROM research", (err, rows) => {
                if (err) response.status(500).send(err);
                if (rows) {
                  response.render("table", {
                    table: rows,
                  });
                } else {
                  response.status(400).send("Table is empty.");
                }
              });
            }
            break;
          case "add":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM research WHERE research_id = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  if (rows.length) {
                    response.status(400).send("Id already exists.");
                  } else {
                    add_id = id;
                    response.redirect("/super/research_add");
                  }
                }
              );
            }
            break;
          case "update":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM research WHERE research_id = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  edit = rows[0];
                  if (edit) {
                    request.session.edit = edit;
                    response.redirect("/super/research");
                  } else {
                    response.status(400).send("Id does not exist.");
                  }
                }
              );
            }
            break;
          case "remove":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "DELETE FROM research WHERE research_id = ?",
                [id],
                (err) => {
                  if (err) response.status(500).send(err);
                  mySqlConnection.query(
                    "DELETE FROM funds WHERE research_id = ?",
                    [id],
                    (err) => {
                      if (err) response.status(500).send(err);
                      mySqlConnection.query(
                        "DELETE FROM research_assistants WHERE research_id = ?",
                        [id],
                        (err) => {
                          if (err) response.status(500).send(err);
                          mySqlConnection.query(
                            "DELETE FROM research_proposers WHERE research_id = ?",
                            [id],
                            (err) => {
                              if (err) response.status(500).send(err);
                              response.redirect("/super/portal");
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
            break;
        }
      }
      break;

    case "research_assistants":
      {
        let task = request.body.task;
        switch (task) {
          case "view":
            {
              mySqlConnection.query(
                "SELECT * FROM research_assistants",
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  if (rows) {
                    response.render("table", {
                      table: rows,
                    });
                  } else {
                    response.status(400).send("Table is empty.");
                  }
                }
              );
            }
            break;
          case "add":
            {
              response.redirect("/super/research_assistants_add");
            }
            break;
          case "update":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM research_assistants WHERE s_no = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  edit = rows[0];
                  if (edit) {
                    request.session.edit = edit;
                    response.redirect("/super/research_assistants");
                  } else {
                    response.status(400).send("Id does not exist.");
                  }
                }
              );
            }
            break;
          case "remove":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "DELETE FROM research_assistants WHERE s_no = ?",
                [id],
                (err) => {
                  if (err) response.status(500).send(err);
                  response.redirect("/super/portal");
                }
              );
            }
            break;
        }
      }
      break;

    case "research_proposers":
      {
        let task = request.body.task;
        switch (task) {
          case "view":
            {
              mySqlConnection.query(
                "SELECT * FROM research_proposers",
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  if (rows) {
                    response.render("table", {
                      table: rows,
                    });
                  } else {
                    response.status(400).send("Table is empty.");
                  }
                }
              );
            }
            break;
          case "add":
            {
              response.redirect("/super/research_proposers_add");
            }
            break;
          case "update":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM research_proposers WHERE s_no = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  edit = rows[0];
                  if (edit) {
                    request.session.edit = edit;
                    response.redirect("/super/research_proposers");
                  } else {
                    response.status(400).send("Id does not exist.");
                  }
                }
              );
            }
            break;
          case "remove":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "DELETE FROM research_proposers WHERE s_no = ?",
                [id],
                (err) => {
                  if (err) response.status(500).send(err);
                  response.redirect("/super/portal");
                }
              );
            }
            break;
        }
      }
      break;

    case "student":
      {
        let task = request.body.task;
        switch (task) {
          case "view":
            {
              mySqlConnection.query("SELECT * FROM student", (err, rows) => {
                if (err) response.status(500).send(err);
                if (rows) {
                  response.render("table", {
                    table: rows,
                  });
                } else {
                  response.status(400).send("Table is empty.");
                }
              });
            }
            break;
          case "add":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM student WHERE roll_no = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  if (rows.length) {
                    response.status(400).send("Id already exists.");
                  } else {
                    add_id = id;
                    response.redirect("/super/student_add");
                  }
                }
              );
            }
            break;
          case "update":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM student WHERE roll_no = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  edit = rows[0];
                  if (edit) {
                    request.session.edit = edit;
                    response.redirect("/super/student");
                  } else {
                    response.status(400).send("Id does not exist.");
                  }
                }
              );
            }
            break;
          case "remove":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "DELETE FROM student WHERE roll_no = ?",
                [id],
                (err) => {
                  if (err) response.status(500).send(err);
                  mySqlConnection.query(
                    "DELETE FROM student_club WHERE roll_no = ?",
                    [id],
                    (err) => {
                      if (err) response.status(500).send(err);
                      mySqlConnection.query(
                        "DELETE FROM l_grades WHERE roll_no = ?",
                        [id],
                        (err) => {
                          if (err) response.status(500).send(err);
                          mySqlConnection.query(
                            "DELETE FROM t_grades WHERE roll_no = ?",
                            [id],
                            (err) => {
                              if (err) response.status(500).send(err);
                              mySqlConnection.query(
                                "DELETE FROM attendance WHERE roll_no = ?",
                                [id],
                                (err) => {
                                  if (err) response.status(500).send(err);
                                  mySqlConnection.query(
                                    "DELETE FROM backlogs WHERE roll_no = ?",
                                    [id],
                                    (err) => {
                                      if (err) response.status(500).send(err);
                                      mySqlConnection.query(
                                        "DELETE FROM research_assistants WHERE roll_no = ?",
                                        [id],
                                        (err) => {
                                          if (err)
                                            response.status(500).send(err);
                                          else
                                            response.redirect("/super/portal");
                                        }
                                      );
                                    }
                                  );
                                }
                              );
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
            break;
        }
      }
      break;

    case "student_club":
      {
        let task = request.body.task;
        switch (task) {
          case "view":
            {
              mySqlConnection.query(
                "SELECT * FROM student_club",
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  if (rows) {
                    response.render("table", {
                      table: rows,
                    });
                  } else {
                    response.status(400).send("Table is empty.");
                  }
                }
              );
            }
            break;
          case "add":
            {
              response.redirect("/super/student_club_add");
            }
            break;
          case "update":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM student_club WHERE s_no = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  edit = rows[0];
                  if (edit) {
                    request.session.edit = edit;
                    response.redirect("/super/student_club");
                  } else {
                    response.status(400).send("Id does not exist.");
                  }
                }
              );
            }
            break;
          case "remove":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "DELETE FROM student_club WHERE s_no = ?",
                [id],
                (err) => {
                  if (err) response.status(500).send(err);
                  response.redirect("/super/portal");
                }
              );
            }
            break;
        }
      }
      break;

    case "subject":
      {
        let task = request.body.task;
        switch (task) {
          case "view":
            {
              mySqlConnection.query("SELECT * FROM subject", (err, rows) => {
                if (err) response.status(500).send(err);
                if (rows) {
                  response.render("table", {
                    table: rows,
                  });
                } else {
                  response.status(400).send("Table is empty.");
                }
              });
            }
            break;
          case "add":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM subject WHERE subject_code = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  if (rows.length) {
                    response.status(400).send("Id already exists.");
                  } else {
                    add_id = id;
                    response.redirect("/super/subject_add");
                  }
                }
              );
            }
            break;
          case "update":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM subject WHERE subject_code = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  edit = rows[0];
                  if (edit) {
                    request.session.edit = edit;
                    response.redirect("/super/subject");
                  } else {
                    response.status(400).send("Id does not exist.");
                  }
                }
              );
            }
            break;
          case "remove":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM batch_subjects WHERE subject_code = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  if (rows.length) {
                    response
                      .status(400)
                      .send(
                        "Can't delete. There are some batches which study this subject."
                      );
                  } else {
                    mySqlConnection.query(
                      "SELECT * FROM batch_subjects WHERE subject_code = ?",
                      [id],
                      (err, rows) => {
                        if (err) response.status(500).send(err);
                        if (rows.length) {
                          response
                            .status(400)
                            .send(
                              "Can't delete. There are some batches which study this subject."
                            );
                        } else {
                          mySqlConnection.query(
                            "DELETE FROM subject WHERE subject_code = ?",
                            [id],
                            (err) => {
                              if (err) response.status(500).send(err);
                              mySqlConnection.query(
                                "DELETE FROM assignment WHERE subject_code = ?",
                                [id],
                                (err) => {
                                  if (err) response.status(500).send(err);
                                  mySqlConnection.query(
                                    "DELETE FROM attendance WHERE subject_code = ?",
                                    [id],
                                    (err) => {
                                      if (err) response.status(500).send(err);
                                      mySqlConnection.query(
                                        "DELETE FROM backlogs WHERE subject_code = ?",
                                        [id],
                                        (err) => {
                                          if (err)
                                            response.status(500).send(err);
                                          mySqlConnection.query(
                                            "DELETE FROM l_grades WHERE subject_code = ?",
                                            [id],
                                            (err) => {
                                              if (err)
                                                response.status(500).send(err);
                                              mySqlConnection.query(
                                                "DELETE FROM t_grades WHERE subject_code = ?",
                                                [id],
                                                (err) => {
                                                  if (err)
                                                    response
                                                      .status(500)
                                                      .send(err);
                                                  mySqlConnection.query(
                                                    "DELETE FROM max_l_grades WHERE subject_code = ?",
                                                    [id],
                                                    (err) => {
                                                      if (err)
                                                        response
                                                          .status(500)
                                                          .send(err);
                                                      mySqlConnection.query(
                                                        "DELETE FROM max_t_grades WHERE subject_code = ?",
                                                        [id],
                                                        (err) => {
                                                          if (err)
                                                            response
                                                              .status(500)
                                                              .send(err);
                                                          else
                                                            response.redirect(
                                                              "/super/portal"
                                                            );
                                                        }
                                                      );
                                                    }
                                                  );
                                                }
                                              );
                                            }
                                          );
                                        }
                                      );
                                    }
                                  );
                                }
                              );
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            }
            break;
        }
      }
      break;

    case "s_time_table":
      {
        let task = request.body.task;
        switch (task) {
          case "view":
            {
              mySqlConnection.query(
                "SELECT * FROM s_time_table",
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  if (rows) {
                    response.render("table", {
                      table: rows,
                    });
                  } else {
                    response.status(400).send("Table is empty.");
                  }
                }
              );
            }
            break;
          case "add":
            {
              response.redirect("/super/s_time_table_add");
            }
            break;
          case "update":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM s_time_table WHERE s_no = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  edit = rows[0];
                  if (edit) {
                    request.session.edit = edit;
                    response.redirect("/super/s_time_table");
                  } else {
                    response.status(400).send("Id does not exist.");
                  }
                }
              );
            }
            break;
          case "remove":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "DELETE FROM s_time_table WHERE s_no = ?",
                [id],
                (err) => {
                  if (err) response.status(500).send(err);
                  response.redirect("/super/portal");
                }
              );
            }
            break;
        }
      }
      break;

    case "t_grades":
      {
        let task = request.body.task;
        switch (task) {
          case "view":
            {
              mySqlConnection.query("SELECT * FROM t_grades", (err, rows) => {
                if (err) response.status(500).send(err);
                if (rows) {
                  response.render("table", {
                    table: rows,
                  });
                } else {
                  response.status(400).send("Table is empty.");
                }
              });
            }
            break;
          case "add":
            {
              response.redirect("/super/t_grades_add");
            }
            break;
          case "update":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "SELECT * FROM t_grades WHERE s_no = ?",
                [id],
                (err, rows) => {
                  if (err) response.status(500).send(err);
                  edit = rows[0];
                  if (edit) {
                    request.session.edit = edit;
                    response.redirect("/super/t_grades");
                  } else {
                    response.status(400).send("Id does not exist.");
                  }
                }
              );
            }
            break;
          case "remove":
            {
              let id = request.body.id;
              mySqlConnection.query(
                "DELETE FROM t_grades WHERE s_no = ?",
                [id],
                (err) => {
                  if (err) response.status(500).send(err);
                  response.redirect("/super/portal");
                }
              );
            }
            break;
        }
      }
      break;

    default:
      response.render("/super/portal");
  }
});

// Get request for adding admin data
router.get("/admin_add", (request, response) => {
  // Rendering Page
  response.render("admin_add", {
    admin_id: add_id,
  });
});

// Post request for adding admin data
router.post("/admin_add", (request, response) => {
  let { f_name, m_name, l_name, post, phone, Email } = request.body;
  let password = bcrypt.hashSync("1234", 10),
    photo = "https://i.ibb.co/RStWntb/pic.jpg";
  mySqlConnection.query(
    "INSERT INTO admin VALUES (?)",
    [[add_id, f_name, m_name, l_name, password, post, phone, Email, photo]],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for updating admin data
router.get("/admin", (request, response) => {
  // Middle Name
  let m_name = "";
  if (edit.m_name) m_name = edit.m_name;

  // Rendering Page
  response.render("admin", {
    admin_id: edit.admin_id,
    f_name: edit.f_name,
    m_name: m_name,
    l_name: edit.l_name,
    post: edit.post,
    Email: edit.Email,
    phone: edit.phone,
    photo: edit.photo,
  });
});

// Post request for updating admin data
router.post("/admin", (request, response) => {
  let { f_name, m_name, l_name, post, phone, Email } = request.body;
  if (m_name == "") {
    mySqlConnection.query(
      "UPDATE admin SET f_name = ?, l_name = ?, post = ?, phone = ?, Email = ? WHERE admin_id = ?",
      [f_name, l_name, post, phone, Email, edit.admin_id],
      (err) => {
        if (err) response.status(500).send(err);
        else response.redirect("/super/portal");
      }
    );
  } else {
    mySqlConnection.query(
      "UPDATE admin SET f_name = ?, m_name = ?, l_name = ?, post = ?, phone = ?, Email = ? WHERE admin_id = ?",
      [f_name, m_name, l_name, post, phone, Email, edit.admin_id],
      (err) => {
        if (err) response.status(500).send(err);
        else response.redirect("/super/portal");
      }
    );
  }
});

// Get request for adding assignment data
router.get("/assignment_add", (request, response) => {
  // Rendering Page
  response.render("assignment_add", {});
});

// Post request for adding assignment data
router.post("/assignment_add", (request, response) => {
  let { subject_code, assignment_name, due_date } = request.body;
  mySqlConnection.query(
    "INSERT INTO assignment (subject_code, assignment_name, due_date) VALUES (?)",
    [[subject_code, assignment_name, due_date]],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for updating assignment data
router.get("/assignment", (request, response) => {
  // Rendering Page
  response.render("assignment", {
    s_no: edit.s_no,
    subject_code: edit.subject_code,
    assignment_name: edit.assignment_name,
    due_date: edit.due_date,
  });
});

// Post request for updating assignment data
router.post("/assignment", (request, response) => {
  let { subject_code, assignment_name, due_date } = request.body;
  mySqlConnection.query(
    "UPDATE assignment SET subject_code = ?, assignment_name = ?, due_date = ? WHERE s_no = ?",
    [subject_code, assignment_name, due_date, edit.s_no],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for adding attendance data
router.get("/attendance_add", (request, response) => {
  // Rendering Page
  response.render("attendance_add", {});
});

// Post request for adding attendance data
router.post("/attendance_add", (request, response) => {
  let { roll_no, subject_code, attendance } = request.body;
  mySqlConnection.query(
    "INSERT INTO attendance (roll_no, subject_code, attendance) VALUES (?)",
    [[roll_no, subject_code, attendance]],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for updating attendance data
router.get("/attendance", (request, response) => {
  // Rendering Page
  response.render("attendance", {
    s_no: edit.s_no,
    roll_no: edit.roll_no,
    subject_code: edit.subject_code,
    attendance: edit.attendance,
  });
});

// Post request for updating attendance data
router.post("/attendance", (request, response) => {
  let { roll_no, subject_code, attendance } = request.body;
  mySqlConnection.query(
    "UPDATE attendance SET roll_no = ?, subject_code = ?, attendance = ? WHERE s_no = ?",
    [roll_no, subject_code, attendance, edit.s_no],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for adding backlogs data
router.get("/backlogs_add", (request, response) => {
  // Rendering Page
  response.render("backlogs_add", {});
});

// Post request for adding backlogs data
router.post("/backlogs_add", (request, response) => {
  let { roll_no, subject_code } = request.body;
  mySqlConnection.query(
    "INSERT INTO backlogs (roll_no, subject_code) VALUES (?)",
    [[roll_no, subject_code]],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for updating backlogs data
router.get("/backlogs", (request, response) => {
  // Rendering Page
  response.render("backlogs", {
    s_no: edit.s_no,
    roll_no: edit.roll_no,
    subject_code: edit.subject_code,
  });
});

// Post request for updating backlogs data
router.post("/backlogs", (request, response) => {
  let { roll_no, subject_code } = request.body;
  mySqlConnection.query(
    "UPDATE backlogs SET roll_no = ?, subject_code = ? WHERE s_no = ?",
    [roll_no, subject_code, edit.s_no],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for adding batch data
router.get("/batch_add", (request, response) => {
  // Rendering Page
  response.render("batch_add", {
    batch_code: add_id,
  });
});

// Post request for adding batch data
router.post("/batch_add", (request, response) => {
  let { branch_id } = request.body;
  mySqlConnection.query(
    "INSERT INTO batch VALUES (?)",
    [[add_id, branch_id]],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for updating batch data
router.get("/batch", (request, response) => {
  // Rendering Page
  response.render("batch", {
    batch_code: edit.batch_code,
    branch_id: edit.branch_id,
  });
});

// Post request for updating batch data
router.post("/batch", (request, response) => {
  let { branch_id } = request.body;

  mySqlConnection.query(
    "UPDATE batch SET branch_id = ? WHERE batch_code = ?",
    [branch_id, edit.batch_code],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for adding batch_subjects data
router.get("/batch_subjects_add", (request, response) => {
  // Rendering Page
  response.render("batch_subjects_add", {});
});

// Post request for adding batch_subjects data
router.post("/batch_subjects_add", (request, response) => {
  let { batch_code, subject_code } = request.body;
  mySqlConnection.query(
    "INSERT INTO batch_subjects VALUES (?)",
    [[batch_code, subject_code]],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for updating batch_subjects data
router.get("/batch_subjects", (request, response) => {
  // Rendering Page
  response.render("batch_subjects", {
    s_no: edit.s_no,
    batch_code: edit.batch_code,
    subject_code: edit.subject_code,
  });
});

// Post request for updating batch_subjects data
router.post("/batch_subjects", (request, response) => {
  let { batch_code, subject_code } = request.body;
  mySqlConnection.query(
    "UPDATE batch_subjects SET batch_code = ?, subject_code = ? WHERE s_no = ?",
    [batch_code, subject_code, edit.s_no],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for adding branch data
router.get("/branch_add", (request, response) => {
  // Rendering Page
  response.render("branch_add", {
    branch_id: add_id,
  });
});

// Post request for adding branch data
router.post("/branch_add", (request, response) => {
  let { branch_name } = request.body;
  mySqlConnection.query(
    "INSERT INTO branch VALUES (?)",
    [[add_id, branch_name]],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for updating branch data
router.get("/branch", (request, response) => {
  // Rendering Page
  response.render("branch", {
    branch_id: edit.branch_id,
    branch_name: edit.branch_name,
  });
});

// Post request for updating branch data
router.post("/branch", (request, response) => {
  let { branch_name } = request.body;

  mySqlConnection.query(
    "UPDATE branch SET branch_name = ? WHERE branch_id = ?",
    [branch_name, edit.branch_id],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for adding club data
router.get("/club_add", (request, response) => {
  // Rendering Page
  response.render("club_add", {
    club_id: add_id,
  });
});

// Post request for adding club data
router.post("/club_add", (request, response) => {
  let { club_name, club_room_no, faculty_coordinator } = request.body;
  mySqlConnection.query(
    "INSERT INTO club VALUES (?)",
    [[add_id, club_name, club_room_no, faculty_coordinator]],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for updating club data
router.get("/club", (request, response) => {
  // Rendering Page
  response.render("club", {
    club_id: edit.club_id,
    club_name: edit.club_name,
    club_room_no: edit.club_room_no,
    faculty_coordinator: edit.faculty_coordinator,
  });
});

// Post request for updating club data
router.post("/club", (request, response) => {
  let { club_name, club_room_no, faculty_coordinator } = request.body;

  mySqlConnection.query(
    "UPDATE club SET club_name = ?, club_room_no = ?, faculty_coordinator = ? WHERE club_id = ?",
    [club_name, club_room_no, faculty_coordinator, edit.club_id],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for adding faculty data
router.get("/faculty_add", (request, response) => {
  // Rendering Page
  response.render("faculty_add", {
    faculty_id: add_id,
  });
});

// Post request for adding faculty data
router.post("/faculty_add", (request, response) => {
  let {
    f_name,
    m_name,
    l_name,
    gender,
    dob,
    room,
    phone,
    email,
    post,
    branch_id,
  } = request.body;
  let password = bcrypt.hashSync("1234", 10),
    photo = "https://i.ibb.co/RStWntb/pic.jpg";
  mySqlConnection.query(
    "INSERT INTO faculty VALUES (?)",
    [
      [
        add_id,
        f_name,
        m_name,
        l_name,
        password,
        gender,
        dob,
        room,
        phone,
        email,
        post,
        branch_id,
        photo,
      ],
    ],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for updating faculty data
router.get("/faculty", (request, response) => {
  // Middle Name
  let m_name = "";
  if (edit.m_name) m_name = edit.m_name;

  // Rendering Page
  response.render("faculty", {
    faculty_id: edit.faculty_id,
    f_name: edit.f_name,
    m_name: m_name,
    l_name: edit.l_name,
    gender: edit.gender,
    dob: edit.dob,
    room: edit.room,
    phone: edit.phone,
    email: edit.email,
    post: edit.post,
    branch_id: edit.branch_id,
    photo: edit.photo,
  });
});

// Post request for updating faculty data
router.post("/faculty", (request, response) => {
  let {
    f_name,
    m_name,
    l_name,
    gender,
    dob,
    room,
    phone,
    email,
    post,
    branch_id,
  } = request.body;
  if (m_name == "") {
    mySqlConnection.query(
      "UPDATE faculty SET f_name = ?, l_name = ?, gender = ?, dob = ?, room = ?, phone = ?, email = ?, post = ?, branch_id = ? WHERE faculty_id = ?",
      [
        f_name,
        l_name,
        gender,
        dob,
        room,
        phone,
        email,
        post,
        branch_id,
        edit.faculty_id,
      ],
      (err) => {
        if (err) response.status(500).send(err);
        else response.redirect("/super/portal");
      }
    );
  } else {
    mySqlConnection.query(
      "UPDATE faculty SET f_name = ?, m_name = ?, l_name = ?, gender = ?, dob = ?, room = ?, phone = ?, email = ?, post = ?, branch_id = ? WHERE faculty_id = ?",
      [
        f_name,
        m_name,
        l_name,
        gender,
        dob,
        room,
        phone,
        email,
        post,
        branch_id,
        edit.faculty_id,
      ],
      (err) => {
        if (err) response.status(500).send(err);
        else response.redirect("/super/portal");
      }
    );
  }
});

// Get request for adding funds data
router.get("/funds_add", (request, response) => {
  // Rendering Page
  response.render("funds_add", {});
});

// Post request for adding funds data
router.post("/funds_add", (request, response) => {
  let { organization, research_id } = request.body;
  mySqlConnection.query(
    "INSERT INTO funds VALUES (?)",
    [[organization, research_id]],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for updating funds data
router.get("/funds", (request, response) => {
  // Rendering Page
  response.render("funds", {
    s_no: edit.s_no,
    organization: edit.organization,
    research_id: edit.research_id,
  });
});

// Post request for updating funds data
router.post("/funds", (request, response) => {
  let { organization, research_id } = request.body;
  mySqlConnection.query(
    "UPDATE funds SET organization = ?, research_id = ? WHERE s_no = ?",
    [organization, research_id, edit.s_no],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for adding f_time_table data
router.get("/f_time_table_add", (request, response) => {
  // Rendering Page
  response.render("f_time_table_add", {});
});

// Post request for adding f_time_table data
router.post("/f_time_table_add", (request, response) => {
  let {
    faculty_id,
    day,
    t_9,
    t_10,
    t_11,
    t_12,
    t_2,
    t_3,
    t_4,
    t_5,
  } = request.body;
  mySqlConnection.query(
    "INSERT INTO f_time_table VALUES (?)",
    [[faculty_id, day, t_9, t_10, t_11, t_12, t_2, t_3, t_4, t_5]],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for updating f_time_table data
router.get("/f_time_table", (request, response) => {
  // Rendering Page
  response.render("f_time_table", {
    s_no: edit.s_no,
    faculty_id: edit.faculty_id,
    day: edit.day,
    t_9: edit.t_9,
    t_10: edit.t_10,
    t_11: edit.t_11,
    t_12: edit.t_12,
    t_2: edit.t_2,
    t_3: edit.t_3,
    t_4: edit.t_4,
    t_5: edit.t_5,
  });
});

// Post request for updating f_time_table data
router.post("/f_time_table", (request, response) => {
  let {
    faculty_id,
    day,
    t_9,
    t_10,
    t_11,
    t_12,
    t_2,
    t_3,
    t_4,
    t_5,
  } = request.body;
  mySqlConnection.query(
    "UPDATE f_time_table SET faculty_id = ?, day = ?, t_9 = ?, t_10 = ?, t_11 = ?, t_12 = ?, t_2 = ?, t_3 = ?, t_4 = ?, t_5 = ? WHERE s_no = ?",
    [faculty_id, day, t_9, t_10, t_11, t_12, t_2, t_3, t_4, t_5, edit.s_no],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for adding hostel data
router.get("/hostel_add", (request, response) => {
  // Rendering Page
  response.render("hostel_add", {
    hostel_number_id: add_id,
  });
});

// Post request for adding hostel data
router.post("/hostel_add", (request, response) => {
  let {
    hostel_name,
    boys_girls,
    rooms,
    day_supervisor,
    night_supervisor,
    evening_supervisor,
    mess_head,
  } = request.body;
  mySqlConnection.query(
    "INSERT INTO hostel VALUES (?)",
    [
      [
        add_id,
        hostel_name,
        boys_girls,
        rooms,
        day_supervisor,
        night_supervisor,
        evening_supervisor,
        mess_head,
      ],
    ],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for updating hostel data
router.get("/hostel", (request, response) => {
  // Rendering Page
  response.render("hostel", {
    hostel_number: edit.hostel_number,
    hostel_name: edit.hostel_name,
    boys_girls: edit.boys_girls,
    rooms: edit.rooms,
    day_supervisor: edit.day_supervisor,
    night_supervisor: edit.night_supervisor,
    evening_supervisor: edit.evening_supervisor,
    mess_head: edit.mess_head,
  });
});

// Post request for updating hostel data
router.post("/hostel", (request, response) => {
  let {
    hostel_name,
    boys_girls,
    rooms,
    day_supervisor,
    night_supervisor,
    evening_supervisor,
    mess_head,
  } = request.body;

  mySqlConnection.query(
    "UPDATE hostel SET hostel_name = ?, boys_girls = ?, rooms, day_supervisor = ?, night_supervisor = ?, evening_supervisor = ?, mess_head = ? WHERE hostel_number = ?",
    [
      hostel_name,
      boys_girls,
      rooms,
      day_supervisor,
      night_supervisor,
      evening_supervisor,
      mess_head,
      edit.hostel_number,
    ],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for adding l_grades data
router.get("/l_grades_add", (request, response) => {
  // Rendering Page
  response.render("l_grades_add", {});
});

// Post request for adding l_grades data
router.post("/l_grades_add", (request, response) => {
  let {
    roll_no,
    subject_code,
    assignment_marks,
    attendance_marks,
    mid_sem,
    major,
  } = request.body;
  mySqlConnection.query(
    "INSERT INTO l_grades VALUES (?)",
    [
      [
        roll_no,
        subject_code,
        assignment_marks,
        attendance_marks,
        mid_sem,
        major,
      ],
    ],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for updating l_grades data
router.get("/l_grades", (request, response) => {
  // Rendering Page
  response.render("l_grades", {
    s_no: edit.s_no,
    roll_no: edit.roll_no,
    subject_code: edit.subject_code,
    assignment_marks: edit.assignment_marks,
    attendance_marks: edit.attendance_marks,
    mid_sem: edit.mid_sem,
    major: edit.major,
  });
});

// Post request for updating l_grades data
router.post("/l_grades", (request, response) => {
  let {
    roll_no,
    subject_code,
    assignment_marks,
    attendance_marks,
    mid_sem,
    major,
  } = request.body;
  mySqlConnection.query(
    "UPDATE l_grades SET roll_no = ?, subject_code = ?, assignment_marks = ?, attendance_marks = ?, mid_sem = ?, major = ? WHERE s_no = ?",
    [
      roll_no,
      subject_code,
      assignment_marks,
      attendance_marks,
      mid_sem,
      major,
      edit.s_no,
    ],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for adding max_l_grades data
router.get("/max_l_grades_add", (request, response) => {
  // Rendering Page
  response.render("max_l_grades_add", {
    subject_code: add_id,
  });
});

// Post request for adding max_l_grades data
router.post("/max_l_grades_add", (request, response) => {
  let { assignment_marks, attendance_marks, mid_sem, major } = request.body;
  mySqlConnection.query(
    "INSERT INTO max_l_grades VALUES (?)",
    [[add_id, assignment_marks, attendance_marks, mid_sem, major]],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for updating max_l_grades data
router.get("/max_l_grades", (request, response) => {
  // Rendering Page
  response.render("max_l_grades", {
    subject_code: edit.subject_code,
    assignment_marks: edit.assignment_marks,
    attendance_marks: edit.attendance_marks,
    mid_sem: edit.mid_sem,
    major: edit.major,
  });
});

// Post request for updating max_l_grades data
router.post("/max_l_grades", (request, response) => {
  let { assignment_marks, attendance_marks, mid_sem, major } = request.body;

  mySqlConnection.query(
    "UPDATE max_l_grades SET assignment_marks = ?, attendance_marks = ?, mid_sem = ?, major = ? WHERE subject_code = ?",
    [assignment_marks, attendance_marks, mid_sem, major, edit.subject_code],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for adding max_t_grades data
router.get("/max_t_grades_add", (request, response) => {
  // Rendering Page
  response.render("max_t_grades_add", {
    subject_code: add_id,
  });
});

// Post request for adding max_t_grades data
router.post("/max_t_grades_add", (request, response) => {
  let {
    assignment_marks,
    attendance_marks,
    minor1,
    minor2,
    major,
  } = request.body;
  mySqlConnection.query(
    "INSERT INTO max_t_grades VALUES (?)",
    [[add_id, assignment_marks, attendance_marks, minor1, minor2, major]],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for updating max_t_grades data
router.get("/max_t_grades", (request, response) => {
  // Rendering Page
  response.render("max_t_grades", {
    subject_code: edit.subject_code,
    assignment_marks: edit.assignment_marks,
    attendance_marks: edit.attendance_marks,
    minor1: edit.minor1,
    minor2: edit.minor2,
    major: edit.major,
  });
});

// Post request for updating max_t_grades data
router.post("/max_t_grades", (request, response) => {
  let {
    assignment_marks,
    attendance_marks,
    minor1,
    minor2,
    major,
  } = request.body;

  mySqlConnection.query(
    "UPDATE max_t_grades SET assignment_marks = ?, attendance_marks = ?, minor1 = ?, minor2 = ?, major = ? WHERE subject_code = ?",
    [
      assignment_marks,
      attendance_marks,
      minor1,
      minor2,
      major,
      edit.subject_code,
    ],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for adding research data
router.get("/research_add", (request, response) => {
  // Rendering Page
  response.render("research_add", {
    research_id: add_id,
  });
});

// Post request for adding research data
router.post("/research_add", (request, response) => {
  let { research_name, expected_completion_date, room } = request.body;
  mySqlConnection.query(
    "INSERT INTO research VALUES (?)",
    [[add_id, research_name, expected_completion_date, room]],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for updating research data
router.get("/research", (request, response) => {
  // Rendering Page
  response.render("research", {
    research_id: edit.research_id,
    research_name: edit.research_name,
    expected_completion_date: edit.expected_completion_date,
    room: edit.room,
  });
});

// Post request for updating research data
router.post("/research", (request, response) => {
  let { research_name, expected_completion_date, room } = request.body;

  mySqlConnection.query(
    "UPDATE research SET research_name = ?, expected_completion_date = ?, room = ? WHERE research_id = ?",
    [research_name, expected_completion_date, room, edit.research_id],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for adding research_assistants data
router.get("/research_assistants_add", (request, response) => {
  // Rendering Page
  response.render("research_assistants_add", {});
});

// Post request for adding research_assistants data
router.post("/research_assistants_add", (request, response) => {
  let { roll_no, research_id } = request.body;
  mySqlConnection.query(
    "INSERT INTO research_assistants VALUES (?)",
    [[roll_no, research_id]],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for updating research_assistants data
router.get("/research_assistants", (request, response) => {
  // Rendering Page
  response.render("research_assistants", {
    s_no: edit.s_no,
    roll_no: edit.roll_no,
    research_id: edit.research_id,
  });
});

// Post request for updating research_assistants data
router.post("/research_assistants", (request, response) => {
  let { roll_no, research_id } = request.body;
  mySqlConnection.query(
    "UPDATE research_assistants SET roll_no = ?, research_id = ? WHERE s_no = ?",
    [roll_no, research_id, edit.s_no],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for adding research_proposers data
router.get("/research_proposers_add", (request, response) => {
  // Rendering Page
  response.render("research_proposers_add", {});
});

// Post request for adding research_proposers data
router.post("/research_proposers_add", (request, response) => {
  let { research_id, faculty_id } = request.body;
  mySqlConnection.query(
    "INSERT INTO research_proposers VALUES (?)",
    [[research_id, faculty_id]],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for updating research_proposers data
router.get("/research_proposers", (request, response) => {
  // Rendering Page
  response.render("research_proposers", {
    s_no: edit.s_no,
    research_id: edit.research_id,
    faculty_id: edit.faculty_id,
  });
});

// Post request for updating research_proposers data
router.post("/research_proposers", (request, response) => {
  let { research_id, faculty_id } = request.body;
  mySqlConnection.query(
    "UPDATE research_proposers SET research_id = ?, faculty_id = ? WHERE s_no = ?",
    [research_id, faculty_id, edit.s_no],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for adding student data
router.get("/student_add", (request, response) => {
  // Rendering Page
  response.render("student_add", {
    roll_no: add_id,
  });
});

// Post request for adding student data
router.post("/student_add", (request, response) => {
  let {
    f_name,
    m_name,
    l_name,
    gender,
    dob,
    cgpa,
    semester,
    hostel_no,
    room,
    phone,
    email,
    batch_code,
  } = request.body;
  let password = bcrypt.hashSync("1234", 10),
    photo = "https://i.ibb.co/RStWntb/pic.jpg";
  mySqlConnection.query(
    "INSERT INTO student VALUES (?)",
    [
      [
        add_id,
        f_name,
        m_name,
        l_name,
        password,
        gender,
        dob,
        cgpa,
        semester,
        hostel_no,
        room,
        phone,
        email,
        batch_code,
        photo,
      ],
    ],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for updating student data
router.get("/student", (request, response) => {
  // Middle Name
  let m_name = "";
  if (edit.m_name) m_name = edit.m_name;

  // Rendering Page
  response.render("student", {
    roll_no: edit.roll_no,
    f_name: edit.f_name,
    m_name: m_name,
    l_name: edit.l_name,
    gender: edit.gender,
    dob: edit.dob,
    cgpa: edit.cgpa,
    semester: edit.semester,
    hostel_no: edit.hostel_no,
    room: edit.room,
    phone: edit.phone,
    email: edit.email,
    batch_code: edit.batch_code,
    photo: edit.photo,
  });
});

// Post request for updating student data
router.post("/student", (request, response) => {
  let {
    f_name,
    m_name,
    l_name,
    gender,
    dob,
    cgpa,
    semester,
    hostel_no,
    room,
    phone,
    email,
    batch_code,
  } = request.body;
  if (m_name == "") {
    mySqlConnection.query(
      "UPDATE student SET f_name = ?, l_name = ?, gender = ?, dob = ?, cgpa = ?, semester = ?, hostel_no = ?, room = ?, phone = ?, email = ?, batch_code = ? WHERE roll_no = ?",
      [
        f_name,
        l_name,
        gender,
        dob,
        cgpa,
        semester,
        hostel_no,
        room,
        phone,
        email,
        batch_code,
        edit.roll_no,
      ],
      (err) => {
        if (err) response.status(500).send(err);
        else response.redirect("/super/portal");
      }
    );
  } else {
    mySqlConnection.query(
      "UPDATE faculty SET f_name = ?, m_name = ?, l_name = ?, gender = ?, dob = ?, cgpa = ?, semester = ?, hostel_no = ?, room = ?, phone = ?, email = ?, batch_code = ? WHERE roll_no = ?",
      [
        f_name,
        m_name,
        l_name,
        gender,
        dob,
        cgpa,
        semester,
        hostel_no,
        room,
        phone,
        email,
        batch_code,
        edit.roll_no,
      ],
      (err) => {
        if (err) response.status(500).send(err);
        else response.redirect("/super/portal");
      }
    );
  }
});

// Get request for adding student_club data
router.get("/student_club_add", (request, response) => {
  // Rendering Page
  response.render("student_club_add", {});
});

// Post request for adding student_club data
router.post("/student_club_add", (request, response) => {
  let { roll_no, club_id } = request.body;
  mySqlConnection.query(
    "INSERT INTO student_club VALUES (?)",
    [[roll_no, club_id]],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for updating student_club data
router.get("/student_club", (request, response) => {
  // Rendering Page
  response.render("student_club", {
    s_no: edit.s_no,
    roll_no: edit.roll_no,
    club_id: edit.club_id,
  });
});

// Post request for updating student_club data
router.post("/student_club", (request, response) => {
  let { roll_no, club_id } = request.body;
  mySqlConnection.query(
    "UPDATE student_club SET roll_no = ?, club_id = ? WHERE s_no = ?",
    [roll_no, club_id, edit.s_no],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for adding subject data
router.get("/subject_add", (request, response) => {
  // Rendering Page
  response.render("subject_add", {
    subject_code: add_id,
  });
});

// Post request for adding subject data
router.post("/subject_add", (request, response) => {
  let {
    subject_name,
    proposer,
    taught_by,
    credits,
    l,
    p,
    t,
    room_no,
    faculty_attendance,
  } = request.body;
  mySqlConnection.query(
    "INSERT INTO subject VALUES (?)",
    [
      [
        add_id,
        subject_name,
        proposer,
        taught_by,
        credits,
        l,
        p,
        t,
        room_no,
        faculty_attendance,
      ],
    ],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for updating subject data
router.get("/subject", (request, response) => {
  // Rendering Page
  response.render("subject", {
    subject_code: edit.subject_code,
    subject_name: edit.subject_name,
    proposer: edit.proposer,
    taught_by: edit.taught_by,
    credits: edit.credits,
    l: edit.l,
    t: edit.t,
    p: edit.p,
    room_no: edit.room_no,
    faculty_attendance: edit.faculty_attendance,
  });
});

// Post request for updating subject data
router.post("/subject", (request, response) => {
  let {
    subject_name,
    proposer,
    taught_by,
    credits,
    l,
    t,
    p,
    room_no,
    faculty_attendance,
  } = request.body;
  mySqlConnection.query(
    "UPDATE subject SET subject_name = ?, proposer = ?, taught_by = ?, credits = ?, l = ?, t = ?, p = ?, room_no = ?, faculty_attendance = ? WHERE subject_code = ?",
    [
      subject_name,
      proposer,
      taught_by,
      credits,
      l,
      t,
      p,
      room_no,
      faculty_attendance,
      edit.subject_code,
    ],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for adding s_time_table data
router.get("/s_time_table_add", (request, response) => {
  // Rendering Page
  response.render("s_time_table_add", {});
});

// Post request for adding s_time_table data
router.post("/s_time_table_add", (request, response) => {
  let {
    batch_code,
    day,
    t_9,
    t_10,
    t_11,
    t_12,
    t_2,
    t_3,
    t_4,
    t_5,
  } = request.body;
  mySqlConnection.query(
    "INSERT INTO s_time_table VALUES (?)",
    [[batch_code, day, t_9, t_10, t_11, t_12, t_2, t_3, t_4, t_5]],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for updating s_time_table data
router.get("/s_time_table", (request, response) => {
  // Rendering Page
  response.render("s_time_table", {
    s_no: edit.s_no,
    batch_code: edit.batch_code,
    day: edit.day,
    t_9: edit.t_9,
    t_10: edit.t_10,
    t_11: edit.t_11,
    t_12: edit.t_12,
    t_2: edit.t_2,
    t_3: edit.t_3,
    t_4: edit.t_4,
    t_5: edit.t_5,
  });
});

// Post request for updating s_time_table data
router.post("/s_time_table", (request, response) => {
  let {
    batch_code,
    day,
    t_9,
    t_10,
    t_11,
    t_12,
    t_2,
    t_3,
    t_4,
    t_5,
  } = request.body;
  mySqlConnection.query(
    "UPDATE s_time_table SET batch_code = ?, day = ?, t_9 = ?, t_10 = ?, t_11 = ?, t_12 = ?, t_2 = ?, t_3 = ?, t_4 = ?, t_5 = ? WHERE s_no = ?",
    [batch_code, day, t_9, t_10, t_11, t_12, t_2, t_3, t_4, t_5, edit.s_no],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for adding t_grades data
router.get("/t_grades_add", (request, response) => {
  // Rendering Page
  response.render("t_grades_add", {});
});

// Post request for adding t_grades data
router.post("/t_grades_add", (request, response) => {
  let {
    roll_no,
    subject_code,
    assignment_marks,
    attendance_marks,
    minor1,
    minor2,
    major,
  } = request.body;
  mySqlConnection.query(
    "INSERT INTO t_grades VALUES (?)",
    [
      [
        roll_no,
        subject_code,
        assignment_marks,
        attendance_marks,
        minor1,
        minor2,
        major,
      ],
    ],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

// Get request for updating t_grades data
router.get("/t_grades", (request, response) => {
  // Rendering Page
  response.render("t_grades", {
    s_no: edit.s_no,
    roll_no: edit.roll_no,
    subject_code: edit.subject_code,
    assignment_marks: edit.assignment_marks,
    attendance_marks: edit.attendance_marks,
    minor1: edit.minor1,
    minor2: edit.minor2,
    major: edit.major,
  });
});

// Post request for updating t_grades data
router.post("/t_grades", (request, response) => {
  let {
    roll_no,
    subject_code,
    assignment_marks,
    attendance_marks,
    minor1,
    minor2,
    major,
  } = request.body;
  mySqlConnection.query(
    "UPDATE t_grades SET roll_no = ?, subject_code = ?, assignment_marks = ?, attendance_marks = ?, minor1 = ?, minor2 = ?, major = ? WHERE s_no = ?",
    [
      roll_no,
      subject_code,
      assignment_marks,
      attendance_marks,
      minor1,
      minor2,
      major,
      edit.s_no,
    ],
    (err) => {
      if (err) response.status(500).send(err);
      else response.redirect("/super/portal");
    }
  );
});

module.exports = router;
