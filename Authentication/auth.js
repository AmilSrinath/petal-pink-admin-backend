import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../utils/db.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
let refreshTokens = [];

// Function to generate access token
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' });
}

// Function to generate refresh token
function generateRefreshToken(user) {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    try {
        const query = 'SELECT * FROM petal_pink_user_tb WHERE email = ? AND password = ? AND visible = ?';
        const values = [email, password, 1];

        const [results] = await pool.query(query, values);

        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const user = results[0];

        const userPayload = { email: user.email };
        const accessToken = generateAccessToken(userPayload);
        const refreshToken = generateRefreshToken(userPayload);

        refreshTokens.push(refreshToken);

        res.json({ accessToken, refreshToken });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'An error occurred during login.' });
    }
});

// Token route
router.post('/token', (req, res) => {
    const { token: refreshToken } = req.body;

    if (!refreshToken) return res.status(401).json({ error: "Refresh token required." });
    if (!refreshTokens.includes(refreshToken)) return res.status(403).json({ error: "Invalid refresh token." });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid or expired refresh token." });

        const userPayload = { email: user.email };
        const accessToken = generateAccessToken(userPayload);

        res.json({ accessToken });
    });
});

// Logout route
router.delete('/logout', (req, res) => {
    const { token: refreshToken } = req.body;

    if (!refreshToken) return res.status(400).json({ error: "Refresh token required." });
    refreshTokens = refreshTokens.filter(token => token !== refreshToken);

    res.sendStatus(204);
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ error: "Access token required." });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid or expired access token." });
        req.user = user;
        next();
    });
}

// Protected Route Example
router.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: `Hello, ${req.user.email}! This is a protected route.` });
});

export default router;