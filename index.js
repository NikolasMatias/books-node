import Server from './src/core/routes/Server.js'
import {api, web} from './src/routes/index.js';

const server = new Server();

server.concatRoutes([api, web]);

await server.listen();