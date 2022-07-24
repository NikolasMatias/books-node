export default class AbstractController {
    constructor(isChild) {
        if (!isChild) {
            console.error('This is an Abstract Class, You need to extend it first');
        }
    }

    index() {
        throw new Error('You have to implement the method index!');
    }

    store() {
        throw new Error('You have to implement the method store!');
    }

    show() {
        throw new Error('You have to implement the method show!');
    }

    update() {
        throw new Error('You have to implement the method update!');
    }

    destroy() {
        throw new Error('You have to implement the method destroy!');
    }
}