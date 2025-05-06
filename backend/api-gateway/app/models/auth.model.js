import bcrypt from 'bcrypt';
import db from '../config/dbConnect.js';

export const loginUser = async (username, password, callback) => {
    try {
        const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        const user = result.rows[0];

        if (!user) return callback("User not found", null);

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return callback("Invalid credentials", null);

        return callback(null, { id: user.id, username: user.username, role: user.role });
    } catch (err) {
        return callback(err.message, null);
    }
};

export const registerUser = async (username, email, password, role, wallet_address, callback) => {
    try {
        if (!username || !password || !email) return callback("Missing username, email, or password", null);
        if (password.length < 12) return callback("Password must be at least 12 characters long", null);

        // ✅ Optional: Wallet validation (if needed later)
        // if (wallet_address && !/^0x[a-fA-F0-9]{40}$/.test(wallet_address)) {
        //     return callback("Invalid wallet address format", null);
        // }

        const hashedPassword = await bcrypt.hash(password, 12);
        await db.query(
            "INSERT INTO users (username, email, password, role, wallet_address) VALUES ($1, $2, $3, $4, $5)",
            [username, email, hashedPassword, role || "SME", wallet_address || null]
        );

        return callback(null, "User registered successfully");
    } catch (err) {
        return callback(err.message, null);
    }
};
