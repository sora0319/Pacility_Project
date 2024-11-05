import express from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import { expressjwt } from "express-jwt";
import { findUser, users } from "./users.js";
const router = express.Router();

router.use(bodyParser.json());

const secretKey = "your_secret_key";

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

// 인증된 사용자만 접근 가능한 엔드포인트
router.get("/users", authenticateJWT, (req, res) => {
    res.json(users);
});

export default router;
