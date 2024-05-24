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
      VALUES ($1, $2, $3, $4, $5)
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
      ORDER BY companyHandle, title, salary, equity, id`
    );
    return jobsRes.rows;
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