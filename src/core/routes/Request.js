import { IncomingMessage } from 'http';

export default class Request {
    constructor(req, data = {}, files = null) {
        if (! req instanceof IncomingMessage) new Error('Request need to be an instance of IncomingMessage');

        this.originalRequest = req;
        this.#data = data;
        this.#files = files;
    }

    originalRequest
    #data
    #files

    all() {
        let allData = this.#data;

        if (this.#files) {
            allData = { ...allData, files: this.#files };
        }

        return allData;
    }

    get(value) {
        if (value === 'files') return this.#files;

        return this.#data[value] || false;
    }
}