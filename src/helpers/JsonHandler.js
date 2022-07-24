export default class JsonHandler {
    static async isStringJSON(json) {
        return JSON.parse(json);
    }
}