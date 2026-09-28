import cors from "cors";
import express, { type Express } from "express";
import { errorHandler } from "./middlewares/error-handler.js";
import { createApiRouter } from "./routes/index.js";

export function createApp(): Express {
  const app = express();
  // Front-end (web/) roda em uma origem diferente (Vite dev server / build estático
  // na Vercel). Aceita uma ou mais origens separadas por vírgula em CORS_ORIGIN,
  // por exemplo: "https://meu-app.vercel.app,http://localhost:5173".
  const allowedOrigins = (process.env["CORS_ORIGIN"] ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json());
  app.use("/api/v1", createApiRouter());
  app.use(errorHandler);
  return app;
}
