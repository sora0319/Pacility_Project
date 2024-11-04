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

var g_result;

conn.connect(function (err) {
    if (err) throw err;
});

app.param(["page"], function (req, res, next, value) {
    console.log("CALLED ONLY ONCE with", value);
    next();
});

router.get("/", function (req, res, next) {
    const pageNum = Number(req.query.pageNum) || 1; // NOTE: 쿼리스트링으로 받을 페이지 번호 값, 기본값은 1
    const contentSize = 27; // NOTE: 페이지에서 보여줄 컨텐츠 수.
    const pnSize = 10; // NOTE: 페이지네이션 개수 설정.
    const skipSize = (pageNum - 1) * contentSize; // NOTE: 다음 페이지 갈 때 건너뛸 리스트 개수.

    // Defines Type categories
    var gym_def = ",'체육관', '헬스장', '운동장'";
    var field_def = ",'축구장', '야구장', '테니스장'";
    var indoor_def = ",'볼링장', '탁구장', '스크린골프장'";
    var others_def = ", '기타'";

    var keyword = req.query.keyword;

    const type_opt1 = req.query.type_opt1;
    const type_opt2 = req.query.type_opt2;
    const type_opt3 = req.query.type_opt3;
    const type_opt4 = req.query.type_opt4;

    var category_list = "'*'";
    var query;

    if (type_opt1) category_list += gym_def;

    if (type_opt2) category_list += field_def;

    if (type_opt3) category_list += indoor_def;

    if (type_opt4) category_list += others_def;

    //query = 'ALTER VIEW filtered_view AS SELECT * FROM dbproject.Facility WHERE type IN (' + category_list +');';

    if (type_opt1 || type_opt2 || type_opt3 || type_opt4)
        query =
            "ALTER VIEW dbproject.filtered_view AS SELECT * FROM dbproject.Facility WHERE type IN (" +
            category_list +
            ") AND ID IN (SELECT ID FROM dbproject.NewFac);";
    else {
        query = "ALTER VIEW dbproject.filtered_view AS SELECT * FROM dbproject.Facility WHERE ID IN (SELECT ID FROM dbproject.NewFac);";
    }
    // Make or create filtered view

    if (keyword != undefined)
        query =
            "ALTER VIEW dbproject.filtered_view AS SELECT * FROM dbproject.Facility WHERE name like '%" +
            keyword +
            "%' AND ID IN (SELECT ID FROM dbproject.NewFac);";

    conn.query(query, function (err, result, fields) {
        if (err) throw err;
    });

    //------------------------------- filter done -----------------
    query = "SELECT COUNT(*) AS `count`  FROM dbproject.filtered_view";

    conn.query(query, function (err, result, fields) {
        if (err) throw err;
        const totalCount = Number(result[0].count); // NOTE: 전체 글 개수.
        const pnTotal = Math.ceil(totalCount / contentSize); // NOTE: 페이지네이션의 전체 카운트
        const pnStart = (Math.ceil(pageNum / pnSize) - 1) * pnSize + 1; // NOTE: 현재 페이지의 페이지네이션 시작 번호.

        let pnEnd = pnStart + pnSize - 1;

        query = " SELECT * FROM dbproject.filtered_view ORDER BY name DESC LIMIT ?, ?";

        conn.query(query, [skipSize, contentSize], function (err, queryResult, fields) {
            if (err) throw err;
            if (pnEnd > pnTotal) pnEnd = pnTotal;

            const result = {
                pageNum,
                pnStart,
                pnEnd,
                pnTotal,
                type_opt1,
                type_opt2,
                type_opt3,
                type_opt4,
                contents: queryResult,
            };

            console.log(totalCount);
            console.log(result);
            res.render("adminlist", {
                title: "Express",
                //id: g_result[1]['ID'];
                result: result,
                contents: queryResult,
            });
        });
    });
});

module.exports = router;
