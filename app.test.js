import {
  test,
  expect,
  afterAll,
} from "vitest";
import request from "supertest";

import app from "./app.js";
import db from "./db.js";

test("not found for site 404", async function () {
  const resp = await request(app).get("/no-such-path");
  expect(resp.statusCode).toEqual(404);
});

test("not found for site 404 (test stack print)", async function () {
  process.env.NODE_ENV = "";
  const resp = await request(app).get("/no-such-path");
  expect(resp.statusCode).toEqual(404);
  delete process.env.NODE_ENV;
});

test("handles unexpected errors", async function () {
  // Add a temporary route that crashes in an unexpected way to see if works
  const authRouter = (await import("./routes/auth.js")).default;
  authRouter.get("/crash", function (req, res) { throw new Error() });

  const resp = await request(app).get("/auth/crash");
  expect(resp.statusCode).toEqual(500);
});

afterAll(function () {
  db.end();
});
