import { describe, test, expect } from "vitest";
import { sqlForPartialUpdate } from "./sql.js";
import { BadRequestError } from "../expressError.js";

describe("sqlForPartialUpdate", function () {
  test("returns valid object", function () {
    const dataToUpdate = { handle: "newName", numEmployees: 10 };
    const jsToSql = { numEmployees: "num_employees" };

    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual(
      {
        "setCols": "\"handle\"=$1, \"num_employees\"=$2",
        "values": ["newName", 10]
      }
    )
  });

  test("throws bad error if dataToUpdate is empty", function () {
    const dataToUpdate = {};
    const jsToSql = { numEmployees: "num_employees" };

    let result;
    try {
      result = sqlForPartialUpdate(dataToUpdate, jsToSql);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy()
    }
  });
});