//  Prometheus와 같은 모니터링 시스템과 통합할 수 있는 메트릭을 제공하는 라이브러리
import express from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import { expressjwt } from "express-jwt";
import morgan from "morgan";
import client from "prom-client";
import { findUser, findUserById } from "./users.js";

const router = express.Router();
router.use(bodyParser.json());
router.use(morgan("combined"));

const secretKey = "your_secret_key";

// Prometheus metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestDurationMicroseconds = new client.Histogram({
    name: "http_request_duration_ms",
    help: "Duration of HTTP requests in ms",
    labelNames: ["method", "route", "code"],
    buckets: [50, 100, 200, 300, 400, 500, 1000],
});

router.use((req, res, next) => {
    const end = httpRequestDurationMicroseconds.startTimer();
    res.on("finish", () => {
        end({ method: req.method, route: req.route ? req.route.path : "", code: res.statusCode });
    });
    next();
});

let tasks = {};

// 로그인 엔드포인트
router.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = findUser(username);

    if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // JWT 토큰 생성
    const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: "1h" });
    res.json({ token });
});

// JWT 인증 미들웨어
const authenticateJWT = expressjwt({
    secret: secretKey,
    algorithms: ["HS256"],
});

// 사용자별 작업 조회
router.get("/tasks", authenticateJWT, (req, res) => {
    const userId = req.auth.id;
    res.json(tasks[userId] || []);
});

// 사용자별 작업 추가
router.post("/tasks", authenticateJWT, (req, res) => {
    const userId = req.auth.id;
    const task = req.body;

    if (!tasks[userId]) {
        tasks[userId] = [];
    }

    tasks[userId].push(task);
    res.status(201).json(task);
});

// Prometheus metrics endpoint
router.get("/metrics", async (req, res) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
});

export default router;
