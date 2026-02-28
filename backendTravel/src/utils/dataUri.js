const Datauriparser = require('datauri/parser.js');
const path = require('path');
const parser = new Datauriparser();

const getdataUri = (file) => {
    return parser.format(path.extname(file.originalname).toString(), file.buffer).content;
};

module.exports = getdataUri;
