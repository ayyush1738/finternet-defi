// dbConnect.js
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
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            wallet_address TEXT UNIQUE NOT NULL,
            role TEXT CHECK(role IN ('investor', 'enterprise', 'buyer')) NOT NULL DEFAULT 'investor'
        );
    `;

    client.query(createTables, (err) => {
        release();
        if (err) {
            console.error("Error creating tables:", err.stack);
        } else {
            console.log("Tables created or already exist.");
        }
    });
});

export default pool;
