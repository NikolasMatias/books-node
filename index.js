import env from "./src/helpers/env.js";

const host = await env('HTTP_HOST', '127.0.0.1');
const port = await env('HTTP_PORT', '3000');

console.log(host);
console.log(port);