// // server.js
// require('dotenv').config();

// const express = require('express');
// const app = express();
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
// const users = require('./api/user');

// app.use(express.json());

// let refreshTokens = [];


// function generateAccessToken(user) {
//     return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' }); // Short-lived access token
// }


// function generateRefreshToken(user) {
//     return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' }); // Longer-lived refresh token
// }

// // Login Route
// app.post('/login', async (req, res) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         return res.status(400).json({ error: "Email and password are required." });
//     }


//     const user = users.find(u => u.email === email);
//     if (!user) {
//         return res.status(404).json({ error: "User not found." });
//     }

//     try {

//         const passwordMatch = await bcrypt.compare(password, user.password);
//         if (!passwordMatch) {
//             return res.status(403).json({ error: "Invalid credentials." });
//         }


//         const userPayload = { email: user.email };
//         const accessToken = generateAccessToken(userPayload);
//         const refreshToken = generateRefreshToken(userPayload);


//         refreshTokens.push(refreshToken);

 
//         res.json({ accessToken, refreshToken });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Internal server error." });
//     }
// });

// app.post('/token', (req, res) => {
//     const { token: refreshToken } = req.body;


//     if (!refreshToken) return res.status(401).json({ error: "Refresh token required." });
//     if (!refreshTokens.includes(refreshToken)) return res.status(403).json({ error: "Invalid refresh token." });


//     jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
//         if (err) return res.status(403).json({ error: "Invalid or expired refresh token." });

//         const userPayload = { email: user.email };
//         const accessToken = generateAccessToken(userPayload);

//         res.json({ accessToken });
//     });
// });


// app.delete('/logout', (req, res) => {
//     const { token: refreshToken } = req.body;

//     if (!refreshToken) return res.status(400).json({ error: "Refresh token required." });
//     refreshTokens = refreshTokens.filter(token => token !== refreshToken);

//     res.sendStatus(204);
// });

// // Protected Route Example
// app.get('/protected', authenticateToken, (req, res) => {
//     res.json({ message: `Hello, ${req.user.email}! This is a protected route.` });
// });


// function authenticateToken(req, res, next) {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

//     if (!token) return res.status(401).json({ error: "Access token required." });

//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//         if (err) return res.status(403).json({ error: "Invalid or expired access token." });
//         req.user = user;
//         next();
//     });
// }


// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//     console.log(`Auth service running on port ${PORT}`);
// });

// // app.use('/', authServer);