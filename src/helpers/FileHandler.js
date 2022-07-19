import fs from "fs";

export default class FileHandler {
    async verifyExistAndReadable(fileName) {
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
}