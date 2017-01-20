var Permission = require('../schemas/permissionSchema');

var permission = {
    label: 'free',
    limits:{
        monthlyLimit:{
            page: 100,
            site: 0,
            requests: 100,
            links: 0
        },
        dailyLimit:{
            page: 5,
            site: 0,
            requests: 5,
            links: 0
        }
    },
    restrictions:{
        type:{
            site: false,
            page: true,
        },
        filterLimit: 1,
        digDepthLimit: 0,
        excludeExternalLinks: {
            canDisable: false
        },
        honorRobotExclusions: {
            canDisable: false
        },
        excludedSchemes: {
            canUse: false
        },
        saveSelectors: {
            canEnable: false
        },
        linkInformation: {
            selector: false,
            element: false,
            redirects: false,
            location: false,
            redirects: false,
            status: false,
            url: true,
            href: true,
            parent: false
        },
        acceptedSchemes: {
            http: true,
            https: false
        }
    }
}

module.exports = new Permission(permission);