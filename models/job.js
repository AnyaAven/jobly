import db from "../db.js";
import { BadRequestError, NotFoundError} from "../expressError.js";
import { sqlForPartialUpdate } from "../helpers/sql.js";

/** Related functions for jobs */


class Job {
  /** Create a job (from data), update db, return new job data.
   *  data should be { title, salary, equity, companyHandle }
   *
   *  Returns { id, title, salary, equity, companyHandle }
   */

  static async create({ title, salary, equity, companyHandle }){
    const result = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle)
      VALUES ($1, $2, $3, $4)
      RETURNING
            id,
            title,
            salary,
            equity,
            company_handle AS "companyHandle"`,
            [title, salary, equity, companyHandle],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   *  Returns [{ id, title, salary, equity, companyHandle }, ...]
   * */

  static async findAll() {
    const jobsRes = await db.query(
      `SELECT id,
              title,
              salary,
              equity,
              company_handle AS "companyHandle"
      FROM jobs
      ORDER BY company_handle, title, salary, equity, id`
    );
    return jobsRes.rows;
  }


  /** Find jobs by search parameters
   *
   *  Accepts: {title, minSalary, hasEquity} => {"junior-dev", 70000, false}
   *    title: string, case-insensitive
   *    minSalary: integer, 0 or greater
   *    hasEquity: boolean
   *      All keys optional, must accept at least one
   *
   *      hasEquity:
   *        if true, filter to jobs that provide a non-zero
   *        amount of equity.
   *        If false or not included in the filtering,
   *        list all jobs regardless of equity.
   *
   *  Returns:
   *    [{ id, title, salary, equity, companyHandle }, ...]
   *    for each job that matches search parameters
   */

  static async findBySearch(searchParams) {
    const {whereClause, values} = this._getWhereClause(searchParams);

    let jobsRes = await db.query(`
        SELECT id,
               title,
               salary,
               equity,
               company_handle AS "companyHandle"
        FROM jobs
        WHERE ${whereClause}
        ORDER BY company_handle, title, salary, equity, id`, values)

    return jobsRes.rows;
  }

  /** get Where clause for findBySearch method
   *
   * criteria will be an object with 1 to 3 key/value pairs.
   * => {title, minSalary, hasEquity}
   *
   * Returns:
   * {
   *  whereClause:`title ILIKE '%' || $1 || '%'`
   *               AND salary >= $2
   *               AND equity >= 0`,
   *  values: ["dev", 70000, true]
   * }
   *
   *  Throws BadRequestError for invalid data.
   *    Validates through jobSearchParams.json
   *
  */

  static _getWhereClause(criteria){
    const criteriaCopy = {...criteria}

    const validator = jsonschema.validate(
      criteriaCopy,
      jobSearchParams,
      { required: true },
    );
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const criteriaKeys = Object.keys(criteriaCopy);
    if(criteriaCopy?.hasEquity !== true){
      delete criteriaCopy.hasEquity
    }

    const separateWhereClause = criteriaKeys.map(function (colName, idx){
      if(colName === "title"){
        return `title ILIKE '%' || $${idx + 1} || '%'`
      }
      if(colName === "minSalary"){
        return `salary >= $${idx + 1}`
      }
      if(colName === "hasEquity"){
        return `equity >= 0 $${idx + 1}`
      }
    });

    const whereClause = separateWhereClause.join(" AND ")

    return {
      whereClause,
      values: Object.values(criteriaCopy)
    }
  }



  /** Given a job id, return data about the job.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   * */

  static async get(id) {
    const jobRes = await db.query(
      `SELECT id,
              title,
              salary,
              equity,
              company_handle AS "companyHandle"
      FROM jobs
      WHERE id = $1`, [id]
    );

    const job = jobRes.rows[0];

    if(!job) throw new NotFoundError(`No job with id: ${id}`);

    return job;
  }


  /** Update job data with `data`.
   *
   *  This is a "partial update" --- it's fine if data doesn't contain all
   *  fields; this only changes provided ones.
   *
   *  Data can include { title, salary, equity }
   *       cannot modify `id` or `company_handle`
   *
   *  Returns { id, title, salary, equity, companyHandle }
   *
   *  Throws NotFoundError if job is not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        companyHandle: "company_handle"
      });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `
        UPDATE jobs
        SET ${setCols}
        WHERE id = ${idVarIdx}
        RETURNING
            id,
            title,
            salary,
            equity,
            company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with id: ${id}`);

    return job;
  }


  /** Delete given job from database; returns undefined.
   *
   *  Throws NotFoundError if job is not found.
  */

  static async remove(id) {
    const result = await db.query(
      `DELETE
      FROM jobs
      WHERE id = $1
      RETURNING id, title, company_handle`, [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with id: ${id}`);
  }
}


export default Job;