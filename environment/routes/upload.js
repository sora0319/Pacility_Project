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
    console.log("successfully connected");
});

var saves;

var nextID;
var nextUnregID;
var inputs1;
var inputs2;
var inputs3;
var inputs4;

/* GET home page. */
router.get("/", function (req, res, next) {
    //DB내용 보기
    var selectSQL = "SELECT ID FROM dbproject.Facility WHERE ID = (SELECT max(ID) FROM dbproject.Facility)";
    conn.query(selectSQL, function (err, rows, fields) {
        if (err) throw err;
        else {
            console.log("id", rows[0]);
            nextID = rows[0].ID + 1;
            console.log("nextid2", nextID);
        }
    });

    var selectSQL = "SELECT Unreg_ID FROM dbproject.NewFac WHERE Unreg_ID = (SELECT max(Unreg_ID) FROM dbproject.NewFac)";
    conn.query(selectSQL, function (err, rows, fields) {
        if (err) throw err;
        else {
            console.log("id2", rows[0]);
            if (rows[0] === undefined) {
                nextUnregID = 1;
                console.log("newfacid", nextUnregID);
            } else {
                nextUnregID = rows[0].Unreg_ID + 1;
                console.log("newfacid2", nextUnregID);
            }
        }
    });

    res.render("upload.html");
});

/* GET home page. */
router.get("/uploaderror", function (req, res, next) {
    res.render("uploaderror.html");
});

/* submit data*/
router.post("/UpClick", function (req, res) {
    console.log(req.body);
    saves = req.body;
    //Not null handle
    if (req.body.facilityname == "" || req.body.address == "" || req.body.type == "Open this select menu") {
        res.redirect("/upload/uploaderror");
    }

    //input the value
    var facilityname = req.body.facilityname;
    var address = req.body.address;
    var type = req.body.type;
    var tel = req.body.tel;
    var url = req.body.url;
    var reserv = req.body.reserv;
    if (req.body.reserv == "CANNOT") {
        reserv = null;
    }
    var chargewk = req.body.chargewk;
    if (req.body.chargewk == "") {
        chargewk = null;
    }
    var chargewd = req.body.chargewd;
    if (req.body.chargewd == "") {
        chargewd = null;
    }
    var wkopen = req.body.wkopen;
    if (req.body.wkopen == "") {
        wkopen = null;
    }
    var wkclose = req.body.wkclose;
    if (req.body.wkclose == "") {
        wkclose = null;
    }
    var wdopen = req.body.wdopen;
    if (req.body.wdopen == "") {
        wdopen = null;
    }
    var wdclose = req.body.wdclose;
    if (req.body.wdclose == "") {
        wdclose = null;
    }
    var Monday = "CLOSE";
    if (req.body.Monday == "on") {
        Monday = "OPEN";
    }
    var Tuesday = "CLOSE";
    if (req.body.Tuesday == "on") {
        Tuesday = "OPEN";
    }
    var Wensday = "CLOSE";
    if (req.body.Wensday == "on") {
        Wensday = "OPEN";
    }
    var Thursday = "CLOSE";
    if (req.body.Thursday == "on") {
        Thursday = "OPEN";
    }
    var Friday = "CLOSE";
    if (req.body.Friday == "on") {
        Friday = "OPEN";
    }
    var Saturday = "CLOSE";
    if (req.body.Saturday == "on") {
        Saturday = "OPEN";
    }
    var Sunday = "CLOSE";
    if (req.body.Sunday == "on") {
        Sunday = "OPEN";
    }
    var comment = req.body.comment;
    if (req.body.comment == "") {
        comment = null;
    }
    var opID = nextID + 5000;

    //Facility
    var insertSQL = "INSERT INTO dbproject.Facility(ID, name, type, reservation) VALUES(?,?,?,?)";

    var params = [nextID, facilityname, type, reserv];

    conn.query(insertSQL, params, function (err, row, fields) {
        if (err) {
            throw err;
        } else {
            console.log("succes1");
        }
    });

    //NewFac
    insertSQL = "INSERT INTO dbproject.NewFac() VALUES(?,?)";
    params = [nextUnregID, nextID];

    conn.query(insertSQL, params, function (err, row, fields) {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log("succes2");
        }
    });

    //Addr
    insertSQL = "INSERT INTO dbproject.Addr() VALUES(?,?)";
    params = [nextID, address];

    conn.query(insertSQL, params, function (err, row, fields) {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log("succes3");
        }
    });

    //Contact
    insertSQL = "INSERT INTO dbproject.Contact() VALUES(?,?,?)";
    params = [nextID, tel, url];

    conn.query(insertSQL, params, function (err, row, fields) {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log("succes4");
        }
    });

    //Operating
    insertSQL = "INSERT INTO dbproject.Operating() VALUES(?,?)";
    params = [nextID, opID];

    conn.query(insertSQL, params, function (err, row, fields) {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log("succes5");
        }
    });

    //Charge_Weekday
    insertSQL = "INSERT INTO dbproject.Charge_Weekday() VALUES(?,?)";
    params = [opID, chargewk];

    conn.query(insertSQL, params, function (err, row, fields) {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log("succes6");
        }
    });

    //Charge_Weekend
    insertSQL = "INSERT INTO dbproject.Charge_Weekend() VALUES(?,?)";
    params = [opID, chargewd];

    conn.query(insertSQL, params, function (err, row, fields) {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log("succes7");
        }
    });

    //Hours_Weekday
    insertSQL = "INSERT INTO dbproject.Hours_Weekday() VALUES(?,?,?)";
    params = [opID, wkopen, wkclose];

    conn.query(insertSQL, params, function (err, row, fields) {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log("succes8");
        }
    });

    //Hours_Weekend
    insertSQL = "INSERT INTO dbproject.Hours_Weekend() VALUES(?,?,?)";
    params = [opID, wdopen, wdclose];

    conn.query(insertSQL, params, function (err, row, fields) {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log("succes9");
        }
    });

    //Operating day
    insertSQL = "INSERT INTO dbproject.OperatingDay() VALUES(?,?,?,?,?,?,?,?)";
    params = [opID, Monday, Tuesday, Wensday, Thursday, Friday, Saturday, Sunday];

    conn.query(insertSQL, params, function (err, row, fields) {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log("succes10");
        }
    });

    //Comment
    insertSQL = "INSERT INTO dbproject.Commentary() VALUES(?,?)";
    params = [opID, comment];

    conn.query(insertSQL, params, function (err, row, fields) {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log("succes11");
        }
    });

    //DB내용 보기
    var selectSQL =
        "SELECT * From dbproject.Facility AS F  LEFT JOIN dbproject.Addr AS A ON F.ID = A.ID LEFT JOIN dbproject.Contact AS C ON F.ID = C.ID WHERE F.ID = (SELECT max(ID) FROM dbproject.Facility)";
    conn.query(selectSQL, function (err, rows, fields) {
        if (err) throw err;
        else {
            //console.log("id",rows[0]);
            inputs1 = rows[0];
        }
    });

    var selectSQL =
        "SELECT * FROM dbproject.Facility AS F LEFT JOIN  Operating AS O ON F.ID = O.ID LEFT JOIN Charge_Weekday AS WK ON O.OperateID = WK.OperateID LEFT JOIN Charge_Weekend AS WD ON O.OperateID = WD.OperateID ORDER BY O.OperateID DESC LIMIT 1";
    conn.query(selectSQL, function (err, rows2, fields) {
        if (err) throw err;
        else {
            //console.log("id2",rows2[0]);
            inputs2 = rows2[0];
        }
    });

    var selectSQL =
        "SELECT * FROM dbproject.Facility AS F LEFT JOIN  Operating AS O ON F.ID = O.ID LEFT JOIN Hours_Weekday AS WK ON O.OperateID = WK.OperateID LEFT JOIN Hours_Weekend AS WD ON O.OperateID = WD.OperateID ORDER BY O.OperateID DESC LIMIT 1";
    conn.query(selectSQL, function (err, rows3, fields) {
        if (err) throw err;
        else {
            //console.log("id2",rows3[0]);
            inputs3 = rows3[0];
        }
    });

    var selectSQL =
        "SELECT * FROM dbproject.Facility AS F LEFT JOIN  Operating AS O ON F.ID = O.ID LEFT JOIN OperatingDay AS D ON O.OperateID = D.OperateID LEFT JOIN Commentary AS C ON O.OperateID = C.OperateID ORDER BY O.OperateID DESC LIMIT 1;";
    conn.query(selectSQL, function (err, rows4, fields) {
        if (err) throw err;
        else {
            //console.log("id2",rows4[0]);
            inputs4 = rows4[0];
            res.redirect("/upload/udetail");
        }
    });
});

/* GET home page. */
router.get("/udetail", function (req, res, next) {
    console.log("check1", inputs1);
    console.log("check2", inputs2);
    console.log("check3", inputs3);
    console.log("check4", inputs4);
    res.render("udetail", {
        facilitytable: inputs1,
        chargetable: inputs2,
        hourtable: inputs3,
        operdaytable: inputs4,
    });
});
module.exports = router;
