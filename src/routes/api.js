import RouteManagement from '../core/routes/RouteManagement.js';
import BookController from "../controllers/BookController.js";

export default function api() {
    const routes = new RouteManagement();

    routes.apiResource('/api/books', (new BookController()));

    return routes;
};