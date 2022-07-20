import fs from 'fs';
import FileHandler from "../helpers/FileHandler.js";
import RouteData from "./data/RouteData.js";
import * as path from "path";

export default class Route {
    #routes
    #fileHeader

    constructor() {
        this.#routes = [];
        this.#fileHeader = new FileHandler();
    }

    constants = {
        HTML: 'text/html',
        JSON: 'application/json'
    }

    get(pathName, typeReturn, cbReturn) {
        let routeData = new RouteData(pathName);
        routeData.setHeader('Content-Type', this.constants[typeReturn]);
        routeData.setHeader('Request Method', 'GET');
        routeData.setCallback(cbReturn);

        this.#routes.push(routeData);
    }

    post(pathName, typeReturn, cbReturn) {
        let routeData = new RouteData(pathName);
        routeData.setHeader('Content-Type', this.constants[typeReturn]);
        routeData.setHeader('Request Method', 'POST');
        routeData.setCallback(cbReturn);

        this.#routes.push(routeData);
    }

    put(pathName, typeReturn, cbReturn) {
        let routeData = new RouteData(pathName);
        routeData.setHeader('Content-Type', this.constants[typeReturn]);
        routeData.setHeader('Request Method', 'PUT');
        routeData.setCallback(cbReturn);

        this.#routes.push(routeData);
    }

    delete(pathName, typeReturn, cbReturn) {
        let routeData = new RouteData(pathName);
        routeData.setHeader('Content-Type', this.constants[typeReturn]);
        routeData.setHeader('Request Method', 'DELETE');
        routeData.setCallback(cbReturn);

        this.#routes.push(routeData);
    }

    async runRoute(pathName, method) {
        try {
            let routesFound = this.#routes.filter(route => {
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
                    const content = returnValue;
                    const statusCode = 200;
                    const typeContent = 'binary';

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
}