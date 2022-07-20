import Server from './src/routes/Server.js'
import Route from "./src/routes/Route.js";

const routes = new Route();

routes.get('/', 'HTML', () => '/src/views/Home.html');

const server = new Server(routes);
server.listen();