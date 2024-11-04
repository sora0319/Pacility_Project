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
    console.log("hi");

    var query =
        "ALTER VIEW dbproject.f_detail_view AS SELECT F.ID as ID, name, type, reservation, image, number, pagelink, address, O.OperateID AS OID, charge_weekend, charge_weekday, open_weekday, open_weekend, close_weekday, close_weekend, Mon, Tue, Wed, Thu, Fri, Sat, Sun, trafficID as TID, FacBusStopName, busStopID, busStopName, busNumber, comment\
    FROM dbproject.Facility as F INNER JOIN dbproject.Contact as C ON F.ID = C.ID\
        INNER JOIN dbproject.Addr as A ON F.ID=A.ID INNER JOIN dbproject.Operating as O ON O.ID = F.ID\
        INNER JOIN dbproject.Charge_Weekend as CWe ON CWe.OperateID = O.OperateID\
        INNER JOIN dbproject.Charge_Weekday as CWd ON CWd.OperateID = O.OperateID\
        INNER JOIN dbproject.Hours_Weekday as HWd ON O.OperateID = HWd.OperateID\
        INNER JOIN dbproject.Hours_Weekend as HWe ON O.OperateID = HWe.OperateID\
        INNER JOIN dbproject.OperatingDay as OD ON O.OperateID = OD.OPerateID\
        INNER JOIN dbproject.Traffic as T ON F.ID = T.ID\
        INNER JOIN dbproject.BusStop_DB as B ON T.FacBusStopName= B.busStopName\
        INNER JOIN dbproject.Commentary as Cm ON O.OperateID = Cm.OperateID; ";

    conn.query(query, function (err, result, fields) {
        if (err) console.log(err);
    });

    var id = req.params.id;
    query = "SELECT * FROM f_detail_view WHERE ID = " + id + " ;";

    conn.query(query, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        if (result.length == 0) {
            query =
                "SELECT * FROM Facility AS F LEFT JOIN Addr AS A ON F.ID = A.ID LEFT JOIN Contact AS C ON F.ID = C.ID LEFT JOIN Operating AS O ON F.ID = O.ID LEFT JOIN Charge_Weekday AS CWK ON O.OperateID = CWK.OperateID LEFT JOIN Charge_Weekend AS CWD ON O.OperateID = CWD.OperateID LEFT JOIN Hours_Weekday AS HWK ON O.OperateID = HWK.OperateID LEFT JOIN Hours_Weekend AS HWD ON O.OperateID = HWD.OperateID LEFT JOIN OperatingDay AS OD ON O.OperateID = OD.OperateID LEFT JOIN Commentary AS CM ON O.OperateID = CM.OperateID WHERE F.ID = " +
                id +
                ";";

            conn.query(query, function (err, result, fields) {
                if (err) throw err;
                console.log(result);
                res.render("detail", {
                    title: "Express",
                    result: result,
                });
            });
        }
        res.render("detail", {
            title: "Express",
            result: result,
        });
    });
});

module.exports = router;
