import * as http from 'http';
import * as path from "path";
import * as fs from "fs";
import FileHandler from "../../helpers/FileHandler.js";
import env from "../../helpers/env.js";
import RouteManagement from "./RouteManagement.js";
import pkg from 'formidable';

export default class Server {
    constructor() {
        this.#routeManagement = new RouteManagement();
        this.#http = http.createServer(this.#startServer.bind(this));
    }

    #http
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

    async #startServer(req, response) {
        try {
            const { urlPath, fullPath, data } = await this.#handleRequest(req);
            const { default: Request } = await import('./Request.js');
            const request = new Request(req, data);

            if (FileHandler.hasExtension(fullPath)) {
                try {
                    await FileHandler.verifyExistAndReadable(fullPath)

                    fs.readFile(fullPath, 'binary', (err, file) => {
                        this.#handleIfHasError(response, err)
                            .then(() => {
                                response.writeHead(200, { "Content-Type": this.#contentTypesByExtension[path.extname(fullPath)] });
                                response.write(file, 'binary');
                                response.end();
                            });
                    })
                } catch (exception) {
                    await this.#handleNotFound(response);
                }
            } else {
                if (this.#routeManagement !== null) {
                    const {
                        headers, content,
                        typeContent, statusCode
                    } = await this.#routeManagement.runRoute(urlPath, request);

                    response.writeHead(statusCode, headers);
                    response.write(content, typeContent);
                    response.end();
                } else {
                    await this.#handleNotFound(response);
                }
            }
        } catch (error) {
            try {
                const { default: JsonHandler } = await import('../../helpers/JsonHandler.js');
                const { statusCode, typeContent } = await JsonHandler.isStringJSON(error.message);

                if (statusCode === 404) {
                    await this.#handleNotFound(response, typeContent);
                } else {
                    await this.#handleIfHasError(response, error, false);
                }
            } catch (error) {
                await this.#handleIfHasError(response, error, false);
            }
        }
    }

    async #handleRequest(request) {
        const [urlPath, queryString] = request.url.split('?');

        const fullPath = path.join(process.cwd(), urlPath);

        const { queryData } = await this.#handleQueryData(queryString || '');
        const { fields: bodyData } = await this.#handleBodyData(request);
        const data = Object.assign(queryData, bodyData);

        return { urlPath, fullPath, data };
    }

    async #handleQueryData(queryString) {
        const qs = await import('querystring');
        const queryData = qs.decode(queryString);
        return { queryData };
    }

    #handleBodyData(request) {
        return new Promise(async (resolve, reject) => {
            const { formidable } = pkg;
            const form = formidable();
            form.parse(request, (err, fields, files) => {
                if (err) {
                    reject(err);
                }

                resolve({fields, files});
            })
        });
    }

    async #handleIfHasError(response, error = null, hasThrow = true) {
        if (error === null) return true;

        try {
            const pathName505 = path.join(process.cwd(), await env('URL_500', '/public/views/500.html'));
            await FileHandler.verifyExistAndReadable(pathName505);

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
        } catch (exception) {
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(error + "\n");
            response.end();
        }

        if (hasThrow) throw new Error(error);
        console.error(error);
        return true;
    }

    async #handleNotFound(response, typeContent = 'binary') {
        switch (typeContent) {
            case 'utf-8':
                response.writeHead(404, { 'Content-Type': 'application/json' });
                response.write(JSON.stringify({ message: 'Not Found', statusCode: 404 }), typeContent);
                response.end();
                break;
            case 'binary':
                try {
                    const pathName404 = path.join(process.cwd(), await env('URL_404', '/public/views/404.html'));
                    await FileHandler.verifyExistAndReadable(pathName404);

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
                } catch (exception) {
                    response.writeHead(404, { 'Content-Type': 'text/plain' });
                    response.write("404 Not Found\n");
                    response.end();
                }
                break;
            default:
                response.writeHead(404, { 'Content-Type': 'text/plain' });
                response.write("404 Not Found\n");
                response.end();
        }
    }

    concatRoutes(routes) {
        if (typeof routes === 'function') {
            routes = routes.call();
        }

        this.#routeManagement.concatRoutes(routes);

        return this;
    }

    getView(pathName, cbReturn) {
        this.#routeManagement.getView(pathName, cbReturn);
    }

    postView(pathName, cbReturn) {
        this.#routeManagement.postView(pathName, cbReturn);
    }

    putView(pathName, cbReturn) {
        this.#routeManagement.putView(pathName, cbReturn);
    }

    deleteView(pathName, cbReturn) {
        this.#routeManagement.deleteView(pathName, cbReturn);
    }

    getJson(pathName, cbReturn) {
        this.#routeManagement.getJson(pathName, cbReturn);
    }

    postJson(pathName, cbReturn) {
        this.#routeManagement.postJson(pathName, cbReturn);
    }

    putJson(pathName, cbReturn) {
        this.#routeManagement.putJson(pathName, cbReturn);
    }

    deleteJson(pathName, cbReturn) {
        this.#routeManagement.deleteJson(pathName, cbReturn);
    }
}