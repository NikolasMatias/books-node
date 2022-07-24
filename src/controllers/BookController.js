import AbstractController from "../core/controllers/AbstractController.js";
import books from '../mocks/books.json';

export default class BookController extends AbstractController
{
    constructor() {
        super(true);
    }

    index() {
        return books;
    }
}