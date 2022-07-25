let controller = new AbortController();
let booksPromise = null;
let booksTimeout = null;
let books = [];

getBooks(null);

async function getBooks(search) {
    let url = '/api/books';

    if (typeof search === 'string' && search.length > 0) {
        const queryString = '?' + new URLSearchParams({search}).toString();
        url = url.concat(queryString);
    }

    booksPromise = fetch(url, {signal: controller.signal}).then(response => response.json());
    books = await booksPromise;
    createDivBooks();
}

function createDivBooks() {
    const listOfBooks = document.querySelector('.list-of-books');

    listOfBooks.innerHTML = ''

    handleMessages();

    for (const book of books) {
        const bookDiv = document.createElement('div');
        bookDiv.classList.add('book');

        const bookTitle = document.createElement('div');
        const bookTitleText = document.createElement('h3');
        bookTitle.classList.add('book-title');
        bookTitleText.innerHTML = book.title;
        bookTitle.appendChild(bookTitleText);

        const bookDivImage = document.createElement('div');
        const bookImage = document.createElement('img');
        bookDivImage.classList.add('book-image');
        bookImage.alt = book.title;
        bookImage.src = book.imageUrl || 'https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781534439122/cape-9781534439122_hr.jpg';
        bookDivImage.appendChild(bookImage);

        bookDiv.appendChild(bookTitle);
        bookDiv.appendChild(bookDivImage);
        listOfBooks.appendChild(bookDiv);
    }
    booksPromise = null;
}

function handleMessages() {
    const messages = document.querySelector('.messages');

    messages.innerHTML = '';
    const messageDiv = document.createElement('div');
    const messageText = document.createElement('h3');
    messageDiv.classList.add('empty-list');
    messageDiv.appendChild(messageText);
    messages.appendChild(messageDiv);

    if (books.length === 0) messageText.innerHTML = "There's no book by the search given";

    if (booksTimeout !== null) messageText.innerHTML = "Loading books...";

    if (books.length > 0) messages.innerHTML = '';
}

function handleSearch(event) {
    const search = event.currentTarget.value;
    if (booksTimeout !== null) clearTimeout(booksTimeout);

    booksTimeout = setTimeout(() => {
        getBooks(search)
        booksTimeout = null;
    }, 500);

    handleMessages();
}
