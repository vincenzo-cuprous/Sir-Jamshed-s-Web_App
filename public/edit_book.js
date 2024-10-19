const loginForm = document.getElementById('loginForm');
const loginSection = document.getElementById('loginSection');
const editSection = document.getElementById('editSection');
const addEditBookButton = document.getElementById('addEditBook');
const uploadBookContentButton = document.getElementById('uploadBookContent');
const addEditCommentButton = document.getElementById('addEditComment');
const changePasswordButton = document.getElementById('changePassword');
const titleInput = document.getElementById('bookTitle');
const imageInput = document.getElementById('bookImage');
const imageUploadInput = document.getElementById('bookImageUpload');
const downloadInput = document.getElementById('bookDownload');
const pdfUploadInput = document.getElementById('bookPdfUpload');
const bookContentInput = document.getElementById('bookContent');
const commentNameInput = document.getElementById('commentName');
const commentTextInput = document.getElementById('commentText');
const commentReplyInput = document.getElementById('commentReply');
const bookList = document.getElementById('bookList');
const commentList = document.getElementById('commentList');

let books = [];
let comments = [];
let editingBookIndex = -1;
let editingCommentIndex = -1;

// Authentication
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loginSection.style.display = 'none';
            editSection.style.display = 'block';
            fetchBooks();
            fetchComments();
        } else {
            alert('Invalid credentials');
        }
    })
    .catch(error => console.error('Error logging in:', error));
});

// Change Password
changePasswordButton.addEventListener('click', function() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        alert('New passwords do not match');
        return;
    }

    fetch('/api/change-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Password changed successfully');
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        } else {
            alert('Failed to change password');
        }
    })
    .catch(error => console.error('Error changing password:', error));
});

function fetchBooks() {
    fetch('/api/books')
        .then(response => response.json())
        .then(data => {
            books = data;
            renderBooks();
        })
        .catch(error => console.error('Error fetching books:', error));
}

function renderBooks() {
    bookList.innerHTML = '';
    books.forEach((book, index) => {
        const li = document.createElement('li');
        li.className = 'book-item';
        li.innerHTML = `
            <p><strong>${book.title}</strong></p>
            <p>Image: ${book.image}</p>
            <p>Download: ${book.downloadLink}</p>
            <button onclick="editBook(${index})">Edit</button>
            <button onclick="deleteBook(${index})">Delete</button>
            <button onclick="previewBook(${index})">Preview</button>
        `;
        bookList.appendChild(li);
    });
}

addEditBookButton.addEventListener('click', function() {
    const title = titleInput.value;
    const image = imageInput.value;
    const downloadLink = downloadInput.value;
    const content = bookContentInput.value;

    if (title && image && downloadLink) {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('image', image);
        formData.append('downloadLink', downloadLink);
        formData.append('content', content);

        if (imageUploadInput.files.length > 0) {
            formData.append('imageFile', imageUploadInput.files[0]);
        }

        if (pdfUploadInput.files.length > 0) {
            formData.append('pdfFile', pdfUploadInput.files[0]);
        }

        const url = editingBookIndex === -1 ? '/api/books' : `/api/books/${editingBookIndex}`;
        const method = editingBookIndex === -1 ? 'POST' : 'PUT';

        fetch(url, {
            method: method,
            body: formData,
        })
        .then(response => response.json())
        .then(() => {
            fetchBooks();
            resetBookForm();
        })
        .catch(error => console.error('Error adding/updating book:', error));
    } else {
        alert('Please fill in all book fields');
    }
});

uploadBookContentButton.addEventListener('click', function() {
    if (editingBookIndex === -1) {
        alert('Please select a book to update its content');
        return;
    }

    const content = bookContentInput.value;

    fetch(`/api/books/${editingBookIndex}/content`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
    })
    .then(response => response.json())
    .then(() => {
        alert('Book content updated successfully');
        resetBookForm();
    })
    .catch(error => console.error('Error updating book content:', error));
});

function editBook(index) {
    const book = books[index];
    titleInput.value = book.title;
    imageInput.value = book.image;
    downloadInput.value = book.downloadLink;
    bookContentInput.value = book.content || '';
    editingBookIndex = index;
    addEditBookButton.textContent = 'Update Book';
}

function deleteBook(index) {
    if (confirm('Are you sure you want to delete this book?')) {
        fetch(`/api/books/${index}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(() => {
            fetchBooks();
        })
        .catch(error => console.error('Error deleting book:', error));
    }
}

function previewBook(index) {
    window.location.href = `preview_book.html?id=${index}`;
}

function resetBookForm() {
    titleInput.value = '';
    imageInput.value = '';
    downloadInput.value = '';
    bookContentInput.value = '';
    imageUploadInput.value = '';
    pdfUploadInput.value = '';
    editingBookIndex = -1;
    addEditBookButton.textContent = 'Add Book';
}

function fetchComments() {
    fetch('/api/comments')
        .then(response => response.json())
        .then(data => {
            comments = data;
            renderComments();
        })
        .catch(error => console.error('Error fetching comments:', error));
}

function renderComments() {
    commentList.innerHTML = '';
    comments.forEach((comment, index) => {
        const li = document.createElement('li');
        li.className = 'comment-item';
        li.innerHTML = `
            <p><strong>${comment.name}:</strong> ${comment.text}</p>
            ${comment.reply ? `<p><em>Reply:</em> ${comment.reply}</p>` : ''}
            <button onclick="editComment(${index})">Edit</button>
            <button onclick="deleteComment(${index})">Delete</button>
        `;
        commentList.appendChild(li);
    });
}

addEditCommentButton.addEventListener('click', function() {
    const name = commentNameInput.value;
    const text = commentTextInput.value;
    const reply = commentReplyInput.value;

    if (name && text) {
        const comment = { name, text, reply };
        if (editingCommentIndex === -1) {
            // Add new comment
            fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(comment),
            })
            .then(response => response.json())
            .then(() =>    {
                fetchComments();
                resetCommentForm();
            })
            .catch(error => console.error('Error adding comment:', error));
        } else {
            // Edit existing comment
            fetch(`/api/comments/${editingCommentIndex}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(comment),
            })
            .then(response => response.json())
            .then(() => {
                fetchComments();
                resetCommentForm();
            })
            .catch(error => console.error('Error updating comment:', error));
        }
    } else {
        alert('Please fill in name and comment fields');
    }
});

function editComment(index) {
    const comment = comments[index];
    commentNameInput.value = comment.name;
    commentTextInput.value = comment.text;
    commentReplyInput.value = comment.reply || '';
    editingCommentIndex = index;
    addEditCommentButton.textContent = 'Update Comment';
}

function deleteComment(index) {
    if (confirm('Are you sure you want to delete this comment?')) {
        fetch(`/api/comments/${index}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(() => {
            fetchComments();
        })
        .catch(error => console.error('Error deleting comment:', error));
    }
}

function resetCommentForm() {
    commentNameInput.value = '';
    commentTextInput.value = '';
    commentReplyInput.value = '';
    editingCommentIndex = -1;
    addEditCommentButton.textContent = 'Add Comment';
}