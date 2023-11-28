const supertest = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../../models/user");
const app = require("../../app");

mongoose.set("strictQuery", false);

const DB_TEST_URI =
  "mongodb+srv://kludan:mongo1995@cluster0.dhazxci.mongodb.net/db-contacts-tests?retryWrites=true&w=majority";

// Set a test JWT secret
const TEST_JWT_SECRET = "test-secret-key";

// Set the JWT secret for the test environment
process.env.JWT_SECRET = TEST_JWT_SECRET;

describe("Login Controller", () => {
  beforeAll(async () => {
    await mongoose.connect(DB_TEST_URI);
    await User.deleteMany();

    await supertest(app).post("/api/users/register").send({
      email: "testUser@example.com",
      password: "1234567",
    });
  });

  afterAll(async () => {
    await mongoose.disconnect(DB_TEST_URI);
  });

  it("Should log in a user", async () => {
    const response = await supertest(app).post("/api/users/login").send({
      email: "testUser@example.com",
      password: "1234567",
    });

    expect(response.statusCode).toBe(200);

    expect(response.body.user.email).toBe("testUser@example.com");
    expect(typeof response.body.user.email).toBe("string");

    expect(response.body.user.subscription).toBeDefined();
    expect(typeof response.body.user.subscription).toBe("string");
    expect(["starter", "pro", "business"]).toContain(
      response.body.user.subscription
    );

    expect(response.body.token).not.toBeNull();
    const decodedToken = jwt.verify(response.body.token, TEST_JWT_SECRET);
    expect(decodedToken.id).toBeDefined();
  });

  it("Should return 401 for incorrect password", async () => {
    const response = await supertest(app)
      .post("/api/users/login")
      .send({ email: "testUser2@gmail.com", password: "incorrectpassword" });

    expect(response.statusCode).toBe(401);
  });

  it("Should return 401 for non-existent user", async () => {
    const response = await supertest(app)
      .post("/api/users/login")
      .send({ email: "nonexistentuser@gmail.com", password: "password" });

    expect(response.statusCode).toBe(401);
  });
});
