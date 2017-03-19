"use strict";
var dynamoose = require('dynamoose');
var permissionSchema = new dynamoose.Schema({
     label: {
          type: String,
          hashKey: true
     },
     limits: {
          monthly: {
               page: {
                    type: Number,
                    default: 30
               },
               site: {
                    type: Number,
                    default: 0
               },
               requests: {
                    type: Number,
                    default: 30
               },
               links: {
                    type: Number,
                    default: 100
               },
               captures: {
                    type: Number,
                    default: 0
               }
          },
          daily: {
               page: {
                    type: Number,
                    default: 3
               },
               site: {
                    type: Number,
                    default: 0
               },
               requests: {
                    type: Number,
                    default: 3
               },
               links: {
                    type: Number,
                    default: 30
               },
               captures: {
                    type: Number,
                    default: 0
               }
          }
     },
     restrictions: {
          captures: {
               type: Boolean,
               default: false
          },
          type: {
               site: {
                    type: Boolean,
                    default: false
               },
               page: {
                    type: Boolean,
                    default: true
               }
          },
          filterLimit: {
               type: Number,
               default: 1
          },
          digDepthLimit: {
               type: Number,
               default: 0
          },
          excludeExternalLinks: {
               canDisable: {
                    type: Boolean,
                    default: false
               }
          },
          honorRobotExclusions: {
               canDisable: {
                    type: Boolean,
                    default: false
               }
          },
          excludedSchemes: {
               canUse: {
                    type: Boolean,
                    default: false
               }
          },
          saveSelectors: {
               canEnable: {
                    type: Boolean,
                    default: false
               }
          },
          linkInformation: {
               selector: {
                    type: Boolean,
                    default: false
               },
               element: {
                    type: Boolean,
                    default: false
               },
               redirects: {
                    type: Boolean,
                    default: false
               },
               location: {
                    type: Boolean,
                    default: false
               },
               redirects: {
                    type: Boolean,
                    default: false
               },
               status: {
                    type: Boolean,
                    default: false
               },
               url: {
                    type: Boolean,
                    default: true
               },
               href: {
                    type: Boolean,
                    default: true
               },
               parent: {
                    type: Boolean,
                    default: false
               }
          },
          acceptedSchemes: {
               http: {
                    type: Boolean,
                    default: true
               },
               https: {
                    type: Boolean,
                    default: false
               }
          }
     }
}, {
     throughput: {
          read: 15,
          write: 5
     },
     timestamps: {
          createdAt: 'createdTs',
          updatedAt: 'updatedTs'
     }
});

module.exports = dynamoose.model('Permission', permissionSchema);
