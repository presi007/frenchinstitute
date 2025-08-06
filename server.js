// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = 3001;
const cors = require('cors');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Serve static files (for local dev, if needed)
app.use(express.static(path.join(__dirname)));

// SQLite setup
const db = new sqlite3.Database('./students.db', (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

db.run(`CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  courseLevel TEXT NOT NULL,
  preferredTime TEXT NOT NULL,
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// API endpoint to receive enrollment data
app.post('/api/enroll', (req, res) => {
  const { firstName, lastName, email, phone, courseLevel, preferredTime, message } = req.body;
  if (!firstName || !lastName || !email || !phone || !courseLevel || !preferredTime) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const stmt = db.prepare(`INSERT INTO students (firstName, lastName, email, phone, courseLevel, preferredTime, message) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  stmt.run(firstName, lastName, email, phone, courseLevel, preferredTime, message || '', function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, id: this.lastID });
  });
  stmt.finalize();
});

// API endpoint to get all students
app.get('/api/students', (req, res) => {
  db.all(`SELECT * FROM students ORDER BY created_at DESC`, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ students: rows });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});