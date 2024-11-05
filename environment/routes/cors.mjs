import express from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import { expressjwt } from "express-jwt";
import morgan from "morgan";
import client from "prom-client";
import winston from "winston";
import { findUser } from "./users.js";
import dotenv from "dotenv";
import cors from "cors";

// 환경 변수 로드
dotenv.config();

const router = express.Router();
router.use(cors());
router.use(bodyParser.json());
router.use(morgan("combined"));

// Winston logger 설정
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports: [new winston.transports.Console(), new winston.transports.File({ filename: "combined.log" })],
});

const secretKey = process.env.SECRET_KEY;

// Prometheus metrics
if (!client.register.getSingleMetric("process_cpu_user_seconds_total")) {
    client.collectDefaultMetrics();
}

let httpRequestDurationMicroseconds;

if (!client.register.getSingleMetric("http_request_duration_ms")) {
    httpRequestDurationMicroseconds = new client.Histogram({
        name: "http_request_duration_ms",
        help: "Duration of HTTP requests in ms",
        labelNames: ["method", "route", "code"],
        buckets: [50, 100, 200, 300, 400, 500, 1000],
    });
}

router.use((req, res, next) => {
    // Ensure that the metric exists before using it
    if (httpRequestDurationMicroseconds) {
        const end = httpRequestDurationMicroseconds.startTimer();
        res.on("finish", () => {
            end({ method: req.method, route: req.route ? req.route.path : "", code: res.statusCode });
        });
    }
    next();
});

let tasks = {};

// 로그인 엔드포인트
router.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = findUser(username);

    if (!user || user.password !== password) {
        logger.warn(`Failed login attempt for username: ${username}`);
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // JWT 토큰 생성
    const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: "1h" });
    logger.info(`User logged in: ${username}`);
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
    logger.info(`Fetching tasks for user ID: ${userId}`);
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
    logger.info(`Task added for user ID: ${userId}`, task);
    res.status(201).json(task);
});

// Prometheus metrics endpoint
router.get("/metrics", async (req, res) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
});

export default router;
