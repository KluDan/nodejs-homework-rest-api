require("dotenv").config();

const supertest = require("supertest");
const mongoose = require("mongoose");

const User = require("../../models/user");
const app = require("../../app");

mongoose.set("strictQuery", false);

const { DB_TEST_URI } = process.env;

describe("register", () => {
  beforeAll(async () => {
    await mongoose.connect(DB_TEST_URI);

    await User.deleteMany();
  });

  afterAll(async () => {
    await mongoose.disconnect(DB_TEST_URI);
  });

  it("Should register new user", async () => {
    const response = await supertest(app).post("/api/users/register").send({
      email: "testUser1@gmail.com",
      password: "123456",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("Registration successfully");
  });

  it("Should not register the same user 2 times", async () => {
    await supertest(app).post("/api/users/register").send({
      email: "testUser2@gmail.com",
      password: "123456",
    });

    const response = await supertest(app).post("/api/users/register").send({
      email: "testUser2@gmail.com",
      password: "123456",
    });
    expect(response.statusCode).toBe(409);
  });
});
