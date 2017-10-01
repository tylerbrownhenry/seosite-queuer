var _ = require('underscore'),
     metaData = require('../../../models/metaData'),
     sh = require("shorthash"),
     q = require("q"),
     utils = require('../../../utils');
/**
 * looks through a string of text to see if contains a keyword
 * @param  {Object} keywords object of keys words
 * @param  {String} text
 * @return {Object} keywords found
 */
function findKeywords(keywords, text) {
     var foundWords = {};
     if (typeof text !== 'string' || text === null) {
          return foundWords;
     }
     var words = text.split(' ');
     _.each(words, function (word) {
          var cleanWord = word.toLowerCase();
          if (keywords['_' + cleanWord]) {
               foundWords['_' + cleanWord] = true;
          }
     });
     return foundWords;
}

function process(_input) {
    let input = _input.params,
    deferred = q.defer(),
    keywords = input.keywords,
    links = input.links;
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
          };

          links = _.filter(links, function (link) {
               if (typeof link.specialCase !== 'undefined') {
                    if (link.specialCase === 'title') {
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

          var commands = [];

          function createCommand(meta, metaKey, input, key, idx) {
               return {
                    "_id": sh.unique(idx + key + input.requestId),
                    "type": key,
                    "element": metaKey.element,
                    "found": metaKey.found,
                    "message": metaKey.message,
                    "keywords": metaKey.keywords,
                    "text": metaKey.text,
                    "requestId": input.requestId
               };
          }
          let count = 0
          _.each(_.keys(meta), function (key, idx) {
               count++;
               if (typeof meta[key] === 'object' && typeof meta[key].length === 'undefined') {
                    commands.push(createCommand(meta, meta[key], input, key, count));
               } else if (meta[key].length > 0) {
                    _.each(meta[key], function (header, _idx) {
                         count++;
                         commands.push(createCommand(meta, header, input, key, count));
                    })
               }
          });

          utils.batchPut(metaData, commands, function (err, e) {
               if (err !== null) {
                    console.log('checkMeta batchPut error',err);
                    deferred.reject({
                      commands:commands,
                    });
               } else {
                 deferred.resolve({
                   processes: 0
                 });
               }
          });
     return deferred.promise;
}

module.exports = {
  process: process,
  findKeywords: findKeywords
}
