const express = require('express');
const router = express.Router();
const db = require('../db');

// GET ALL TRANSACTIONS
router.get('/', (req, res) => {
  const sql = `
    SELECT 
      transactions.*,
      books.title AS book_title,
      users.name AS user_name
    FROM transactions
    JOIN books ON transactions.book_id = books.id
    JOIN users ON transactions.user_id = users.id
    ORDER BY transactions.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ADD TRANSACTION
router.post('/', (req, res) => {
  const { book_id, user_id, type, quantity } = req.body;

  if (!book_id || !user_id || !type || !quantity || quantity < 1) {
    return res.status(400).json({ error: 'Please provide valid transaction details.' });
  }

  if (!['Borrow', 'Return', 'Add Stock'].includes(type)) {
  return res.status(400).json({ error: 'Invalid transaction type.' });
}

  db.beginTransaction(err => {
    if (err) return res.status(500).json({ error: err.message });

    db.query(
      'SELECT quantity FROM books WHERE id = ? FOR UPDATE',
      [book_id],
      (err, results) => {
        if (err || results.length === 0) {
          return db.rollback(() => {
            res.status(400).json({ error: 'Book not found.' });
          });
        }

        const currentStock = results[0].quantity;

        if (type === 'Borrow' && currentStock < quantity) {
          return db.rollback(() => {
            res.status(400).json({ error: 'Not enough copies available.' });
          });
        }

        const newStock = type === 'Borrow'
          ? currentStock - Number(quantity)
          : currentStock + Number(quantity);

        db.query(
          'UPDATE books SET quantity = ? WHERE id = ?',
          [newStock, book_id],
          err => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ error: err.message });
              });
            }

            db.query(
              `INSERT INTO transactions (book_id, user_id, type, quantity)
               VALUES (?, ?, ?, ?)`,
              [book_id, user_id, type, quantity],
              (err, result) => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).json({ error: err.message });
                  });
                }

                db.commit(err => {
                  if (err) {
                    return db.rollback(() => {
                      res.status(500).json({ error: err.message });
                    });
                  }

                  res.status(201).json({
                    message: 'Transaction recorded successfully.',
                    id: result.insertId,
                    newStock
                  });
                });
              }
            );
          }
        );
      }
    );
  });
});

module.exports = router;