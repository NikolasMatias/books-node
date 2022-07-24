import RouteManagement from '../core/routes/RouteManagement.js';

export default function web() {
    const routes = new RouteManagement();

    routes.getView('/', () => '/src/views/Books.html');
    routes.getView('/books', () => '/src/views/Books.html');

    return routes;
};