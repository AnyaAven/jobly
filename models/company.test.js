import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";

import db from "../db.js";
import { BadRequestError, NotFoundError } from "../expressError.js";
import Company from "./company.js";
import {
  commonAfterAll,
  commonAfterEach,
  commonBeforeAll,
  commonBeforeEach,
} from "./_testCommon.js";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newCompany = {
    handle: "new",
    name: "New",
    description: "New Description",
    numEmployees: 1,
    logoUrl: "http://new.img",
  };

  test("works", async function () {
    let company = await Company.create(newCompany);
    expect(company).toEqual(newCompany);

    const result = await db.query(
      `SELECT handle, name, description, num_employees, logo_url
       FROM companies
       WHERE handle = 'new'`);
    expect(result.rows).toEqual([
      {
        handle: "new",
        name: "New",
        description: "New Description",
        num_employees: 1,
        logo_url: "http://new.img",
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Company.create(newCompany);
      await Company.create(newCompany);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let companies = await Company.findAll();
    expect(companies).toEqual([
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
    ]);
  });
});

/*************************************************************** findBySearch */

describe("findBySearch", function () {
  test("works: with filters", async function () {
    const searchParams = { nameLike: "c1", minEmployees: 1, maxEmployees: 10 };
    const companies = await Company.findBySearch(searchParams);

    expect(companies).toEqual([{
      handle: "c1",
      name: "C1",
      description: "Desc1",
      numEmployees: 1,
      logoUrl: "http://c1.img",
    }]);
  });

  test("throws BadRequestError: empty search parameters", async function () {
    try {
      await Company.findBySearch({});
      throw new Error("fail test, you shouldn't get here");
    }
    catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("throws BadRequestError: minEmployees > maxEmployees", async function () {
    try {
      await Company.findBySearch({
        nameLike: "c1",
        minEmployees: 2,
        maxEmployees: 1
      });
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("works: with only nameLike", async function () {
    const companies = await Company.findBySearch({ nameLike: "c1" });
    expect(companies).toEqual([{
      handle: "c1",
      name: "C1",
      description: "Desc1",
      numEmployees: 1,
      logoUrl: "http://c1.img",
    }]);
  });

  test("works: with only minEmployees", async function () {
    let companies = await Company.findBySearch({ minEmployees: 2 });
    expect(companies).toEqual([{
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
    }]);
  });

  test("works: with only minEmployees", async function () {
    const companies = await Company.findBySearch({ minEmployees: 2 });
    expect(companies).toEqual([{
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
    }]);
  });

  test("works: with only maxEmployees", async function () {
    const companies = await Company.findBySearch({ maxEmployees: 1 });
    expect(companies).toEqual([{
      handle: "c1",
      name: "C1",
      description: "Desc1",
      numEmployees: 1,
      logoUrl: "http://c1.img",
    }]);
  });

  test("works: with returning no results ", async function () {
    const companies = await Company.findBySearch({ minEmployees: 10 });
    expect(companies).toEqual([]);
    expect(companies.length).toEqual(0);
  });

  test("throws bad request: negative numbers ", async function () {
    try {
      await Company.findBySearch({ minEmployees: -10, maxEmployees: -1 });
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("works: Only companies that have 2 employees ", async function () {
    const companies = await Company.findBySearch(
      { minEmployees: 2, maxEmployees: 2 });

    expect(companies).toEqual([{
      handle: "c2",
      name: "C2",
      description: "Desc2",
      numEmployees: 2,
      logoUrl: "http://c2.img",
    }]);
  });

  test("works: with min being 0", async function () {
    let companies = await Company.findBySearch({minEmployees: 0});
    expect(companies).toEqual([
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
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let company = await Company.get("c1");
    expect(company).toEqual({
      handle: "c1",
      name: "C1",
      description: "Desc1",
      numEmployees: 1,
      logoUrl: "http://c1.img",
    });
  });

  test("not found if no such company", async function () {
    try {
      await Company.get("nope");
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    name: "New",
    description: "New Description",
    numEmployees: 10,
    logoUrl: "http://new.img",
  };

  test("works", async function () {
    let company = await Company.update("c1", updateData);
    expect(company).toEqual({
      handle: "c1",
      ...updateData,
    });

    const result = await db.query(
      `SELECT handle, name, description, num_employees, logo_url
       FROM companies
       WHERE handle = 'c1'`);
    expect(result.rows).toEqual([{
      handle: "c1",
      name: "New",
      description: "New Description",
      num_employees: 10,
      logo_url: "http://new.img",
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      name: "New",
      description: "New Description",
      numEmployees: null,
      logoUrl: null,
    };

    let company = await Company.update("c1", updateDataSetNulls);
    expect(company).toEqual({
      handle: "c1",
      ...updateDataSetNulls,
    });

    const result = await db.query(
      `SELECT handle, name, description, num_employees, logo_url
       FROM companies
       WHERE handle = 'c1'`);
    expect(result.rows).toEqual([{
      handle: "c1",
      name: "New",
      description: "New Description",
      num_employees: null,
      logo_url: null,
    }]);
  });

  test("not found if no such company", async function () {
    try {
      await Company.update("nope", updateData);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Company.update("c1", {});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Company.remove("c1");
    const res = await db.query(
      "SELECT handle FROM companies WHERE handle='c1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Company.remove("nope");
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
