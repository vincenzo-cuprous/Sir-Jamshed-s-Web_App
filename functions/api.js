const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('data.json');
const db = lowdb(adapter);

const app = express();
app.use(bodyParser.json());

// Initialize data
db.defaults({
  books: [],
  comments: [],
  adminCredentials: {
    username: 'jamshed',
    password: 'qw4HD123!@#'
  }
}).write();

// Authentication middleware
const authenticate = (req, res, next) => {
  const { username, password } = req.body;
  if (username === db.get('adminCredentials.username').value() && password === db.get('adminCredentials.password').value()) {
    next();
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

// API Endpoints

// Login
app.post('/api/login', (req, res) => {
  authenticate(req, res, () => {
    res.json({ success: true });
  });
});

// Change password
app.post('/api/change-password', authenticate, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (currentPassword === db.get('adminCredentials.password').value()) {
    db.set('adminCredentials.password', newPassword).write();
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid current password' });
  }
});

// Books
app.get('/api/books', (req, res) => {
  res.json(db.get('books').value());
});

app.get('/api/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const book = db.get('books').find({ id }).value();
  if (!book) {
    res.status(404).json({ error: 'Book not found' });
  } else {
    res.json(book);
  }
});

app.post('/api/books', authenticate, (req, res) => {
  const { title, image, downloadLink, content } = req.body;
  const newBook = { id: db.get('books').size().value() + 1, title, image, downloadLink, content };
  db.get('books').push(newBook).write();
  res.json(newBook);
});

app.put('/api/books/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  const { title, image, downloadLink, content } = req.body;
  const updatedBook = { title, image, downloadLink, content };
  db.get('books').find({ id }).assign(updatedBook).write();
  res.json(updatedBook);
});

app.delete('/api/books/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  db.get('books').remove({ id }).write();
  res.json({ success: true });
});

// Comments
app.get('/api/comments', (req, res) => {
  res.json(db.get('comments').value());
});

app.post('/api/comments', authenticate, (req, res) => {
  const newComment = req.body;
  db.get('comments').push(newComment).write();
  res.json(newComment);
});

app.put('/api/comments/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  const updatedComment = req.body;
  db.get('comments').find({ id }).assign(updatedComment).write();
  res.json(updatedComment);
});

app.delete('/api/comments/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  db.get('comments').remove({ id }).write();
  res.json({ success: true });
});

module.exports.handler = serverless(app);