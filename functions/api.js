const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Initialize data from environment variable or use default
let data = process.env.SITE_DATA ? JSON.parse(process.env.SITE_DATA) : {
  books: [
    {
      title: "The Quran",
      image: "https://i.ytimg.com/vi/tVlcKp3bWH8/maxresdefault.jpg",
      downloadLink: "https://drive.google.com/file/d/1OpELNgClnL4gOex0aEsr3SILfCur_TH9/view?usp=drive_link",
      content: "The Holy Quran"
    },
    {
      title: "Sahih Al-Bukhari",
      image: "https://i.ytimg.com/vi/tVlcKp3bWH8/maxresdefault.jpg",
      downloadLink: "https://drive.google.com/file/d/1OpELNgClnL4gOex0aEsr3SILfCur_TH9/view?usp=drive_link",
      content: "Hadith collection by Imam Bukhari"
    }
  ],
  comments: [],
  adminCredentials: {
    username: 'jamshed',
    password: 'qw4HD123!@#'
  }
};

// Function to update the environment variable
function updateEnvironmentVariable() {
  process.env.SITE_DATA = JSON.stringify(data);
  // In a real-world scenario, you would update the environment variable on Netlify here
  // This might involve making an API call to Netlify to update the variable
  console.log('Environment variable updated');
}

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === data.adminCredentials.username && password === data.adminCredentials.password) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.post('/api/change-password', (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (currentPassword === data.adminCredentials.password) {
        data.adminCredentials.password = newPassword;
        updateEnvironmentVariable();
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.get('/api/books', (req, res) => {
    res.json(data.books);
});

app.get('/api/books/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (id >= 0 && id < data.books.length) {
        res.json(data.books[id]);
    } else {
        res.status(404).json({ error: 'Book not found' });
    }
});

app.post('/api/books', (req, res) => {
    const { title, image, downloadLink, content } = req.body;
    let newBook = { title, image, downloadLink, content };
    data.books.push(newBook);
    updateEnvironmentVariable();
    res.json(newBook);
});

app.put('/api/books/:index', (req, res) => {
    const index = parseInt(req.params.index);
    const { title, image, downloadLink, content } = req.body;
    let updatedBook = { title, image, downloadLink, content };

    if (index >= 0 && index < data.books.length) {
        data.books[index] = updatedBook;
        updateEnvironmentVariable();
        res.json(updatedBook);
    } else {
        res.status(404).json({ error: 'Book not found' });
    }
});

app.put('/api/books/:index/content', (req, res) => {
    const index = parseInt(req.params.index);
    const { content } = req.body;

    if (index >= 0 && index < data.books.length) {
        data.books[index].content = content;
        updateEnvironmentVariable();
        res.json(data.books[index]);
    } else {
        res.status(404).json({ error: 'Book not found' });
    }
});

app.delete('/api/books/:index', (req, res) => {
    const index = parseInt(req.params.index);
    if (index >= 0 && index < data.books.length) {
        const deletedBook = data.books.splice(index, 1)[0];
        updateEnvironmentVariable();
        res.json(deletedBook);
    } else {
        res.status(404).json({ error: 'Book not found' });
    }
});

app.get('/api/comments', (req, res) => {
    res.json(data.comments);
});

app.post('/api/comments', (req, res) => {
    const newComment = req.body;
    data.comments.unshift(newComment);
    updateEnvironmentVariable();
    res.json(newComment);
});

app.put('/api/comments/:index', (req, res) => {
    const index = parseInt(req.params.index);
    const updatedComment = req.body;
    if (index >= 0 && index < data.comments.length) {
        data.comments[index] = updatedComment;
        updateEnvironmentVariable();
        res.json(updatedComment);
    } else {
        res.status(404).json({ error: 'Comment not found' });
    }
});

app.delete('/api/comments/:index', (req, res) => {
    const index = parseInt(req.params.index);
    if (index >= 0 && index < data.comments.length) {
        const deletedComment = data.comments.splice(index, 1)[0];
        updateEnvironmentVariable();
        res.json(deletedComment);
    } else {
        res.status(404).json({ error: 'Comment not found' });
    }
});

module.exports.handler = serverless(app);