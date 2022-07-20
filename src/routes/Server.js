import * as http from 'http';
import * as url from 'url';
import * as path from "path";
import * as fs from "fs";
import FileHandler from "../helpers/FileHandler.js";
import env from "../helpers/env.js";

export default class Server {
    constructor() {
        // this.routes = routes;
        this.http = http.createServer(this.#startServer.bind(this));
    }

    #contentTypesByExtension = {
        '.html': "text/html",
        '.css':  "text/css",
        '.js':   "text/javascript"
    }

    async listen(callback) {
        const hostname = await env('HTTP_HOST', '127.0.0.1');
        const port = await env('HTTP_PORT', '3000');

        return this.http.listen(port, hostname, () => {
            console.log(`Server running at http://${hostname}:${port}/`);

            if (typeof callback === 'function' || callback instanceof Function) callback();
        })
    }

    #startServer(request, response) {
        const pathName = path.join(process.cwd(), request.url);

        if (this.#hasExtension(pathName)) {
            (new FileHandler).verifyExistAndReadable(pathName)
                .then(() => {
                    fs.readFile(pathName, 'binary', (err, file) => {
                        if (err !== null) {
                            response.writeHead(500, {"Content-Type": "text/plain"});
                            response.write(err + "\n");
                            response.end();
                        } else {
                            response.writeHead(200, { "Content-Type": this.#contentTypesByExtension[path.extname(pathName)] });
                            response.write(file, 'binary');
                            response.end();
                        }
                    })
                })
                .catch(({ message, error }) => {
                    response.writeHead(404, { 'Content-Type': 'text/plain' });
                    response.write("404 Not Found\n");
                    response.end();
                });
        } else {
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.write("404 Not Found\n");
            response.end();
            return;
        }
    }

    #hasExtension(filename) {
        return path.extname(filename).length > 0;
    }
}