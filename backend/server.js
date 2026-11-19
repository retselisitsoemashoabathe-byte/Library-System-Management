const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');
const booksRouter = require('./routes/books');
const usersRouter = require('./routes/user');
const transactionsRouter = require('./routes/transactions');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
// API Routes
app.use('/api/books', booksRouter);
app.use('/api/users', usersRouter);
app.use('/api/transactions', transactionsRouter);

// Test route
app.get('/', (req, res) => {
    res.send('Library Management System API is running!');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});