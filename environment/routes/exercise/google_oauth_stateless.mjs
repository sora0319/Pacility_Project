import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import client from "prom-client";
import winston from "winston";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

// 환경 변수 로드
dotenv.config();
const router = express.Router();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Passport 초기화 및 세션 연결
router.use(passport.initialize());

router.use(cors());
router.use(bodyParser.json());
router.use(morgan("combined"));

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
    if (httpRequestDurationMicroseconds) {
        const end = httpRequestDurationMicroseconds.startTimer();
        res.on("finish", () => {
            end({ method: req.method, route: req.route ? req.route.path : "", code: res.statusCode });
        });
    }
    next();
});

// Winston logger 설정
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports: [new winston.transports.Console(), new winston.transports.File({ filename: "combined.log" })],
});

passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: "/oauth/auth/google/callback",
        },
        (accessToken, refreshToken, profile, done) => {
            if (accessToken && refreshToken) {
                const user = { accessToken, refreshToken, profile };
                return done(null, user);
            } else {
                return done(new Error("Failed to receive access token"));
            }
        }
    )
);

router.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);

const tokenStorage = new Map();

router.get("/auth/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
    if (req.user && req.user.accessToken) {
        const uniqueId = uuidv4();
        tokenStorage.set(uniqueId, {
            accessToken: req.user.accessToken,
            refreshToken: req.user.refreshToken,
        });

        // 부모 창이 접근할 수 있도록 로컬 스토리지에 데이터 저장
        res.send(`
            <script>
                localStorage.setItem('tokenId', '${uniqueId}');
                window.close();
            </script>
        `);
    } else {
        res.status(401).json({ error: "Authentication failed" });
    }
});

router.get("/auth/google/token", (req, res) => {
    const tokenId = req.headers["x-token-id"];

    if (tokenId && tokenStorage.has(tokenId)) {
        const tokens = tokenStorage.get(tokenId);
        res.json(tokens); // accessToken과 refreshToken 반환
    } else {
        res.status(401).json({ error: "Token not found" });
    }
});

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        console.log("헤더 Token 반환이 없음");
        return res.sendStatus(401);
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

    if (!token) {
        console.log("Token 반환이 없음");
        return res.sendStatus(401);
    }

    try {
        // 구글 토큰 유효성 검사 (최신 엔드포인트 사용)
        const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?access_token=${token}`);

        if (response.data.error) {
            console.log("유효하지 않은 토큰");
            return res.sendStatus(401);
        }

        // 유효하면 req 객체에 사용자 정보를 추가하고 다음으로 이동
        req.auth = response.data; // 필요한 경우 사용자 정보를 req.auth에 저장
        next();
    } catch (error) {
        console.error("Error during token validation:", error.response?.data || error.message);
        return res.sendStatus(401);
    }
};

let tasks = {};

// 사용자별 작업 조회
router.get("/tasks", authenticateToken, (req, res) => {
    const userId = req.auth.googleId;
    logger.info(`Fetching tasks for user ID: ${userId}`);
    res.json(tasks[userId] || []);
});

// 사용자별 작업 추가
router.post("/tasks", authenticateToken, (req, res) => {
    const userId = req.auth.googleId;
    const task = req.body;

    if (!tasks[userId]) {
        tasks[userId] = [];
    }

    tasks[userId].push(task);
    logger.info(`Task added for user ID: ${userId}`, task);
    res.status(201).json(task);
});

export default router;
