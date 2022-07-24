import Server from './src/core/routes/Server.js'
import { api, web } from './src/routes/index.js';
import http from 'http';

const server = new Server();

http.createServer(function (req, res) {

})

server.concatRoutes(api).concatRoutes(web);

// server.getJson('/teste', () => ({teste: 1}));

server.listen();