var express = require("express");
var router = express.Router();
var app = express();

// Mysql 접속
var mysql = require("mysql");

var conn = mysql.createConnection({
    host: "",
    user: "",
    password: "",
    port: 3306,
    database: "",
});

conn.connect(function (err) {
    if (err) throw err;
});

router.get("/:id", function (req, res, next) {
    var id = req.params.id;
    var query =
        "SELECT * FROM Facility AS F LEFT JOIN Addr AS A ON F.ID = A.ID LEFT JOIN Contact AS C ON F.ID = C.ID LEFT JOIN Operating AS O ON F.ID = O.ID LEFT JOIN Charge_Weekday AS CWK ON O.OperateID = CWK.OperateID LEFT JOIN Charge_Weekend AS CWD ON O.OperateID = CWD.OperateID LEFT JOIN Hours_Weekday AS HWK ON O.OperateID = HWK.OperateID LEFT JOIN Hours_Weekend AS HWD ON O.OperateID = HWD.OperateID LEFT JOIN OperatingDay AS OD ON O.OperateID = OD.OperateID LEFT JOIN Commentary AS CM ON O.OperateID = CM.OperateID WHERE F.ID = " +
        id +
        ";";

    conn.query(query, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        res.render("m_detail", {
            title: "Express",
            result: result,
        });
    });
});

router.get("/:id/submit", function (req, res) {
    var id = req.params.id;
    var body = req.body;
    console.log(body);

    var sql = "DELETE FROM dbproject.NewFac WHERE ID=" + id + ";";
    console.log(sql);
    conn.query(sql, function (err, result, fields) {
        if (err) console.log("query is not excuted. insert fail...\n" + err);
        else res.redirect("/adminlist");
    });
});

module.exports = router;
