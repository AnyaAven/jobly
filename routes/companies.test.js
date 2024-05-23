import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";
import request from "supertest";

import app from "../app.js";
import {
  commonAfterAll,
  commonAfterEach,
  commonBeforeAll,
  commonBeforeEach,
  u1Token,
  u4Token,
} from "./_testCommon.js";


beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /companies */

describe("POST /companies", function () {
  const newCompany = {
    handle: "new",
    name: "New",
    logoUrl: "http://new.img",
    description: "DescNew",
    numEmployees: 10,
  };

  test("ok for admin users", async function () {
    const resp = await request(app)
      .post("/companies")
      .send(newCompany)
      .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      company: newCompany,
    });
  });

  test("unauth for non-admin user", async function () {
    const resp = await request(app)
      .post("/companies")
      .send(newCompany)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });
  
  test("unauth for anon", async function () {
    const resp = await request(app)
      .post("/companies")
      .send(newCompany)
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/companies")
      .send({
        handle: "new",
        numEmployees: 10,
      })
      .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/companies")
      .send({
        ...newCompany,
        logoUrl: "not-a-url",
      })
      .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /companies */

describe("GET /companies", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/companies");
    expect(resp.body).toEqual({
      companies:
        [
          {
            handle: "c1",
            name: "C1",
            description: "Desc1",
            numEmployees: 1,
            logoUrl: "http://c1.img",
          },
          {
            handle: "c2",
            name: "C2",
            description: "Desc2",
            numEmployees: 2,
            logoUrl: "http://c2.img",
          },
          {
            handle: "c3",
            name: "C3",
            description: "Desc3",
            numEmployees: 3,
            logoUrl: "http://c3.img",
          },
        ],
    });
  });

  test("works: with filter of nameLike: 1", async function () {
    const resp = await request(app)
      .get("/companies")
      .query({ nameLike: "1" });

    expect(resp.body).toEqual({
      companies:
        [
          {
            handle: "c1",
            name: "C1",
            description: "Desc1",
            numEmployees: 1,
            logoUrl: "http://c1.img",
          }
        ],
    });
  });

  test("works: with filter of minEmployees: 3", async function () {
    const resp = await request(app)
      .get("/companies")
      .query({ minEmployees: "3" });

    expect(resp.body).toEqual({
      companies:
        [
          {
            handle: "c3",
            name: "C3",
            description: "Desc3",
            numEmployees: 3,
            logoUrl: "http://c3.img",
          }
        ]
    });
  });

  test("works: with filter of maxEmployees: 1", async function () {
    const resp = await request(app)
      .get("/companies")
      .query({ maxEmployees: "1" });

    expect(resp.body).toEqual({
      companies:
        [
          {
            handle: "c1",
            name: "C1",
            description: "Desc1",
            numEmployees: 1,
            logoUrl: "http://c1.img",
          }
        ],
    });
  });

  test("bad request: passing in negative numbers - json schema",
    async function () {
      const resp = await request(app)
        .get("/companies")
        .query({ minEmployees: -99, maxEmployees: -10 });

      expect(resp.statusCode).toEqual(400);
      expect(resp.body).toEqual({
        "error": {
          "message": [
            "instance.minEmployees must be greater than or equal to 0",
            "instance.maxEmployees must be greater than or equal to 0",
          ],
          "status": 400,
        },
      });
    }
  );

  test("bad request: passing in 'NaN' or 'null'- json schema", async function () {
    const resp = await request(app)
      .get("/companies")
      .query({ minEmployees: "null", maxEmployees: "NaN" });

    expect(resp.statusCode).toEqual(400);
    expect(resp.body).toEqual(
      {
        "error": {
          "message": [
            "instance.minEmployees is not of a type(s) integer",
            "instance.maxEmployees is not of a type(s) integer",
          ],
          "status": 400,
        },
      }
    );
  });

  test("bad request: passing in words for min/max - json schema",
    async function () {
      const resp = await request(app)
        .get("/companies")
        .query({ minEmployees: "bad", maxEmployees: "string" });

      expect(resp.statusCode).toEqual(400);
      expect(resp.body).toEqual(
        {
          "error": {
            "message": [
              "instance.minEmployees is not of a type(s) integer",
              "instance.maxEmployees is not of a type(s) integer",
            ],
            "status": 400,
          },
        }
      );
    }
  );

  test("bad request: passing invalid query string", async function () {
    const resp = await request(app)
      .get("/companies")
      .query({ badKey: "bad value" });

    expect(resp.statusCode).toEqual(400);
    expect(resp.body).toEqual({
      "error": {
        "message": [
          "instance is not allowed to have the additional property \"badKey\"",
        ],
        "status": 400,
      },
    });
  });

});

/************************************** GET /companies/:handle */

describe("GET /companies/:handle", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/companies/c1`);
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  test("works for anon: company w/o jobs", async function () {
    const resp = await request(app).get(`/companies/c2`);
    expect(resp.body).toEqual({
      company: {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
    });
  });

  test("not found for no such company", async function () {
    const resp = await request(app).get(`/companies/nope`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /companies/:handle */

describe("PATCH /companies/:handle", function () {
  test("works for admin users", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        name: "C1-new",
      })
      .set("authorization", `Bearer ${u4Token}`);
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "C1-new",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  test("unauth for non-admin user", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        name: "C1-new",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        name: "C1-new",
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such company", async function () {
    const resp = await request(app)
      .patch(`/companies/nope`)
      .send({
        name: "new nope",
      })
      .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on handle change attempt", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        handle: "c1-new",
      })
      .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        logoUrl: "not-a-url",
      })
      .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /companies/:handle */

describe("DELETE /companies/:handle", function () {
  test("works for admin users", async function () {
    const resp = await request(app)
      .delete(`/companies/c1`)
      .set("authorization", `Bearer ${u4Token}`);
    expect(resp.body).toEqual({ deleted: "c1" });
  });
  
  test("unauth for non-admin user", async function(){
    const resp = await request(app)
      .delete(`/companies/c1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .delete(`/companies/c1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such company", async function () {
    const resp = await request(app)
      .delete(`/companies/nope`)
      .set("authorization", `Bearer ${u4Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
