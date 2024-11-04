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
    database: "",
});

//mysql 접속하기
conn.connect(function (err) {
    if (err) throw err;
    console.log("successfully connected");
});

router.get("/", function (req, res, next) {
    res.render("loginInfo.html");
});

router.post("/joinFormClick", function (req, res) {
    var nextID;
    //DB내용 보기
    var selectSQL = "SELECT id FROM innodb.loginInfo WHERE id = (SELECT max(id) FROM innodb.loginInfo)";
    conn.query(selectSQL, function (err, rows, fields) {
        if (err) throw err;
        else {
            nextID = rows[0].id + 1;
        }
    });
    console.log(nextID);
    console.log(req.body);

    //mariadB에 넣고 싶은 정보 정하기
    var info = {
        id: nextID,
        name: req.body.name,
        gender: req.body.gender,
        nickname: req.body.ID,
        password: req.body.password,
        passwordcheck: req.body.passwordcheck,
        date: req.body.date,
        email: req.body.email,
        school: req.body.school,
        grade: req.body.grade,
    };

    //mariaDB에 정보 넣기
    var insertSQL =
        "INSERT INTO innodb.loginInfo(id, name, gender, nickname, password, passwordcheck, date, email, school, grade) VALUES(?,?,?,?,?,?,?,?,?,?)";
    var params = [
        info["id"],
        info["name"],
        info["gender"],
        info["nickname"],
        info["password"],
        info["passwordcheck"],
        info["date"],
        info["email"],
        info["school"],
        info["grade"],
    ];

    conn.query(insertSQL, params, function (err, row, fields) {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log("succes");
            res.redirect("/join");
        }
    });
});

module.exports = router;
