const fsp = require('fs').promises;
const path = require('path');

const walkFiles = async (dir) => {

    let results = [];

    const list = await fsp.readdir(dir, { withFileTypes: true });

    for (const file of list) {

        const fullPath = path.join(dir, file.name);

        if (file.isDirectory()) {
            results = results.concat(await walkFiles(fullPath));
        } else {
            results.push(fullPath);
        }
    }

    return results;
};

module.exports = { walkFiles };