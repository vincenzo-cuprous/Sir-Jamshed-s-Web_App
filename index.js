const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 8888;

app.use(bodyParser.json());
app.use(express.static('public'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

const dataFile = 'data.json';

let books = [];
let comments = [];
let adminCredentials = {
    username: 'jamshed',
    password: 'qw4HD123!@#'
};

// Load data from file
function loadData() {
    try {
        const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
        books = data.books;
        comments = data.comments;
        adminCredentials = data.adminCredentials;
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Save data to file
function saveData() {
    const data = {
        books: books,
        comments: comments,
        adminCredentials: adminCredentials
    };
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// Load initial data
loadData();

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === adminCredentials.username && password === adminCredentials.password) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.post('/api/change-password', (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (currentPassword === adminCredentials.password) {
        adminCredentials.password = newPassword;
        saveData();
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.get('/api/books', (req, res) => {
    res.json(books);
});

app.get('/api/books/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (id >= 0 && id < books.length) {
        res.json(books[id]);
    } else {
        res.status(404).json({ error: 'Book not found' });
    }
});

app.post('/api/books', upload.fields([{ name: 'imageFile', maxCount: 1 }, { name: 'pdfFile', maxCount: 1 }]), (req, res) => {
    const { title, image, downloadLink, content } = req.body;
    let newBook = { title, image, downloadLink, content };

    if (req.files['imageFile']) {
        newBook.image = '/uploads/' + req.files['imageFile'][0].filename;
    }
    if (req.files['pdfFile']) {
        newBook.downloadLink = '/uploads/' + req.files['pdfFile'][0].filename;
    }

    books.push(newBook);
    saveData();
    res.json(newBook);
});

app.put('/api/books/:index', upload.fields([{ name: 'imageFile', maxCount: 1 }, { name: 'pdfFile', maxCount: 1 }]), (req, res) => {
    const index = parseInt(req.params.index);
    const { title, image, downloadLink, content } = req.body;
    let updatedBook = { title, image, downloadLink, content };

    if (req.files['imageFile']) {
        updatedBook.image = '/uploads/' + req.files['imageFile'][0].filename;
    }
    if (req.files['pdfFile']) {
        updatedBook.downloadLink = '/uploads/' + req.files['pdfFile'][0].filename;
    }

    if (index >= 0 && index < books.length) {
        books[index] = updatedBook;
        saveData();
        res.json(updatedBook);
    } else {
        res.status(404).json({ error: 'Book not found' });
    }
});

app.put('/api/books/:index/content', (req, res) => {
    const index = parseInt(req.params.index);
    const { content } = req.body;

    if (index >= 0 && index < books.length) {
        books[index].content = content;
        saveData();
        res.json(books[index]);
    } else {
        res.status(404).json({ error: 'Book not found' });
    }
});

app.delete('/api/books/:index', (req, res) => {
    const index = parseInt(req.params.index);
    if (index >= 0 && index < books.length) {
        const deletedBook = books.splice(index, 1)[0];
        saveData();
        res.json(deletedBook);
    } else {
        res.status(404).json({ error: 'Book not found' });
    }
});

app.get('/api/comments', (req, res) => {
    res.json(comments);
});

app.post('/api/comments', (req, res) => {
    const newComment = req.body;
    comments.unshift(newComment);
    saveData();
    res.json(newComment);
});

app.put('/api/comments/:index', (req, res) => {
    const index = parseInt(req.params.index);
    const updatedComment = req.body;
    if (index >= 0 && index < comments.length) {
        comments[index] = updatedComment;
        saveData();
        res.json(updatedComment);
    } else {
        res.status(404).json({ error: 'Comment not found' });
    }
});

app.delete('/api/comments/:index', (req, res) => {
    const index = parseInt(req.params.index);
    if (index >= 0 && index < comments.length) {
        const deletedComment = comments.splice(index, 1)[0];
        saveData();
        res.json(deletedComment);
    } else {
        res.status(404).json({ error: 'Comment not found' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

