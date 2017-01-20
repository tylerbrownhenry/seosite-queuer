"use strict";
var mongoose = require('mongoose');

var permissionSchema = new mongoose.Schema({
    limits:{
        monthly:{
            page: {type: Number, default: 30},
            site: {type: Number, default: 0},
            requests: {type: Number, default: 1000},
            links: {type: Number, default: 1000}
        },
        daily:{
            page: {type: Number, default: 3},
            site: {type: Number, default: 0},
            requests: {type: Number, default: 30},
            links: {type: Number, default: 30}
        }
    },
    restrictions:{
        type:{
            site: {type: Boolean, default: false},
            page: {type: Boolean, default: true}
        },
        filterLimit: {type: Number, default: 1},
        digDepthLimit: {type: Number, default: 0},
        excludeExternalLinks: {
            canDisable: {type: Boolean, default: false}
        },
        honorRobotExclusions: {
            canDisable: {type: Boolean, default: false}
        },
        excludedSchemes: {
            canUse: {type: Boolean, default: false}
        },
        saveSelectors: {
            canEnable: {type: Boolean, default: false}
        },
        linkInformation: {
            selector: {type: Boolean, default: false},
            element: {type: Boolean, default: false},
            redirects: {type: Boolean, default: false},
            location: {type: Boolean, default: false},
            redirects: {type: Boolean, default: false},
            status: {type: Boolean, default: false},
            url: {type: Boolean, default: true},
            href: {type: Boolean, default: true},
            parent: {type: Boolean, default: false}
        },
        acceptedSchemes: {
            http: {type: Boolean, default: true},
            https: {type: Boolean, default: false}
        }
    }
});


module.exports = mongoose.model('Permission', permissionSchema, 'plan-permissions');