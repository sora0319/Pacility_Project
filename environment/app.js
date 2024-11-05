import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import { fileURLToPath } from "url";
import ejs from "ejs";
import dotenv from "dotenv";
import cors from "cors"; // CORS 패키지 추가

// 환경 변수 로드
dotenv.config();
const port = process.env.PORT || 3001;

const app = express();
app.use(cors()); // CORS 미들웨어 추가

// Import routers
import mainRouter from "./routes/main.js";
import jwtRouter from "./routes/jwt.mjs";
import promRouter from "./routes/prom.mjs";
import logRouter from "./routes/logging_env.mjs";
import corsRouter from "./routes/cors.mjs";
import googleRouter from "./routes/google_oauth.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");
app.engine("html", ejs.renderFile);

//app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/main", mainRouter);
app.use("/jwt", jwtRouter);
app.use("/prom", promRouter);
app.use("/log", logRouter);
app.use("/cors", corsRouter);
app.use("/oauth", googleRouter);

app.get("/example", (req, res) => {
    res.render("testview"); // 'views/example.html' 파일을 렌더링
});

app.get("/", (req, res) => {
    res.render("googleview"); // 'views/example.html' 파일을 렌더링
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

export default app;
