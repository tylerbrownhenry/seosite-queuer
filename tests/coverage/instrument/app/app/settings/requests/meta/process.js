var _ = require('underscore');
/**
 * adds the properties ['meta','grade','issues'] to newScan object
 * @return {Object} modified version of Scan object
 */

function processMetaData(newScan,input,res) {
     if (input.options && input.options.save && input.options.save.metaData === true) {
          newScan.meta = {
               title: {
                    message: 'No title found',
                    text: '',
                    found: false
               },
               description: {
                    message: 'No meta description found.',
                    element: null,
                    text: '',
                    found: false
               },
               h1: {
                    message: 'No h1 found.',
                    element: null,
                    text: '',
                    found: false
               },
               h2: {
                    message: 'No h2 found.',
                    element: null,
                    text: '',
                    found: false
               }
          }

          var links = _.filter(res.links, function (link) {
               if (typeof link.specialCase !== 'undefined') {
                    if (link.specialCase === 'title') {
                         newScan.meta.title.found = true;
                         newScan.meta.title.text = link.html.text;
                         newScan.meta.title.message = 'Found'
                    } else if (link.specialCase === 'description') {
                         newScan.meta.description.found = true;
                         newScan.meta.description.element = link.html.tag;
                         newScan.meta.description.text = link.html.attrs.content;
                         newScan.meta.description.message = 'Found'
                    } else if (link.specialCase === 'h1') {
                         newScan.meta.h1.found = true;
                         newScan.meta.h1.element = link.html.tag;
                         newScan.meta.h1.text = link.html.attrs.content;
                         newScan.meta.h1.message = 'Found'
                    } else if (link.specialCase === 'h2') {
                         newScan.meta.h2.found = true;
                         newScan.meta.h2.element = link.html.tag;
                         newScan.meta.h2.text = link.html.attrs.content;
                         newScan.meta.h2.message = 'Found'
                    }
                    return false;
               } else if (link.html.tagName === 'meta') {
                    return false;
               } else if (link.url.original.toLowerCase().indexOf("mailto:") >= 0) {
                    return false;
               } else if (link.url.original.toLowerCase().indexOf("tel:") >= 0) {
                    return false;
               }
               return true;
          });

          var metaIssueCount = 0;

          if (newScan.meta.title.found !== true) {
               metaIssueCount++
          }
          if (newScan.meta.description.found !== true) {
               metaIssueCount++
          }
          if (newScan.meta.h1.found !== true) {
               metaIssueCount++
          }
          if (newScan.meta.h2.found !== true) {
               metaIssueCount++
          }

          var resourceIssueCount = 0;
          _.each(newScan.resources, function (resource) {
               if (resource.gzip === null) {
                    resourceIssueCount += 1;
               }
               if (resource.cached === null) {
                    resourceIssueCount += 1;
               }
               if (resource.minified === null) {
                    resourceIssueCount += 1;
               }
               if (resource.status !== 200 && resource.status !== 301) {
                    resourceIssueCount += 1;
               }
          });

          var linkIssueCount = 0;

          var tooManyLinks = (links >= 100) ? true : false;
          if (tooManyLinks) {
               linkIssueCount++
          }
          if (tooManyLinks === false &&
               linkIssueCount === 0 &&
               resourceIssueCount === 0 &&
               metaIssueCount === 0 &&
               (newScan.emails && newScan.emails.length === 0)) {
               newScan.issues = {
                    noIssues: true
               };
          } else {
               newScan.issues = {
                    tooManyLinks: tooManyLinks,
                    links: linkIssueCount,
                    resources: resourceIssueCount,
                    security: (newScan.emails) ? newScan.emails.length : 0,
                    meta: metaIssueCount
               }
          }
          newScan.grade = {
               letter: 'B',
               message: 'Could be better'
          };
     }
     return newScan;
}
module.exports = processMetaData;
