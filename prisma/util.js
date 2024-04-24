const fs = require("fs").promises;

async function csvToObjects(filePath) {
    const fileData = await fs.readFile(filePath, "utf8")
    const array = csvToArray(fileData)
    const objects = rowsToObjects(array[0], array.slice(1, -1))

    return objects
}

function csvToArray(text) {
    // https://stackoverflow.com/questions/8493195/how-can-i-parse-a-csv-string-with-javascript-which-contains-comma-in-data
    text = text.replace(/^\uFEFF/, ''); // Replace BOM in CSV created by MS Excel
    let p = '', row = [''], ret = [row], i = 0, r = 0, s = !0, l;
    for (l of text) {
        if ('"' === l) {
            if (s && l === p) row[i] += l;
            s = !s;
        } else if (',' === l && s) l = row[++i] = '';
        else if ('\n' === l && s) {
            if ('\r' === p) row[i] = row[i].slice(0, -1);
            row = ret[++r] = [l = '']; i = 0;
        } else row[i] += l;
        p = l;
    }
    return ret;
};

function rowsToObjects(headers, rows) {
    const objectArray = []

    headers.forEach(function (header, index) {
        this[index] = header.toLowerCase()
    }, headers)

    rows.forEach(row => {
        const obj = {}
        for (let index = 0; index < row.length; index++)
            obj[headers[index]] = row[index];

        objectArray.push(obj)
    });
    return objectArray
}

module.exports = {
    csvToObjects
};