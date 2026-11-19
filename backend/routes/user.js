const express = require('express');
const router = express.Router();
const db = require('../db');

// GET ALL USERS
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM users ORDER BY id DESC';

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
});

// ADD NEW USER
router.post('/', (req, res) => {
  const { name, membership_id, role } = req.body;

  const sql = `
    INSERT INTO users (name, membership_id, role)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [name, membership_id, role], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
      message: 'User registered successfully',
      id: result.insertId
    });
  });
});

// UPDATE USER
router.put('/:id', (req, res) => {
  const { name, membership_id, role } = req.body;
  const { id } = req.params;

  const sql = `
    UPDATE users
    SET name = ?, membership_id = ?, role = ?
    WHERE id = ?
  `;

  db.query(sql, [name, membership_id, role, id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ message: 'User updated successfully' });
  });
});

// DELETE USER
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ message: 'User deleted successfully' });
  });
});

module.exports = router;