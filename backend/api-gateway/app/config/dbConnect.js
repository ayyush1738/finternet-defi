import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.connect((err, client, release) => {
    if (err) {
        console.error("Connection error", err.stack);
        return;
    }
    console.log("Connected to the PostgreSQL database.");

    const createTables = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            wallet_address TEXT UNIQUE NOT NULL,
            role TEXT CHECK(role IN ('investor', 'enterprise')) NOT NULL DEFAULT 'investor'
        );

        CREATE TABLE IF NOT EXISTS invoices (
            id SERIAL PRIMARY KEY,
            cid TEXT NOT NULL,
            tx_sig TEXT NOT NULL,
            amount FLOAT NOT NULL,
            creator TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
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
