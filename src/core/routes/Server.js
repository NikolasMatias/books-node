import * as http from 'http';
import * as url from 'url';
import * as path from "path";
import * as fs from "fs";
import FileHandler from "../../helpers/FileHandler.js";
import env from "../../helpers/env.js";
import RouteManagement from "./RouteManagement.js";

export default class Server {
    constructor(routeManagement = null) {
        this.#fileHandler = new FileHandler();
        this.#routeManagement = routeManagement !== null ? routeManagement : (new RouteManagement());

        this.#http = http.createServer(this.#startServer.bind(this));
    }

    #http
    #fileHandler
    #routeManagement

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

    getView(pathName, cbReturn) {
        this.#routeManagement.get(pathName, 'HTML', cbReturn);
    }

    postView(pathName, cbReturn) {
        this.#routeManagement.post(pathName, 'HTML', cbReturn);
    }

    putView(pathName, cbReturn) {
        this.#routeManagement.put(pathName, 'HTML', cbReturn);
    }

    deleteView(pathName, cbReturn) {
        this.#routeManagement.delete(pathName, 'HTML', cbReturn);
    }

    getJson(pathName, cbReturn) {
        this.#routeManagement.get(pathName, 'JSON', cbReturn);
    }

    postJson(pathName, cbReturn) {
        this.#routeManagement.post(pathName, 'JSON', cbReturn);
    }

    putJson(pathName, cbReturn) {
        this.#routeManagement.put(pathName, 'JSON', cbReturn);
    }

    deleteJson(pathName, cbReturn) {
        this.#routeManagement.delete(pathName, 'JSON', cbReturn);
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
                if (this.#routeManagement !== null) {
                    const {
                        headers, content,
                        typeContent, statusCode
                    } = await this.#routeManagement.runRoute(request.url, request.method);

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
                    await this.#handleIfHasError(response, error, false);
                }
            }).catch(async () => {
                await this.#handleIfHasError(response, error, false);
            })
        }
    }

    async isJSON(json) {
        return JSON.parse(json);
    }

    async #handleIfHasError(response, error = null, hasThrow = true) {
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

            if (hasThrow) throw new Error(error);
            console.error(error);

            return true;
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

    getRouteManagement() {
        return this.#routeManagement;
    }

    setRouteManagement(routeManagement) {
        this.#routeManagement = routeManagement;
    }

    #hasExtension(filename) {
        return path.extname(filename).length > 0;
    }
}