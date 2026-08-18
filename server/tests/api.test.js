import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import app from "../src/app.js";
import { seedDemoStore } from "../src/data/memory.js";

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  await seedDemoStore(true);
});

describe("Finora API", () => {
  it("reports a healthy service", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("ok");
  });

  it("rejects protected requests without a token", async () => {
    const response = await request(app).get("/api/transactions");
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("authenticates the demo user and returns private data", async () => {
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: "demo@finora.app", password: "demo1234" });
    expect(loginResponse.status).toBe(200);
    const token = loginResponse.body.data.token;
    const transactions = await request(app)
      .get("/api/transactions?limit=5")
      .set("Authorization", `Bearer ${token}`);
    expect(transactions.status).toBe(200);
    expect(transactions.body.data.items).toHaveLength(5);
  });
});

