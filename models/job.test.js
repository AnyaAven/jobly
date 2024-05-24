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

import Job from "./job.js";
import {
  commonAfterAll,
  commonAfterEach,
  commonBeforeAll,
  commonBeforeEach,
  JOB1_ID,
  JOB2_ID,
} from "./_testCommon.js";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 100000,
    equity: "0.25",
    companyHandle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    newJob.id = job.id;
    expect(job).toEqual(newJob);

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
      FROM jobs
      WHERE title = 'new'`);
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "new",
        salary: 100000,
        equity: "0.25",
        company_handle: "c1"
      },
    ]);
  });
});

/************************************** findAll */

describe("findAll", function () {

  test("works: no filter", async function () {
    const jobs = await Job.findAll();

    expect(jobs).toEqual([{
      companyHandle: "c1",
      equity: "0",
      id: expect.any(Number),
      salary: 100000,
      title: "job1",
    },
    {
      companyHandle: "c2",
      equity: "0",
      id: expect.any(Number),
      salary: 50000,
      title: "job2",
    }]);
  });
});


/************************************** get */

describe("get", function () {
  test("works: valid id", async function () {
    const job1 = await Job.get(JOB1_ID);
    expect(job1).toEqual({
      id: JOB1_ID,
      title: "job1",
      salary: 100000,
      equity: "0",
      companyHandle: "c1"
    });
  });

  test("NotFoundError for invalid Id", async function () {
    try {
      await Job.get(JOB1_ID + JOB2_ID);
      throw new Error("fail test, you shouldn't get here");
    }
    catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});