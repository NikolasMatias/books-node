export default class Route {
    constructor(pathName, headers = {}) {
        this.#headers = headers;
        this.#pathName = pathName;
    }

    #headers
    #pathName
    #callback

    getCallback() {
        return this.#callback;
    }

    setCallback(callback) {
        this.#callback = callback;
    }

    getPathName() {
        return this.#pathName;
    }

    setPathName(pathName) {
        this.#pathName = pathName;
    }

    hasPathName(pathName) {
        return this.#pathName.includes(pathName);
    }

    getHeaders() {
        return this.#headers;
    }

    hasHeader(headerName) {
        return this.#headers.hasOwnProperty(headerName);
    }

    hasHeaderValue(headerName, headerValue) {
        return this.hasHeader(headerName)
            && this.#headers[headerName] === headerValue;
    }

    getHeader(headerName) {
        if (this.hasHeader(headerName)) {
            return this.#headers[headerName];
        }

        throw new Error("Header doesn't exist in this route");
    }

    setHeader(headerName, headerValue) {
        this.#headers[headerName] = headerValue;
    }

    deleteHeader(headerName) {
        if (this.hasHeader(headerName)) {
            delete this.#headers[headerName];
        }
    }
}