import fs from 'fs';
import FileHandler from "../../helpers/FileHandler.js";
import Route from "./data/Route.js";
import * as path from "path";

export default class RouteManagement {
    #routes
    #fileHeader
    constants

    constructor() {
        this.#routes = [];
        this.#fileHeader = new FileHandler();

        this.constants = {
            HTML: 'text/html',
            JSON: 'application/json'
        }
    }

    get(pathName, typeReturn, cbReturn) {
        const route = new Route(pathName);
        route.setHeader('Content-Type', this.constants[typeReturn]);
        route.setHeader('Request Method', 'GET');
        route.setCallback(cbReturn);

        this.#routes.push(route);
    }

    post(pathName, typeReturn, cbReturn) {
        const route = new Route(pathName);
        route.setHeader('Content-Type', this.constants[typeReturn]);
        route.setHeader('Request Method', 'POST');
        route.setCallback(cbReturn);

        this.#routes.push(route);
    }

    put(pathName, typeReturn, cbReturn) {
        const route = new Route(pathName);
        route.setHeader('Content-Type', this.constants[typeReturn]);
        route.setHeader('Request Method', 'PUT');
        route.setCallback(cbReturn);

        this.#routes.push(route);
    }

    delete(pathName, typeReturn, cbReturn) {
        const route = new Route(pathName);
        route.setHeader('Content-Type', this.constants[typeReturn]);
        route.setHeader('Request Method', 'DELETE');
        route.setCallback(cbReturn);

        this.#routes.push(route);
    }

    getView(pathName, cbReturn) {
        this.get(pathName, 'HTML', cbReturn);
    }

    postView(pathName, cbReturn) {
        this.post(pathName, 'HTML', cbReturn);
    }

    putView(pathName, cbReturn) {
        this.put(pathName, 'HTML', cbReturn);
    }

    deleteView(pathName, cbReturn) {
        this.delete(pathName, 'HTML', cbReturn);
    }

    getJson(pathName, cbReturn) {
        this.get(pathName, 'JSON', cbReturn);
    }

    postJson(pathName, cbReturn) {
        this.post(pathName, 'JSON', cbReturn);
    }

    putJson(pathName, cbReturn) {
        this.put(pathName, 'JSON', cbReturn);
    }

    deleteJson(pathName, cbReturn) {
        this.delete(pathName, 'JSON', cbReturn);
    }

    async runRoute(pathName, method) {
        try {
            const routesFound = this.#routes.filter(route => {
                return route.hasHeaderValue('Request Method', method)
                    && route.hasPathName(pathName);
            });

            if (routesFound.length > 0) {
                const route = routesFound[0];
                const returnCallback = route.getCallback();
                const returnValue = returnCallback();
                const headers = { 'Content-Type':  route.getHeader('Content-Type')};

                if (route.getHeader('Content-Type').includes(this.constants.HTML)) {
                    const fullPath = path.join(process.cwd(), returnValue);
                    const typeContent = 'binary';
                    await this.#fileHeader.verifyExistAndReadable(fullPath);

                    const content = await fs.promises.readFile(fullPath, typeContent);
                    const statusCode = 200;

                    return {
                        headers, content,
                        typeContent, statusCode
                    }
                }

                if (route.getHeader('Content-Type').includes(this.constants.JSON)) {
                    const content = JSON.stringify(returnValue);
                    const statusCode = 200;
                    const typeContent = 'utf-8';

                    return {
                        headers, content,
                        typeContent, statusCode
                    }
                }

            } else {
                throw new Error(JSON.stringify({
                    message: 'Route Not Found',
                    statusCode: 404
                }));
            }
        } catch (error) {
            throw error;
        }
    }

    getRoutes() {
        return this.#routes;
    }

    setRoutes(routes) {
        this.#routes = routes;
    }

    concatRoutes(routes) {
        if (typeof routes === 'function') {
            routes = routes.call();
        }

        this.#routes = this.#routes.concat(routes.getRoutes());
    }
}