import * as http from 'http';
import * as url from 'url';
import * as path from "path";
import * as fs from "fs";
import FileHandler from "../helpers/FileHandler.js";
import env from "../helpers/env.js";

export default class Server {
    constructor(route = null) {
        this.#fileHandler = new FileHandler();
        this.#routes = route;

        this.#http = http.createServer(this.#startServer.bind(this));
    }

    #http
    #fileHandler
    #routes

    #contentTypesByExtension = {
        '.html': "text/html",
        '.css':  "text/css",
        '.js':   "text/javascript"
    }

    async listen(callback) {
        const hostname = await env('HTTP_HOST', '127.0.0.1');
        const port = await env('HTTP_PORT', '3000');

        return this.#http.listen(port, hostname, () => {
            console.log(`Server running at http://${hostname}:${port}/`);

            if (typeof callback === 'function' || callback instanceof Function) callback();
        })
    }

    async #startServer(request, response) {
        try {
            const pathName = path.join(process.cwd(), request.url);

            if (this.#hasExtension(pathName)) {
                this.#fileHandler.verifyExistAndReadable(pathName)
                    .then(() => {
                        fs.readFile(pathName, 'binary', (err, file) => {
                            this.#handleIfHasError(response, err)
                                .then(() => {
                                    response.writeHead(200, { "Content-Type": this.#contentTypesByExtension[path.extname(pathName)] });
                                    response.write(file, 'binary');
                                    response.end();
                                });
                        })
                    })
                    .catch( async () => {
                        await this.#handleNotFound(response);
                    });
            } else {
                if (this.#routes !== null) {
                    const {
                        headers, content,
                        typeContent, statusCode
                    } = await this.#routes.runRoute(request.url, request.method);

                    response.writeHead(statusCode, headers);
                    response.write(content, typeContent);
                    response.end();
                } else {
                    await this.#handleNotFound(response);
                }
            }
        } catch (error) {
            this.isJSON(error.message).then(async ({ statusCode }) => {
                if (statusCode === 404) {
                    await this.#handleNotFound(response);
                } else {
                    await this.#handleIfHasError(response, error);
                }
            }).catch(async () => {
                await this.#handleIfHasError(response, error);
            })
        }
    }

    async isJSON(json) {
        return JSON.parse(json);
    }

    async #handleIfHasError(response, error = null) {
        if (error !== null) {
            const pathName505 = path.join(process.cwd(), await env('URL_500', '/public/views/500.html'));
            this.#fileHandler.verifyExistAndReadable(pathName505)
                .then(() => {
                    fs.readFile(pathName505, 'binary', (err, file) => {
                        if (err !== null) {
                            response.writeHead(500, {"Content-Type": "text/plain"});
                            response.write(err + "\n");
                            response.end();
                        } else {
                            response.writeHead(500, { "Content-Type": this.#contentTypesByExtension[path.extname(pathName505)] });
                            response.write(file, 'binary');
                            response.end();
                        }
                    })
                })
                .catch(() => {
                    response.writeHead(500, {"Content-Type": "text/plain"});
                    response.write(error + "\n");
                    response.end();
                });

            throw new Error(error);
        } else {
            return true;
        }
    }

    async #handleNotFound(response) {
        const pathName404 = path.join(process.cwd(), await env('URL_404', '/public/views/404.html'));
        this.#fileHandler.verifyExistAndReadable(pathName404)
            .then(() => {
                fs.readFile(pathName404, 'binary', (err, file) => {
                    if (err !== null) {
                        response.writeHead(500, {"Content-Type": "text/plain"});
                        response.write(err + "\n");
                        response.end();
                    } else {
                        response.writeHead(404, { "Content-Type": this.#contentTypesByExtension[path.extname(pathName404)] });
                        response.write(file, 'binary');
                        response.end();
                    }
                })
            })
            .catch(() => {
                response.writeHead(404, { 'Content-Type': 'text/plain' });
                response.write("404 Not Found\n");
                response.end();
            })
    }

    getRoutes() {
        return this.#routes;
    }

    setRoutes(routes) {
        this.#routes = routes;
    }

    #hasExtension(filename) {
        return path.extname(filename).length > 0;
    }
}