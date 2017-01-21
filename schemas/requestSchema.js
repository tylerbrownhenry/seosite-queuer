var mongoose = require('mongoose');

var requestSchema = new mongoose.Schema({
    retries: {
        type: Number,
        default: 0
    },
    uid: {
        type: String
    },
    url: {
        type: String
    },
    requestId: {
        type: String
    },
    requestDate: {
        type: Date,
        default: Date.now()
    },
    options: {
        type: Object
    },
    processes: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        default: 'init'
    },
    failedReason: {
        type: String,
        default: null
    },
    response: {
        type: Object,
        default: {}
    }
});

module.exports = requestSchema;