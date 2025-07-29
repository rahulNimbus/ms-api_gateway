import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

export const otpRouter = express.Router();

otpRouter.use(
  "/generate",
  createProxyMiddleware({
    target: "http://localhost:8001/api/auth-service/otp/generate",
    changeOrigin: true,
    pathRewrite: { "^/api/otp/generate": "" },
    selfHandleResponse: false,
  })
);

otpRouter.use(
  "/verify",
  createProxyMiddleware({
    target: "http://localhost:8001/api/auth-service/otp/verify",
    changeOrigin: true,
    pathRewrite: { "^/api/otp/verify": "" },
    selfHandleResponse: false,
  })
);
