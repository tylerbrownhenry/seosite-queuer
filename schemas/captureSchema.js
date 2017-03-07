"use strict";
var mongoose = require('mongoose');

var captureSchema = new mongoose.Schema({
    requestId:{
        type: String
    },
    url: {
        type: Object
    },
    '1920x1080': {
        type: String,
        default: null
    },
    '1600x1200': {
        type: String,
        default: null
    },
    '1400x900': {
        type: String,
        default: null
    },
    '1024x768': {
        type: String,
        default: null
    },
    '800x600': {
        type: String,
        default: null
    },
    '420x360': {
        type: String,
        default: null
    },
    status: {
        type: String,
        default: 'init'
    }
});

module.exports = mongoose.model('Capture', captureSchema, 'captures');
