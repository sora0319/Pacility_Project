import express from "express";
import bodyParser from "body-parser";
const router = express.Router();

router.use(bodyParser.json());
let tasks = [];
let users = [];

/* GET home page. */
router.get("/tasks", (req, res) => {
    res.json(tasks);
});

router.post("/tasks", (req, res) => {
    const task = req.body;
    tasks.push(task);
    res.status(201).json(task);
});

export default router;
