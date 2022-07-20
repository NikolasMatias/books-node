import Server from './src/routes/Server.js'

(new Server()).listen(() => {
    console.log('passando aqui');
});




// import env from "./src/helpers/env.js";
// import path from 'path';
//
// const host = await env('HTTP_HOST', '127.0.0.1');
// const port = await env('HTTP_PORT', '3000');
//
// const filename = path.join(process.cwd(), '/src/routes/Route');
//
// console.log(host);
// console.log(port);
// console.log(filename);
//
// console.log(path.extname(filename).length);