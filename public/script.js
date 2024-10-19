function fetchBooks() {
    fetch('/api/books')
        .then(response => response.json())
        .then(books => {
            const bookGrid = document.getElementById('bookGrid');
            bookGrid.innerHTML = '';
            books.forEach(book => {
                const bookItem = document.createElement('div');
                bookItem.className = 'book-item';
                bookItem.innerHTML = `
                    <div class="book-image-container">
                        <img src="${book.image}" alt="${book.title}" onclick="window.location.href='${book.downloadLink}'">
                    </div>
                    <p>${book.title}</p>
                `;
                bookGrid.appendChild(bookItem);
            });
        })
        .catch(error => console.error('Error fetching books:', error));
}

function fetchComments() {
    fetch('/api/comments')
        .then(response => response.json())
        .then(comments => {
            const commentList = document.getElementById('commentList');
            commentList.innerHTML = '';
            comments.forEach(comment => {
                const commentDiv = document.createElement('div');
                commentDiv.className = 'comment';
                commentDiv.innerHTML = `
                    <strong>${comment.name}:</strong>
                    <p>${comment.text}</p>
                `;
                commentList.appendChild(commentDiv);
            });
        })
        .catch(error => console.error('Error fetching comments:', error));
}

document.getElementById('commentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('commentName').value;
    const text = document.getElementById('commentText').value;
    fetch('/api/comments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, text }),
    })
    .then(response => response.json())
    .then(() => {
        fetchComments();
        document.getElementById('commentName').value = '';
        document.getElementById('commentText').value = '';
    })
    .catch(error => console.error('Error adding comment:', error));
});

fetchBooks();
fetchComments();