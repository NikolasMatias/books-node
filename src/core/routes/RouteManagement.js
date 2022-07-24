import fs from 'fs';
import FileHandler from "../../helpers/FileHandler.js";
import Route from "./data/Route.js";
import * as path from "path";
import AbstractController from "../controllers/AbstractController.js";
import Request from './Request.js'

export default class RouteManagement {
    #routes
    constants

    constructor() {
        this.#routes = [];

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

    viewResource(pathName, controller) {
        if (! controller instanceof AbstractController) throw new Error('Second Parameter needs to be an instance of AbstractController');

        this.getView(pathName, controller.index);
        this.postView(pathName, controller.store);
        this.getView(`${pathName}/{id}`, controller.show);
        this.putView(`${pathName}/{id}`, controller.update);
        this.deleteView(`${pathName}/{id}`, controller.destroy);
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

    apiResource(pathName, controller) {
        if (! controller instanceof AbstractController) throw new Error('Second Parameter needs to be an instance of AbstractController');

        this.getJson(pathName, controller.index);
        this.postJson(pathName, controller.store);
        this.getJson(`${pathName}/{id}`, controller.show);
        this.putJson(`${pathName}/{id}`, controller.update);
        this.deleteJson(`${pathName}/{id}`, controller.destroy);
    }

    async runRoute(pathName, request) {
        try {
            if (! request instanceof Request) throw new Error('request need to be an instance of Request');
            const {  method } = request.originalRequest;
            const route = this.getRoute(pathName, method);

            const returnCallback = route.getCallback();
            const returnValue = returnCallback(request);
            const headers = { 'Content-Type':  route.getHeader('Content-Type')};

            if (route.getHeader('Content-Type').includes(this.constants.HTML)) {
                const fullPath = path.join(process.cwd(), returnValue);
                const typeContent = 'binary';
                await FileHandler.verifyExistAndReadable(fullPath);

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
        } catch (error) {
            if (typeof error.message === 'string' && error.message.includes('You have to implement the method')) {
                const route = this.getRoute(pathName, method);

                throw new Error(JSON.stringify({
                    message: error.message,
                    statusCode: 404,
                    typeContent: route.getHeader('Content-Type').includes(this.constants.HTML) ? 'binary' : 'utf-8'
                }));
            } else {
                throw error;
            }
        }
    }

    getRoute(pathName, method) {
        const routesFound = this.#routes.filter(route => {
            return route.hasHeaderValue('Request Method', method)
                && route.hasPathName(pathName);
        });

        if (routesFound.length > 0) {
            return routesFound[0];
        }

        throw new Error(JSON.stringify({
            message: 'Route Not Found',
            statusCode: 404
        }));
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

        return this;
    }
}