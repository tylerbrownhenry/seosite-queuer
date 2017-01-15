var Permission = require('./permissionSchema');

var permission = {
    label: 'paid',
    requests:{
        type:{
            site: true,
            page: true,
        },
        monthlyLimit:{
            page: 100000,
            site: 1000,
            requests: 10000,
            links: 1000000
        },
        dailyLimit:{
            page: 100000,
            site: 1000,
            requests: 10000,
            links: 1000000
        }
    },
    restrictions:{
        filterLimit: 10,
        digDepthLimit: 100,
        excludeExternalLinks: {
            canDisable: true
        },
        honorRobotExclusions: {
            canDisable: true
        },
        excludedSchemes: {
            canUse: true
        },
        saveSelectors: {
            canEnable: true
        },
        linkInformation: {
            selector: true,
            element: true,
            redirects: true,
            location: true,
            redirects: true,
            status: true,
            url: true,
            href: true,
            parent: true
        },
        acceptedSchemes: {
            http: true,
            https: true.
        }
    }
}

module.exports = new Permission(permission);