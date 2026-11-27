import { randomUUID } from "node:crypto";
import request from "supertest";
import app from "../../apps/api/src/app";
import { prisma } from "../../apps/api/src/config/prisma";

const createdUserIds: number[] = [];
const createdTicketIds: number[] = [];
const integrationPassword = "IntegrationTestPassword123!";

async function registerAndLogin(email: string) {
  const registration = await request(app)
    .post("/auth/register")
    .send({
      name: "Integration Test User",
      email,
      password: integrationPassword,
    })
    .expect(201);

  const user = registration.body.data.user;
  createdUserIds.push(user.id);
  expect(user).not.toHaveProperty("passwordHash");

  const login = await request(app)
    .post("/auth/login")
    .send({ email, password: integrationPassword })
    .expect(200);

  return {
    user,
    token: login.body.data.token as string,
  };
}

describe("authentication and ticket API integration", () => {
  afterAll(async () => {
    try {
      if (createdTicketIds.length > 0) {
        await prisma.ticket.deleteMany({
          where: { id: { in: createdTicketIds } },
        });
      }

      if (createdUserIds.length > 0) {
        await prisma.user.deleteMany({
          where: { id: { in: createdUserIds } },
        });
      }
    } finally {
      await prisma.$disconnect();
    }
  });

  test("rejects unauthenticated access to tickets", async () => {
    await request(app)
      .get("/tickets")
      .expect(401)
      .expect(({ body }) => {
        expect(body).toEqual({
          data: null,
          error: { message: "Authentication required" },
          meta: {},
        });
      });
  });

  test("registers and logs in users, then enforces customer ticket ownership", async () => {
    const suffix = randomUUID();
    const owner = await registerAndLogin(`owner-${suffix}@example.test`);
    const otherCustomer = await registerAndLogin(
      `other-${suffix}@example.test`
    );

    expect(owner.user.role).toBe("customer");
    expect(owner.token).toEqual(expect.any(String));

    const ticketResponse = await request(app)
      .post("/tickets")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        title: "Integration test ticket",
        description: "Created by the isolated integration test.",
        priority: "P2",
      })
      .expect(201);

    const ticket = ticketResponse.body.data;
    createdTicketIds.push(ticket.id);
    expect(ticket.creatorId).toBe(owner.user.id);

    const ownerTickets = await request(app)
      .get("/tickets")
      .set("Authorization", `Bearer ${owner.token}`)
      .expect(200);

    expect(ownerTickets.body.data.map((item: { id: number }) => item.id))
      .toContain(ticket.id);

    const otherCustomerTickets = await request(app)
      .get("/tickets")
      .set("Authorization", `Bearer ${otherCustomer.token}`)
      .expect(200);

    expect(otherCustomerTickets.body.data).not.toContainEqual(
      expect.objectContaining({ id: ticket.id })
    );

    await request(app)
      .get(`/tickets/${ticket.id}`)
      .set("Authorization", `Bearer ${otherCustomer.token}`)
      .expect(404);
  });
});
