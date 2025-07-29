import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

export const authRouter = express.Router();

authRouter.use(
  "/register",
  createProxyMiddleware({
    target: "http://localhost:8001/api/auth-service/users",
    changeOrigin: true,
    pathRewrite: { "^/api/auth/register": "" },
    selfHandleResponse: false,
  })
);

authRouter.use(
  "/login",
  createProxyMiddleware({
    target: "http://localhost:8001/api/auth-service/users/login",
    changeOrigin: true,
    pathRewrite: { "^/api/auth/login": "" },
    selfHandleResponse: false,
  })
);

authRouter.use(
  "/get-user",
  createProxyMiddleware({
    target: "http://localhost:8001/api/auth-service/users",
    changeOrigin: true,
    pathRewrite: { "^/api/auth/get-user": "" },
    selfHandleResponse: false,
  })
);

authRouter.use(
  "/update-user",
  createProxyMiddleware({
    target: "http://localhost:8001/api/auth-service/users",
    changeOrigin: true,
    pathRewrite: { "^/api/auth/get-user": "" },
    selfHandleResponse: false,
  })
);

authRouter.use(
  "/callback",
  createProxyMiddleware({
    target: "http://localhost:8001/api/auth-service/users/get-token",
    changeOrigin: true,
    pathRewrite: { "^/api/auth/callback": "" },
    selfHandleResponse: false,
  })
);
