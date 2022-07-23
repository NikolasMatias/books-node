import RouteManagement from '../core/routes/RouteManagement.js';

export default function api() {
    const routes = new RouteManagement();

    routes.getJson('/api/pessoas', () => [{id: 1, nome: 'José'}]);

    return routes;
};