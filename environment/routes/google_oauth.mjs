import express from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import { expressjwt } from "express-jwt";
import morgan from "morgan";
import client from "prom-client";
import winston from "winston";
import dotenv from "dotenv";
import { findUser } from "./users.js";
import cors from "cors";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// 환경 변수 로드
dotenv.config();

const router = express.Router();
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
    // Ensure that the metric exists before using it
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

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3001",
        },
        function (accessToken, refreshToken, profile, cb) {
            User.findOrCreate({ googleId: profile.id }, function (err, user) {
                return cb(err, user);
            });
        }
    )
);

// Serialize user
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

// Deserialize user
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

router.get(
    "/login/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);

router.get("/login/google/callback", passport.authenticate("google", { failureRedirect: "/" }), function (req, res) {
    // 로그인 성공 시 홈 페이지로 리디렉션
    res.redirect("/");
});

export default router;
