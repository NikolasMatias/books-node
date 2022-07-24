import fs from "fs";
import FileHandler from "./FileHandler.js";

export default function env(target, defaultTarget) {
    return new Promise(async (resolve, reject) => {
        const envFile = '/mnt/c/Users/nikol/OneDrive/Documentos/Projetos/Estudos/node-studies/books-node/.env';

        try {
            await FileHandler.verifyExistAndReadable(envFile);

            const data = await fs.promises.readFile(envFile, "utf-8");
            const formattedData = data.split(/\r?\n/).reduce((previousValue, currentValue) => {
                const keyValue = currentValue.split('=');
                if (keyValue.length >= 1 && keyValue[0] !== '') {
                    previousValue[keyValue[0]] = keyValue[1] || '';
                }

                return previousValue;
            }, {});

            resolve(formattedData[target] || process.env[target] || defaultTarget);
        } catch (e) {
            if (defaultTarget) resolve(defaultTarget);

            reject(e);
        }
    });
}