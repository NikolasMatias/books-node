import RouteManagement from '../core/routes/RouteManagement.js';

export default function web() {
    const routes = new RouteManagement();

    routes.getView('/', () => '/src/views/Home.html');

    return routes;
};