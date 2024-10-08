require('dotenv').config();

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const {process_params} = require("express/lib/router");

app.use(express.json())

const posts = [
    {
        email: "amilsrinath5@gmail.com",
        title: "Post 1",
    },
    {
        email: "srinath@example.com",
        title: "Post 2",
    }
];

app.get('/posts', authenticateToken, (req, res) => {
    res.json(posts.filter(post => post.email === req.user.email));
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.listen(2000, () => {
    console.log("Posts service running on port 2000");
});