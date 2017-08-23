var _ = require('underscore'),
     metaData = require('../../../models/metaData'),
     Issue = require('../../../models/issues'),
     sh = require("shorthash"),
     utils = require('../../../utils'),
     Security = require('../../../models/security');

function findKeywords(keywords, text) {
     var foundWords = {};
     var words = text.split(' ');
     _.each(words, function (word) {
          var cleanWord = word.toLowerCase();
          if (keywords['_' + cleanWord]) {
               foundWords['_' + cleanWord] = true;
          }
     });
     console.log('foundWords',foundWords,'words',words,'keywords',keywords);
     return foundWords;
}

/**
 * adds the properties ['meta','grade','issues'] to newScan object
 * @return {Object} modified version of Scan object
 */

function processMetaData(newScan, input, res) {
     //console.log('result--');
     var keywords = res.htmlResults.keywords;

     if (input.options && input.options.save && input.options.save.metaData === true) {
          var meta = {
               title: {
                    message: 'error:meta:no:title',
                    text: '',
                    found: false,
                    keywords: {}
               },
               description: {
                    message: 'error:meta:no:meta:desc',
                    element: null,
                    text: '',
                    found: false,
                    keywords: {}
               },
               h1: {
                    message: 'error:meta:no:h1',
                    element: null,
                    text: '',
                    found: false,
                    keywords: {}
               },
               h2: {
                    message: 'error:meta:no:h2',
                    element: null,
                    text: '',
                    found: false,
                    keywords: {}
               },
               h3: [],
               h4: [],
               h5: [],
               h6: []
          }

          var links = _.filter(res.links, function (link) {
               if (typeof link.specialCase !== 'undefined') {
                    if (link.specialCase === 'title') {
                         console.log('title####', link);
                         meta.title.found = true;
                         meta.title.element = link.html.tag;
                         meta.title.text = link.html.text;
                         meta.title.message = 'Found';
                         meta.title.keywords = findKeywords(keywords, link.html.text);
                    } else if (link.specialCase === 'description') {
                         meta.description.found = true;
                         meta.description.element = link.html.tag;
                         meta.description.text = link.html.attrs.content;
                         meta.description.message = 'Found';
                         meta.description.keywords = findKeywords(keywords, link.html.attrs.content);
                    } else if (link.specialCase === 'h1') {
                         console.log('H1', link.html);
                         meta.h1.found = true;
                         meta.h1.element = link.html.tag;
                         meta.h1.text = link.html.text;
                         meta.h1.message = 'Found';
                         meta.h1.keywords = findKeywords(keywords, link.html.text);
                    } else if (link.specialCase === 'h2') {
                         meta.h2.found = true;
                         meta.h2.element = link.html.tag;
                         meta.h2.text = link.html.text;
                         meta.h2.message = 'Found';
                         meta.h2.keywords = findKeywords(keywords, link.html.text);
                    } else if (link.specialCase === 'h3' || link.specialCase === 'h4' || link.specialCase === 'h5' || link.specialCase === 'h6') {
                         console.log('H13+', link);
                         meta[link.specialCase].push({
                              found: true,
                              element: link.html.tag,
                              text: link.html.text,
                              message: 'Found',
                              keywords: findKeywords(keywords, link.html.text)
                         })
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

          if (meta.title.found !== true) {
               metaIssueCount++
          }
          if (meta.description.found !== true) {
               metaIssueCount++
          }
          if (meta.h1.found !== true) {
               metaIssueCount++
          }
          if (meta.h2.found !== true) {
               metaIssueCount++
          }

          var resourceIssueCount = 0;
          //console.log('1');
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

          var commands = [];

          function createCommand(meta, metaKey, newScan, key, idx) {
               return {
                    "_id": sh.unique(idx + key + newScan.requestId),
                    "type": key,
                    "element": metaKey.element,
                    "found": metaKey.found,
                    "message": metaKey.message,
                    "keywords": metaKey.keywords,
                    "text": metaKey.text,
                    "requestId": newScan.requestId
               };
          }
          var count = 0;
          _.each(_.keys(meta), function (key, idx) {
               count++
               console.log('##META');
               if (typeof meta[key] === 'object' && typeof meta[key].length === 'undefined') {
                    console.log('metaKey[key]', meta[key]);
                    commands.push(createCommand(meta, meta[key], newScan, key, count));
               } else if (meta[key].length > 0) {
                    _.each(meta[key], function (header, _idx) {
                         count++
                         console.log('metaKey[key] header', header);
                         commands.push(createCommand(meta, header, newScan, key, count));
                    })
               }
          });
          // console.log('COMMANDS###', commands);
          utils.batchPut(metaData, commands, function (err, e) {
               console.log('err', e);
               if (err !== null) {

               }
          });

          //console.log('2', links);
          var linkIssueCount = 0;

          var tooManyLinks = (links && links.length >= 100) ? true : false;
          if (tooManyLinks) {
               linkIssueCount++
          }

          if (tooManyLinks === false &&
               linkIssueCount === 0 &&
               resourceIssueCount === 0 &&
               metaIssueCount === 0 &&
               (!newScan.emails || (newScan.emails && newScan.emails.length === 0))) {
               newScan.issues = {
                    requestId: newScan.requestId,
                    noIssues: true
               };
          } else {
               newScan.issues = {
                    requestId: newScan.requestId,
                    tooManyLinks: tooManyLinks,
                    links: linkIssueCount,
                    resources: resourceIssueCount,
                    security: (newScan.emails) ? newScan.emails.length : 0,
                    meta: metaIssueCount
               }
          }

          var issue = new Issue(newScan.issues);
          console.log('Issue', issue);
          utils.saveModel(issue, function (err) {
               console.log('--err', err);
          });

          var commands = [];
          _.each(newScan.emails, function (email) {
               commands.push({
                    "_id": sh.unique(email + newScan.requestId),
                    "type": 'email',
                    "message": 'plain:text:email',
                    "text": email,
                    "requestId": newScan.requestId
               });
          });

          utils.batchPut(Security, commands, function (err, e) {
               console.log('err', e);
               if (err !== null) {

               }
          })

          newScan.grade = {
               letter: 'B',
               message: 'grade:b:message'
          };
     }
     return newScan;
}

module.exports = processMetaData;
