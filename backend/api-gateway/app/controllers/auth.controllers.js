import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { loginUser, registerUser } from '../models/auth.model.js';

const JWT_SECRET = process.env.JWT_SECRET;

// Register
export const register = (req, res) => {
    const { username, password, role } = req.body;
    registerUser(username, password, role, (err) => {
        if (err) return res.status(400).send("Error: " + (err.message || err));
        res.send("Registration successful.");
    });
};

// Login
export const login = (req, res) => {
    const { username, password } = req.body;

    loginUser(username, password, (err, user) => {
        if (err) return res.status(400).json({ message: err });

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: "6h" }
        );

        res.setHeader("Access-Control-Expose-Headers", "Set-Cookie");
        res.cookie("token", token, {
            httpOnly: false,  // Set to true in production
            secure: false,    // Set to true in production (HTTPS)
            sameSite: "Lax",
            path: "/",
            maxAge: 6 * 60 * 60 * 1000, // 6 hours
        });

        console.log("Token Set Successfully:", token);
        res.json({ message: "Login successful", user });
    });
};

// Logout
export const logout = (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logout successful" });
};

// Check Role
export const checkRole = (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }

        res.json({ role: decoded.role });
    });
};
