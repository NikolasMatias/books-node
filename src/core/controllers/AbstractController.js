export default class AbstractController {
    constructor(isChild) {
        if (!isChild) {
            console.error('This is an Abstract Class, You need to extend it first');
        }
    }

    index(request) {
        throw new Error('You have to implement the method index!');
    }

    store(request) {
        throw new Error('You have to implement the method store!');
    }

    show(request) {
        throw new Error('You have to implement the method show!');
    }

    update(request) {
        throw new Error('You have to implement the method update!');
    }

    destroy(request) {
        throw new Error('You have to implement the method destroy!');
    }
}