// Toggle navigation menu
document.querySelector('.nav-toggle').addEventListener('click', function () {
    document.querySelector('nav ul').classList.toggle('show');
});

// Handle comment submission
document.getElementById('commentForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const commentText = document.getElementById('commentText').value;

    const comment = document.createElement('div');
    comment.className = 'comment';
    comment.innerHTML = `<strong>${name}:</strong> ${commentText}`;

    document.getElementById('comments').prepend(comment);

    // Clear the form
    document.getElementById('name').value = '';
    document.getElementById('commentText').value = '';
});

// Smooth scroll to top
document.getElementById('returnButton').addEventListener('click', function () {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});