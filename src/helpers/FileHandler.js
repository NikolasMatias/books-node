import fs from "fs";
import path from "path";

export default class FileHandler {
    static async verifyExistAndReadable(fileName) {
        return new Promise((resolve, reject) => {
            fs.access(fileName, fs.constants.F_OK | fs.constants.R_OK, (err) => {
                if (err) reject({
                    message: `${fileName} ${err.code === 'ENOENT' ? 'does not exist' : 'is not readable'}`,
                    error: err
                });

                resolve(true);
            });
        });
    }

    static hasExtension(filename) {
        return path.extname(filename).length > 0;
    }
}