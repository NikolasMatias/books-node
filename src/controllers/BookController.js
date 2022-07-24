import AbstractController from "../core/controllers/AbstractController.js";
import books from '../mocks/books.json' assert {type: "json"};

export default class BookController extends AbstractController
{
    constructor() {
        super(true);
    }

    index(request) {
        const search = request.get('search');

        if (search) {
            return books.filter(book => book.title.toLowerCase().includes(search.toLowerCase()));
        }

        return books;
    }
}