import { randomUUID } from "node:crypto";
import request from "supertest";
import app from "../../apps/api/src/app";
import { prisma } from "../../apps/api/src/config/prisma";

describe("AI features integration", () => {
  let agentToken = "";
  let customerToken = "";
  let ticketId: number | undefined;
  let customerId: number | undefined;

  beforeAll(async () => {
    const email = process.env.SUPPORTDESK_AGENT_EMAIL;
    const password = process.env.SUPPORTDESK_AGENT_PASSWORD;

    if (!email || !password) {
      throw new Error("Test Agent environment is not configured");
    }

    const agentLogin = await request(app)
      .post("/auth/login")
      .send({ email, password })
      .expect(200);

    agentToken = agentLogin.body.data.token;

    const customerEmail = `ai-test-${randomUUID()}@example.test`;

    const registration = await request(app)
      .post("/auth/register")
      .send({
        name: "AI Integration Customer",
        email: customerEmail,
        password: "IntegrationTestPassword123!",
      })
      .expect(201);

    customerId = registration.body.data.user.id;

    const customerLogin = await request(app)
      .post("/auth/login")
      .send({
        email: customerEmail,
        password: "IntegrationTestPassword123!",
      })
      .expect(200);

    customerToken = customerLogin.body.data.token;

    const ticketResponse = await request(app)
      .post("/tickets")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        title: "Network connection issue",
        description: "The office WiFi network is not connecting.",
        priority: "P2",
      })
      .expect(201);

    ticketId = ticketResponse.body.data.id;
  });

  afterAll(async () => {
    try {
      if (ticketId !== undefined) {
        await prisma.ticket.deleteMany({ where: { id: ticketId } });
      }
      if (customerId !== undefined) {
        await prisma.user.deleteMany({ where: { id: customerId } });
      }
    } finally {
      await prisma.$disconnect();
    }
  });

  test("Agent receives a suggested reply draft", async () => {
    const response = await request(app)
      .post(`/ai/tickets/${ticketId}/suggest-reply`)
      .set("Authorization", `Bearer ${agentToken}`)
      .expect(200);

    expect(response.text).toContain("Thank you for reporting");
    expect(response.headers["content-type"]).toContain("text/plain");
    expect(response.headers["x-ai-provider"]).toBe("mock");
  });

  test("Agent receives validated category and priority without saving", async () => {
    const response = await request(app)
      .post(`/ai/tickets/${ticketId}/categorise`)
      .set("Authorization", `Bearer ${agentToken}`)
      .expect(200);

    expect(response.body.data).toEqual({
      category: "Network",
      priority: "P3",
    });

    expect(response.body.meta).toEqual({
      saved: false,
      provider: "mock",
    });
  });

  test("Customer cannot access AI features", async () => {
    await request(app)
      .post(`/ai/tickets/${ticketId}/categorise`)
      .set("Authorization", `Bearer ${customerToken}`)
      .expect(403);
  });
});
