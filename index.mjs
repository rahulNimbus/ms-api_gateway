import express from "express";
import cors from "cors";
import { config } from "./configurations/config.mjs";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { RedisConnection } from "./configurations/redis.configuration.mjs";
import { createProxyMiddleware } from "http-proxy-middleware";

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

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
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

app.use(
  "/api/auth/register",
  createProxyMiddleware({
    target: "http://localhost:8001/api/auth-service/users",
    changeOrigin: true,
    pathRewrite: { "^/api/auth/register": "" },
    selfHandleResponse: false,
  })
);

app.use(
  "/api/auth/login",
  createProxyMiddleware({
    target: "http://localhost:8001/api/auth-service/users/login",
    changeOrigin: true,
    pathRewrite: { "^/api/auth/login": "" },
    selfHandleResponse: false,
  })
);

app.use(
  "/api/auth/get-user",
  createProxyMiddleware({
    target: "http://localhost:8001/api/auth-service/users",
    changeOrigin: true,
    pathRewrite: { "^/api/auth/get-user": "" },
    selfHandleResponse: false,
  })
);

app.use(
  "/api/auth/update-user",
  createProxyMiddleware({
    target: "http://localhost:8001/api/auth-service/users",
    changeOrigin: true,
    pathRewrite: { "^/api/auth/get-user": "" },
    selfHandleResponse: false,
  })
);

app.use(
  "/api/auth/callback",
  createProxyMiddleware({
    target: "http://localhost:8001/api/auth-service/users/get-token",
    changeOrigin: true,
    pathRewrite: { "^/api/auth/callback": "" },
    selfHandleResponse: false,
  })
);

app.use(
  "/api/otp/generate",
  createProxyMiddleware({
    target: "http://localhost:8001/api/auth-service/otp/generate",
    changeOrigin: true,
    pathRewrite: { "^/api/otp/generate": "" },
    selfHandleResponse: false,
  })
);

app.use(
  "/api/otp/verify",
  createProxyMiddleware({
    target: "http://localhost:8001/api/auth-service/otp/verify",
    changeOrigin: true,
    pathRewrite: { "^/api/otp/verify": "" },
    selfHandleResponse: false,
  })
);

// app.use((req, res, next) => {
//   const error = new Error(
//     `Page not found or method not allowed on ${req.originalUrl}`
//   );
//   error.status = 404;
//   next(error);
// });

// app.use(async (err, req, res, next) => {
//   console.error({ url: req.url, err, body: req.body, file: req.file });

//   const statusCode = err.status || 500;
//   const message = err.message || "Internal Server Error";

//   res.status(+statusCode).json({
//     status: false,
//     code: +statusCode,
//     error: message,
//   });
// });

app.listen(PORT, () => {
  console.log(`App is listening on PORT: ${PORT}`);
});
