"use strict";
var mongoose = require('mongoose');

var captureSchema = new mongoose.Schema({
    requestId:{
        type: String
    },
    url: {
        type: Object
    },
    captures: {
        type: Object
    },
    status: {
        type: String,
        default: 'init'
    }
});

module.exports = mongoose.model('Capture', captureSchema, 'captures');