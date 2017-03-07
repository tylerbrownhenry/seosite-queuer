var mongoose = require('mongoose');

var linkSchema = new mongoose.Schema({
    url: {
        type: String
    },
    site: {
        type: String
    },
    queueId: {
        type: String
    },
    found: {
        type: Date
    },
    _id: {
        type: [mongoose.Schema.Types.ObjectId]
    },
    linkId: {
        type: String
    },
    uid: {
        type: String
    },
    requestId: {
        type: String
    },
    scanned: {
        type: Date
    },
    status: {
        type: String,
        default: 'pending'
    },
    __link: {
        type: Object
    },
    results: {
        type: Object
    }
});

module.exports = linkSchema;
