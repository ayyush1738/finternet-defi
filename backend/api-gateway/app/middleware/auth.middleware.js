import jwt from 'jsonwebtoken';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    console.log("Incoming Auth Request Headers:", req.headers);

    const token =
    req.cookies?.token ||
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
}

jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
        return res.status(403).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
});

};

export default authMiddleware;
