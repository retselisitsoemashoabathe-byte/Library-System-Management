const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all books
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM books ORDER BY id DESC';

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(results);
    });
});

// ADD a new book
router.post('/', (req, res) => {
    const { title, author, genre, isbn, quantity } = req.body;

    const sql = `
        INSERT INTO books (title, author, genre, isbn, quantity)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [title, author, genre, isbn, quantity], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            message: 'Book added successfully',
            id: result.insertId
        });
    });
});

// UPDATE a book
router.put('/:id', (req, res) => {
    const { title, author, genre, isbn, quantity } = req.body;
    const { id } = req.params;

    const sql = `
        UPDATE books
        SET title = ?, author = ?, genre = ?, isbn = ?, quantity = ?
        WHERE id = ?
    `;

    db.query(sql, [title, author, genre, isbn, quantity, id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({ message: 'Book updated successfully' });
    });
});

// DELETE a book
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM books WHERE id = ?', [id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({ message: 'Book deleted successfully' });
    });
});

module.exports = router;