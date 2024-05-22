import { BadRequestError } from "../expressError.js";

/** Accepts: 
 *    dataToUpdate: JS object of data to be updated {name: newName, ...} 
 *    jsToSql: any necessary conversions from camelCase to snake_case:
 *      {numEmployees: num_employees, logoUrl: logo_url}
 * 
 *  Returns: {setCols, values}
 *    setCols for each key in dataToUpdate: 
 *        {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
 *    values: values of dataToUpdate object
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

export { sqlForPartialUpdate };
