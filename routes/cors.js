const express = require('express');
const cors = require('cors');
const app = express();

const corsOptionsDelegate = (req, callback) => {
    let corsOptions;
    const whitelist = ['http://localhost:3000', 'https://localhost:3443']

    if (whitelist.indexOf(req.header('Origin')) === -1)  corsOptions = {origin: false}
    else corsOptions = {origin: true}

    callback(null, corsOptions)
}

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);