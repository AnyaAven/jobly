/** Shared config for application; can be required many places. */

import dotenv from "dotenv";
import "colors";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";
const PORT = +process.env.PORT || 3001;

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return (process.env.NODE_ENV === "test")
      ? "postgresql:///jobly_test"
      : process.env.DATABASE_URL || "postgresql:///jobly";
}
// Speed up bcrypt during tests, since the algorithm safety isn't being tested
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

if (process.env.NODE_ENV !== "test") {
  console.log(`
${"Jobly Config:".green}
${"NODE_ENV:".yellow}           ${process.env.NODE_ENV}
${"SECRET_KEY:".yellow}         ${SECRET_KEY}
${"PORT:".yellow}               ${PORT}
${"BCRYPT_WORK_FACTOR:".yellow} ${BCRYPT_WORK_FACTOR}
${"Database:".yellow}           ${getDatabaseUri()}
---`);
}

export {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
};
