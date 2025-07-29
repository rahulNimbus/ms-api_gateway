import express from "express";
import cors from "cors";
import { config } from "./configurations/config.mjs";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { RedisConnection } from "./configurations/redis.configuration.mjs";
import { createProxyMiddleware } from "http-proxy-middleware";
import { authRouter } from "./routes/ms-authentication.route.mjs";
import { otpRouter } from "./routes/otp.route.mjs";

const app = express();
const PORT = config.PORT;

await RedisConnection.redisConnection();

const apiRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => RedisConnection.redisClient.sendCommand(args),
    prefix: "ratelimit:",
  }),

  windowMs: 60 * 1000, // 1 min window
  max: 10, // max 100 requests per IP per minute
  standardHeaders: true, // send `RateLimit-*` headers
  legacyHeaders: false, // disable `X-RateLimit-*` headers

  handler: (req, res, next, options) => {
    const err = new Error(
      "Too many requests. Please try again after a minute."
    );
    err.status = 429;
    return next(err);
  },
});

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(apiRateLimiter);

app.use((req, res, next) => {
  res.success = (data, status = 200) => {
    function sortObjectKeys(obj) {
      if (Array.isArray(obj)) {
        return obj.map(sortObjectKeys);
      } else if (obj && typeof obj === "object") {
        return Object.keys(obj)
          .sort()
          .reduce((acc, key) => {
            if (key == "id" && mongoose.Types.ObjectId.isValid(obj[key])) {
              acc[key] = obj[key];
            } else acc[key] = sortObjectKeys(obj[key]);
            return acc;
          }, {});
      }
      return obj;
    }
    res.status(+status).json({
      status: true,
      code: +status,
      data: sortObjectKeys(data),
    });
  };
  next();
});

app.use("/api/auth", authRouter);
app.use("/api/otp", otpRouter);

app.use((req, res, next) => {
  const error = new Error(
    `Page not found or method not allowed on ${req.originalUrl}`
  );
  error.status = 404;
  next(error);
});

app.use(async (err, req, res, next) => {
  console.error({ url: req.url, err, body: req.body, file: req.file });

  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(+statusCode).json({
    status: false,
    code: +statusCode,
    error: message,
  });
});

app.listen(PORT, () => {
  console.log(`App is listening on PORT: ${PORT}`);
});
