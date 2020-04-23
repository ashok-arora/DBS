const express = require("express");
const app = express();
const router = express.Router();
const mySqlConnection = require("../db/db");
var path = require("path");

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
  response.render("student_edit", {
    name: "abc",
    roll: "2019BCS-XXX",
    sem: "I",
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
  let(username, password) = request.body;
  if (username && password) {
    connection.query(
      "SELECT * FROM students WHERE username = ? AND password = ?",
      [username, password],
      function (error, results, fields) {
        if (results.length > 0) {
          request.session.loggedin = true;
          request.session.username = username;
          response.redirect("/users/student_portal");
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

router.post("/admin_portal", (request, response) => {
  let roll_no = request.body;
  if (roll_no) {
    connection.query(
      "SELECT * FROM students WHERE roll_no = ?",
      [roll_no],
      function (error, results, fields) {
        if (results.length > 0) {
          request.session.loggedin = true;
          request.session.username = username;
          response.redirect("/users/student_portal");
        } else {
          response.send("Roll No. does not exist");
        }
        response.end();
      }
    );
  } else {
    response.send("Please enter Roll No.");
    response.end();
  }
});

// router.post("/student_edit", (request, response) => {
//   let roll_no = request.body;
//   if (roll_no) {
//     connection.query(
//       "SELECT * FROM students WHERE roll_no = ?",
//       [roll_no],
//       function (error, results, fields) {
//         if (results.length > 0) {
//           request.session.loggedin = true;
//           request.session.username = username;
//           response.redirect("/users/student_portal");
//         } else {
//           response.send("Roll No. does not exist");
//         }
//         response.end();
//       }
//     );
//   } else {
//     response.send("Please enter Roll No.");
//     response.end();
//   }
// });

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
