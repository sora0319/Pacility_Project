var express = require("express");
var router = express.Router();

//mysql 사용할 수 있게 requre 하기
var mysql = require("mysql");

//mysql 접속 정보
var conn = mysql.createConnection({
    host: "",
    user: "",
    password: "",
    port: 3306,
    database: "dbproject",
});

//mysql 접속하기
conn.connect(function (err) {
    if (err) throw err;
    console.log("successfully connected2");
});

/* GET home page. */
router.get("/", function (req, res, next) {
    res.render("login.html");
});

router.get("/loginerror", function (req, res, next) {
    res.render("loginerror.html");
});

router.post("/SignClick", function (req, res) {
    var id = req.body.ID;
    var password = req.body.password;

    conn.query("SELECT * FROM dbproject.master WHERE loginID = ? and logpassword = password(?)", [id, password], function (err, row, fields) {
        if (err) throw err;
        else if (row.length == 0) {
            res.redirect("/login/loginerror");
        } else {
            console.log("succes");
            res.redirect("/adminlist");
        }
    });
});

module.exports = router;
