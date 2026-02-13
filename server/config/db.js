const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || process.env.PGHOST || "localhost",
  port: process.env.DB_PORT || process.env.PGPORT || 5432,
  user: process.env.DB_USER || process.env.PGUSER || "postgres",
  password: process.env.DB_PASSWORD || process.env.PGPASSWORD || "",
  database: process.env.DB_NAME || process.env.PGDATABASE || "nexusretail",
});

module.exports = pool;
