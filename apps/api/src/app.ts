
import express from "express";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import helmet from "helmet";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { parse } from "yaml";

import { requestLogger } from "./middlewares/request-logger";
import { errorHandler } from "./middlewares/error-handler";
import authRoutes from "./routes/auth.routes";
import ticketsRoutes from "./routes/tickets.routes";

const app = express();
const openApiSpec = parse(
  readFileSync(resolve(process.cwd(), "docs/openapi.yaml"), "utf8")
);

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

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

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
