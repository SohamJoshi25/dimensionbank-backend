const { Pool } = require("pg");
const dotenv = require("dotenv");
const initTables = require("./initTable.database");

dotenv.config();

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
});

initTables(pool);
  
module.exports = pool;
