import { describe, test, expect } from "vitest";
import jwt from "jsonwebtoken";

import { UnauthorizedError } from "../expressError.js";
import {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUserOrAdmin,
} from "./auth.js";
import { SECRET_KEY } from "../config.js";

const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");
const adminJwt = jwt.sign({ username: "test", isAdmin: true }, SECRET_KEY);

function next(err) {
  if (err) throw new Error("Got error from middleware");
}

describe("authenticateJWT", function () {
  test("works: via header", function () {
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        isAdmin: false,
      },
    });
  });

  test("works: no header", function () {
    const req = {};
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});


describe("ensureLoggedIn", function () {
  test("works", function () {
    const req = {};
    const res = { locals: { user: { username: "test" } } };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    const req = {};
    const res = { locals: {} };
    expect(() => ensureLoggedIn(req, res, next))
      .toThrow(UnauthorizedError);
  });

  test("unauth if no valid login", function () {
    const req = {};
    const res = { locals: { user: {} } };
    expect(() => ensureLoggedIn(req, res, next))
      .toThrow(UnauthorizedError);
  });
});

describe("ensureAdmin", function () {
  test("works", function () {
    const req = {};
    const res = { locals: { user: { isAdmin: true } } };
    ensureAdmin(req, res, next);
  });

  test("unauth if not admin", function () {
    const req = {};
    const res = { locals: { user: { isAdmin: false } } };
    expect(() => ensureAdmin(req, res, next))
      .toThrow(UnauthorizedError);
  });

  test("unauth if no user logged in", function () {
    const req = {};
    const res = { locals: {} };
    expect(() => ensureAdmin(req, res, next))
      .toThrow(UnauthorizedError);
  });
});

describe("ensureCorrectUserOrAdmin", function () {

  describe("works", function () {

    test("works as current user", function () {
      const req = { params: { username: "matchingUser" } };
      const res = { locals: { user: { username: "matchingUser" } } };
      ensureCorrectUserOrAdmin(req, res, next);
    });

    test("works as admin", function () {
      const req = { params: { username: "user we are trying to modify" } };
      const res = { locals: { user: { username: "admin", isAdmin: true } } };
      ensureCorrectUserOrAdmin(req, res, next);
    });

  });

  describe("401 Unauthorized", function () {

    test("if we aren't logged in ", function () {
      const req = { params: { username: "user we are trying to modify" } };
      const res = { locals: {} };
      expect(() => ensureCorrectUserOrAdmin(req, res, next))
        .toThrow(UnauthorizedError);
    });

    test("not the current user or admin", function () {
      const req = { params: { username: "user we are trying to modify" } };
      const res = { locals: { user: { username: "no match", isAdmin: false } } };
      expect(() => ensureCorrectUserOrAdmin(req, res, next))
        .toThrow(UnauthorizedError);
    });

    test("isAdmin can't be truthy, must be true", function () {
      const req = { params: { username: "yes" } };
      const res = { locals: { user: { username: "no", isAdmin: "true" } } };
      expect(() => ensureCorrectUserOrAdmin(req, res, next))
        .toThrow(UnauthorizedError);
    });

  });

});