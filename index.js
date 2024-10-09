import express from 'express';
import cors from 'cors';  // Import CORS middleware
import bodyParser from 'body-parser';
import userRouter from './api/user.js';
import productRouter from './api/product.js';
import configuration from './api/configuration.js';
import order from './api/order.js';
import auth from './Authentication/auth.js';



const app = express();

// const authServer = require('./authServer.js');


// Use CORS middleware
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Middleware to serve uploaded files as static assets
app.use('/uploads', express.static('uploads'));

// app.use('auth', authServer);
app.use('/api/users', userRouter);
app.use('/api/auth', auth);
app.use('/api/product',productRouter);
app.use('/api/configuration',configuration)
app.use('/api/order',order)


app.listen(4000, () => {
    console.log('Server started on port 4000');
});
