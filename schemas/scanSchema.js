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
            }
        });

module.exports = mongoose.model('Scan', scanSchema, 'scans');