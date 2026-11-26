import express from "express";
import type { NextFunction, Request, Response } from "express";
import request from "supertest";
import {
  createAiRateLimit,
  DEFAULT_AI_RATE_LIMIT_MAX,
} from "../apps/api/src/middlewares/ai-rate-limit";

jest.mock("../apps/api/src/middlewares/require-auth", () => ({
  requireAuth: (req: Request, res: Response, next: NextFunction) => {
    const userIdHeader = req.headers["x-test-user-id"];
    const roleHeader = req.headers["x-test-role"];
    const userId = Number(userIdHeader);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      res.status(401).json({
        data: null,
        error: { message: "Authentication required" },
        meta: {},
      });
      return;
    }

    req.user = {
      id: userId,
      role: (typeof roleHeader === "string" ? roleHeader : "agent") as
        | "customer"
        | "agent"
        | "admin",
    };
    next();
  },
}));

jest.mock("../apps/api/src/services/tickets.service", () => ({
  ticketsService: {
    findById: jest.fn().mockResolvedValue({
      id: 1,
      title: "Network issue",
      description: "Office WiFi drops intermittently.",
    }),
  },
}));

jest.mock("../apps/api/src/services/comments.service", () => ({
  commentsService: {
    listForTicket: jest.fn().mockResolvedValue([]),
  },
}));

import aiRoutes from "../apps/api/src/routes/ai.routes";

function createTestApp(limit = 3) {
  const app = express();
  app.use(express.json());

  const limiter = createAiRateLimit({
    windowMs: 60_000,
    limit,
  });

  app.use((req, _res, next) => {
    const id = Number(req.headers["x-test-user-id"]);
    if (Number.isSafeInteger(id) && id > 0) {
      req.user = { id, role: "agent" };
    }
    next();
  });

  app.post("/ai/tickets/:id/suggest-reply", limiter, (_req, res) => {
    res.status(200).type("text/plain").send("Draft reply");
  });

  app.post("/ai/tickets/:id/categorise", limiter, (_req, res) => {
    res.status(200).json({
      data: { category: "Network", priority: "P3" },
      error: null,
      meta: { saved: false, provider: "mock" },
    });
  });

  app.get("/tickets", (_req, res) => {
    res.status(200).json({ data: [], error: null, meta: {} });
  });

  return app;
}

describe("Day 17 AI per-user rate limiting", () => {
  test("allows requests within the limit across AI endpoints and returns 429 when exceeded", async () => {
    const app = createTestApp(2);

    await request(app)
      .post("/ai/tickets/1/suggest-reply")
      .set("x-test-user-id", "101")
      .expect(200);

    await request(app)
      .post("/ai/tickets/1/categorise")
      .set("x-test-user-id", "101")
      .expect(200);

    const blockedCategorise = await request(app)
      .post("/ai/tickets/1/categorise")
      .set("x-test-user-id", "101")
      .expect(429);

    expect(blockedCategorise.body).toEqual({
      data: null,
      error: {
        message: "Too many AI requests. Please try again later.",
      },
      meta: {},
    });

    const blockedReply = await request(app)
      .post("/ai/tickets/1/suggest-reply")
      .set("x-test-user-id", "101")
      .expect(429);

    expect(blockedReply.body).toEqual({
      data: null,
      error: {
        message: "Too many AI requests. Please try again later.",
      },
      meta: {},
    });
  });

  test("isolates rate limits per authenticated user even from the same IP", async () => {
    const app = createTestApp(2);

    await request(app)
      .post("/ai/tickets/1/categorise")
      .set("x-test-user-id", "201")
      .expect(200);
    await request(app)
      .post("/ai/tickets/1/categorise")
      .set("x-test-user-id", "201")
      .expect(200);
    await request(app)
      .post("/ai/tickets/1/categorise")
      .set("x-test-user-id", "201")
      .expect(429);

    const otherUserResponse = await request(app)
      .post("/ai/tickets/1/categorise")
      .set("x-test-user-id", "202")
      .expect(200);

    expect(otherUserResponse.body.data).toEqual({
      category: "Network",
      priority: "P3",
    });

    await request(app)
      .post("/ai/tickets/1/suggest-reply")
      .set("x-test-user-id", "202")
      .expect(200);
  });

  test("does not affect normal ticket routes when AI limit is exceeded", async () => {
    const app = createTestApp(1);

    await request(app)
      .post("/ai/tickets/1/categorise")
      .set("x-test-user-id", "301")
      .expect(200);

    await request(app)
      .post("/ai/tickets/1/categorise")
      .set("x-test-user-id", "301")
      .expect(429);

    await request(app)
      .get("/tickets")
      .set("x-test-user-id", "301")
      .expect(200);
  });

  test("wires per-user rate limiting onto real ai.routes endpoints", async () => {
    const app = express();
    app.use(express.json());
    app.use("/ai", aiRoutes);

    for (let i = 0; i < DEFAULT_AI_RATE_LIMIT_MAX; i += 1) {
      const endpoint =
        i % 2 === 0
          ? "/ai/tickets/1/categorise"
          : "/ai/tickets/1/suggest-reply";

      await request(app)
        .post(endpoint)
        .set("x-test-user-id", "901")
        .set("x-test-role", "agent")
        .expect(200);
    }

    const exceeded = await request(app)
      .post("/ai/tickets/1/categorise")
      .set("x-test-user-id", "901")
      .set("x-test-role", "agent")
      .expect(429);

    expect(exceeded.body).toEqual({
      data: null,
      error: {
        message: "Too many AI requests. Please try again later.",
      },
      meta: {},
    });

    await request(app)
      .post("/ai/tickets/1/categorise")
      .set("x-test-user-id", "902")
      .set("x-test-role", "agent")
      .expect(200);
  });
});
