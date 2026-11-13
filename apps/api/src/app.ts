
import express from "express";
import helmet from "helmet";
import cors from "cors";

import { requestLogger } from "./middlewares/request-logger";
import { errorHandler } from "./middlewares/error-handler";
import authRoutes from "./routes/auth.routes";
import ticketsRoutes from "./routes/tickets.routes";

const app = express();

const corsOrigin = process.env.CORS_ORIGIN;

if (process.env.NODE_ENV === "production" && !corsOrigin) {
  throw new Error("CORS_ORIGIN is required in production");
}

const allowedOrigins = (
  corsOrigin ?? "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.status(200).json({
    data: { status: "OK" },
    error: null,
    meta: {},
  });
});

app.use("/auth", authRoutes);
app.use("/tickets", ticketsRoutes);

app.use(errorHandler);

export default app;
