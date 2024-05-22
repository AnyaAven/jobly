/** Database setup for jobly. */

import pg from "pg";
import { error, log } from "console";

import { getDatabaseUri } from "./config.js";

const { Client } = pg;
const databaseUri = getDatabaseUri();

const db = new Client({
  connectionString: databaseUri,
});

await db.connect();
log(`Connected to ${databaseUri}`);


export default db;
