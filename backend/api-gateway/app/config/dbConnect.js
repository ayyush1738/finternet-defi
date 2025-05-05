const { Pool } = require("pg");
import 'dotenv/config';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
  

pool.connect((err, client, release) => {
  if (err) {
    return console.error("Connection error", err.stack);
  }
  console.log("Connected to the PostgreSQL database.");

  const createTables = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('user', 'admin')) NOT NULL DEFAULT 'user',
    );
  `;

  client.query(createTables, (err) => {
    release(); // always release the client back to the pool
    if (err) {
      console.error("Error creating tables:", err.stack);
    } else {
      console.log("Tables created or already exist.");
    }
  });
});

module.exports = pool;
