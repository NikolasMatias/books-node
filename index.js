import Server from './src/core/routes/Server.js'
import { api, web } from './src/routes/index.js';
import http from 'http';

const server = new Server();

server.concatRoutes(api).concatRoutes(web);

server.listen();