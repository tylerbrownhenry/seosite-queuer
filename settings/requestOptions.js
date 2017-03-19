"use strict";

var options = {
     type: {
          label: 'Type of scan',
          type: 'radio',
          options: {
               page: {
                    order: 1,
                    label: 'Page',
                    helper: 'Scan a single url.'
               },
               site: {
                    type: 'radio': order: 2,
                    label: 'Site',
                    helper: 'Scan an entire site.'
               }
          }
     },
     filterLimit: {
          label: 'Type links to evaulate if are broken',
          type: 'radio',
          options: {
               0: {
                    order: 1,
                    label: 'Links',
                    helper: 'Validates clickable links only.'
               },
               1: {
                    order: 2,
                    label: 'Links, media, iframes, and meta refreshes',
                    helper: 'Validates clickable links, media, iframes and meta refreshes.'
               },
               2: {
                    order: 3,
                    label: 'Links',
                    label: 'Links, media, iframes, meta refreshes, stylesheets, scripts and forms',
                    helper: 'Validates clickable links, media, iframes, meta refreshes, stylesheets, scripts and forms.'
               },
               3: {
                    order: 4,
                    label: 'Links, media, iframes, and meta refreshes, stylesheets, scripts, forms and metadata',
                    helper: 'Validates clickable links, media, iframes, meta refreshes, stylesheets, scripts, forms and metadata'
               }
          }
     },
     digDepthLimit: {
          label: 'If can a page and find link that is a depth of 0, if you go to the link and find the links in that, that is a depth of 1, and so on.'
          type: 'range',
          options: {
               min: 0,
               max: 100000
          }
     },
     excludeExternalLinks: {
          label: 'Do you want to include links from other sites in your validation?'
          type: 'boolean',
          options: {
               yes: {
                    order: 1,
                    label: 'Yes check that any link to another website is valid.'
               },
               no: {
                    order: 2,
                    label: 'Do not check links to another website.'
               }
          },
     },
     honorRobotExclusions: {
          label: 'Do you want to honor your sites robot exclusions?'
          type: 'boolean',
          options: {
               yes: {
                    order: 1,
                    label: 'Yes, ack like any other spider.'
               },
               no: {
                    order: 2,
                    label: 'No, I\'m special.'
               }
          },
     },
     excludedSchemes: {
          label: 'Type of page elements to ignore'
          type: 'multiselection',
          options: {
               data: {
                    order: 1,
                    label: 'data'
               },
               geo: {
                    order: 2,
                    label: 'geo'
               },
               javascript: {
                    order: 3,
                    label: 'javascript'
               },
               mailto: {
                    order: 4,
                    label: 'mailto'
               },
               sms: {
                    order: 5,
                    label: 'sms'
               },
               tel: {
                    order: 6,
                    label: 'tel'
               }
          },
     },
     linkInformation: {
          label: 'Type of link information to return',
          type: 'multiselection',
          options: {
               selector: {
                    order: 1,
                    label: 'selector',
               },
               element: {
                    order: 2,
                    label: 'element'
               },
               location: {
                    order: 2,
                    label: 'location',
                    label: 'The offset of the item on the page (viewable on overlay)'
               },
               redirects: {,
                    order: 3,
                    label: 'redirects'
               },
               status: {
                    order: 4,
                    label: 'status',
                    label: 'Checks if a link is broken'
               },
               href: {
                    order: 5,
                    label: 'href'
               },
               parent: {
                    order: 5,
                    label: 'parent',
                    label: 'What pages was this found on? (viewable as a tree)'
               }
          }
     }
     acceptedSchemes: {
          label: 'Types of requess',
          type: 'multiselection',
          options: {
               http: {
                    order: 1,
                    label: 'http',
               },
               https: {
                    order: 2,
                    label: 'https (secure)'
               }
          }
     }
}
module.exports = options;
