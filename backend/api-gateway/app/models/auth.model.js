import bcrypt from 'bcrypt';
import db from '../config/dbConnect.js';

// Login User
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

// Register User
export const registerUser = async (username, password, role, callback) => {
    try {
        if (!username || !password) return callback("Missing username or password", null);
        if (password.length < 12) return callback("Password must be at least 12 characters long", null);

        const hashedPassword = await bcrypt.hash(password, 12);
        await db.query(
            "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)",
            [username, hashedPassword, role || "SME"]
        );

        return callback(null, "User registered successfully");
    } catch (err) {
        return callback(err.message, null);
    }
};
