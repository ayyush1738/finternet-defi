// auth.controller.js
import crypto from 'crypto';
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';  // ✅ added
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { findUserByWallet, updateUserProfile } from '../models/auth.model.js';
import db from '../config/dbConnect.js';

const JWT_SECRET = process.env.JWT_SECRET;
const nonces = new Map();

export const login = async (req, res) => {
    const { wallet_address, signature, nonce } = req.body;
    const storedNonce = nonces.get(wallet_address);

    if (!storedNonce || storedNonce !== nonce) {
        return res.status(400).json({ message: 'Invalid or expired nonce' });
    }

    try {
        const pubKey = new PublicKey(wallet_address);
        const messageBytes = new TextEncoder().encode(nonce);
        const sigBytes = signature.data ? Uint8Array.from(signature.data) : Uint8Array.from(signature);

        const isValid = nacl.sign.detached.verify(messageBytes, sigBytes, pubKey.toBytes());
        if (!isValid) return res.status(401).json({ message: 'Invalid signature' });

        findUserByWallet(wallet_address, async (err, user) => {
            if (err && err !== 'User not found') return res.status(400).json({ message: err });

            if (!user) {
                // Auto-create user as investor
                await db.query(
                    "INSERT INTO users (wallet_address, role) VALUES ($1, $2)",
                    [wallet_address, 'investor']
                );
                user = { wallet_address, role: 'investor' };
                console.log(`Auto-registered new wallet: ${wallet_address}`);
            }

            const token = jwt.sign(
                { wallet_address: wallet_address, role: user.role },
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

            nonces.delete(wallet_address);

            res.json({ message: "Login successful", token, role: user.role });
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Signature verification failed' });
    }
};

export const enterpriseLogin = async (req, res) => {
    const { wallet_address, signature, nonce, username } = req.body;
    const storedNonce = nonces.get(wallet_address);

    if (!storedNonce || storedNonce !== nonce) {
        return res.status(400).json({ message: 'Invalid or expired nonce' });
    }

    try {
        const pubKey = new PublicKey(wallet_address);
        const messageBytes = new TextEncoder().encode(nonce);
        const sigBytes = signature.data ? Uint8Array.from(signature.data) : Uint8Array.from(signature);

        const isValid = nacl.sign.detached.verify(messageBytes, sigBytes, pubKey.toBytes());
        if (!isValid) return res.status(401).json({ message: 'Invalid signature' });

        findUserByWallet(wallet_address, async (err, user) => {
            if (err && err !== 'User not found') return res.status(400).json({ message: err });

            if (!user) {
                if (!username) {
                    return res.status(400).json({ message: 'Organization name (username) is required' });
                }

                // Auto-create user as enterprise with username
                await db.query(
                    "INSERT INTO users (wallet_address, role, username) VALUES ($1, $2, $3)",
                    [wallet_address, 'enterprise', username]
                );
                user = { wallet_address, role: 'enterprise', username };
                console.log(`Auto-registered enterprise: ${username} (${wallet_address})`);
            } else {
                // ❗ Username check for existing user
                if (user.role !== 'enterprise') {
                    return res.status(403).json({ message: 'Access denied: Not an enterprise user' });
                }

                if (user.username !== username) {
                    return res.status(403).json({ message: 'Access denied: Wrong username' });
                }
            }

            const token = jwt.sign(
                { wallet_address: wallet_address, role: user.role },
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

            nonces.delete(wallet_address);

            res.json({ message: "Login successful", token, role: user.role });
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Signature verification failed' });
    }
};



// Generates nonce per wallet
export const getNonce = (req, res) => {
    const { wallet_address } = req.query;
    if (!wallet_address) return res.status(400).json({ message: 'Missing wallet_address' });

    const nonce = crypto.randomBytes(16).toString('hex');
    nonces.set(wallet_address, nonce);
    res.json({ nonce });
};

// export const register = (req, res) => {
//     const { wallet_address, username, email, role } = req.body;
//     if (!wallet_address || !role) return res.status(400).json({ message: 'wallet_address and role required' });

//     updateUserProfile(wallet_address, username, email, role, (err, result) => {
//         if (err) return res.status(400).json({ message: err });
//         res.json({ message: result });
//     });
// };
