const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
//app.use(cors());
app.use(
  cors({
    origin: 'http://blockchain.onlineai.vn',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // nếu có sử dụng cookies/token
  }),
);
const authRoutes = require('./routes/authRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', './views');
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
module.exports = app;
