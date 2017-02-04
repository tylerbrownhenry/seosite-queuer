var mongoose = require('mongoose');

 var scanSchema = new mongoose.Schema({
    requestId:{
        type: String
    },
    uid: {
        type: String
    },
    meta: {
        type: Object
    },
    resources: {
        type: Object
    },
    emails:{
        type: Object
    },
    linkCount: {
        type: Number
    },
    url: {
        type: Object
    },
    redirects: {
        type: Number
    },
    issues: {
        type: Object
    },
    links: {
        type: Object
    },
    completedTime: {
        type: Object
    },
    grade: {
        type: Object
    },
    captures: {            
        "1920x1080" : {
            type: String,
            default: null
        },
        "1600x1200" : {
            type: String,
            default: null
        },
        "1400x900" : {
            type: String,
            default: null
        },
        "1024x768" : {
            type: String,
            default: null
        },
        "800x600" : {
            type: String,
            default: null
        },
        "420x360" : {
            type: String,
            default: null
        }
    }
});

module.exports = mongoose.model('Scan', scanSchema, 'scans');