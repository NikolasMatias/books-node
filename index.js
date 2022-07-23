import Server from './src/core/routes/Server.js'

const server = new Server();

server.getView('/', () => '/src/views/Home.html');
server.getJson('/api/pessoas', () => [{id: 1, nome: 'José'}]);

server.listen();