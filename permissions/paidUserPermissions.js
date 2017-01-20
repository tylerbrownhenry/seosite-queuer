var Permission = require('../schemas/permissionSchema');

var permission = {
    label: 'paid',
    limits:{
        monthly:{
            page: 100000,
            site: 1000,
            requests: 10000,
            links: 1000000
        },
        daily:{
            page: 100000,
            site: 1000,
            requests: 10000,
            links: 1000000
        }
    },
    restrictions:{
      type:{
            site: true,
            page: true,
        },
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
            https: true
        }
    }
}

module.exports = new Permission(permission);