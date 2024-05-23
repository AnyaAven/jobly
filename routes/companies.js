/** Routes for companies. */

import jsonschema from "jsonschema";
import { Router } from "express";

import { BadRequestError } from "../expressError.js";
import { ensureLoggedIn } from "../middleware/auth.js";
import Company from "../models/company.js";
import compNewSchema from "../schemas/compNew.json" with { type: "json" };
import compUpdateSchema from "../schemas/compUpdate.json" with { type: "json" };
import compSearchParams from "../schemas/compSearchParams.json" with { type: "json" };

const router = new Router();


/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */

router.post("/", ensureLoggedIn, async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    compNewSchema,
    { required: true },
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const company = await Company.create(req.body);
  return res.status(201).json({ company });
});

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees (integer inclusive, should be >= 0)
 * - maxEmployees (integer inclusive, should be >= 0)
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Companies with num_employees: null will not be presented if filtering
 * by minEmployees or maxEmployees
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  let companies;
  const queryCopy = req.query;

  // Use all companies if no querystring is present
  if (Object.keys(queryCopy).length === 0) {
    companies = await Company.findAll();
    return res.json({ companies });
  }

  // Change min and max to numbers
  if (queryCopy.minEmployees !== undefined) {
    queryCopy.minEmployees = Number(queryCopy.minEmployees);
  }
  if (queryCopy.maxEmployees !== undefined) {
    queryCopy.maxEmployees = Number(queryCopy.maxEmployees);
  }

  const validator = jsonschema.validate(
    queryCopy,
    compSearchParams,
    { required: true },
  );

  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  companies = await Company.findBySearch(queryCopy);

  return res.json({ companies });
});

/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
  const company = await Company.get(req.params.handle);
  return res.json({ company });
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login
 */

router.patch("/:handle", ensureLoggedIn, async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    compUpdateSchema,
    { required: true },
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const company = await Company.update(req.params.handle, req.body);
  return res.json({ company });
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */

router.delete("/:handle", ensureLoggedIn, async function (req, res, next) {
  await Company.remove(req.params.handle);
  return res.json({ deleted: req.params.handle });
});


export default router;
