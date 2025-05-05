import { Pool } from 'pg';
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
      email TEXT UNIQUE,
      password TEXT NOT NULL,
      wallet_address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      role TEXT CHECK(role IN ('SME', 'investor', 'buyer')) NOT NULL DEFAULT 'SME'
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

export default pool;
