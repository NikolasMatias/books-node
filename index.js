import Server from './src/routes/Server.js'

(new Server()).listen(() => {
    console.log('passando aqui');
});