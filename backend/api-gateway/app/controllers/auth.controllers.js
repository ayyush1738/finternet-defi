import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { loginUser, registerUser } from '../models/auth.model.js';

const JWT_SECRET = process.env.JWT_SECRET;

export const register = (req, res) => {

    const { username, email, password, role, wallet_address } = req.body;

    registerUser(username, email, password, role, wallet_address, (err) => {
        if (err) return res.status(400).send("Error: " + (err.message || err));
        res.send("Registration successful.");
    });
};

export const login = (req, res) => {
    const { username, password } = req.body;

    loginUser(username, password, (err, user) => {
        if (err) return res.status(400).json({ message: err });

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: "6h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            path: "/",
            maxAge: 6 * 60 * 60 * 1000, 
        });

        console.log("Token Set Successfully:", token);
        res.json({ message: "Login successful", user });
    });
};

export const logout = (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logout successful" });
};

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
