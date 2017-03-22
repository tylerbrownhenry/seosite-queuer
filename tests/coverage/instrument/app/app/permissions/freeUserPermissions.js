var Permission = require('../models/permission');

var permission = {
     label: 'free',
     limits: {
          monthly: {
               page: 100,
               site: 0,
               requests: 100,
               links: 0,
               captures: 0
          },
          daily: {
               page: 5,
               site: 0,
               requests: 5,
               links: 0,
               captures: 0
          }
     },
     restrictions: {
          type: {
               site: false,
               page: true,
          },
          captures: false,
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
