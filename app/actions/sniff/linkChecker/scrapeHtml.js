"use strict";
var linkObj = require("./linkObj");

var tags = require("./tags");
var q = require("Q");
var _ = require("underscore");

var condenseWhitespace = require("condense-whitespace");
var parseMetaRefresh = require("http-equiv-refresh");
var RobotDirectives = require("robot-directives");
var keywordAnalyzer = require('keyword-analyzer')
var maxFilterLevel = tags[tags.length - 1];
var textHtml = '';
var hasFlash = false;
var hasIframe = false;
var hasInlineStyles = false;
var hasScriptsTags = false;
var hasViewPorts = false;
var hasStyleTag = false;
var foundDeprecatedTags = {};
var bodyChildrenPaths = {};
var excludedPaths = {};
var pageHtml;
var hasPrintCSS = false;
var w3cResponse = false;
var faviconUrl = {
     default: 'favicon.ico',
     alt: null
};
var pageCharset = null;

/*
    Scrape a parsed HTML document/tree for links.
*/
function scrapeHtml(document, robots, requestId) {
     var promise = q.defer();
     w3cResponse = false;
     hasPrintCSS = false;
     pageCharset = null;
     pageHtml = '';
     textHtml = '';
     hasFlash = false;
     hasViewPorts = false;
     hasIframe = false;
     hasInlineStyles = false;
     hasScriptsTags = false;
     hasStyleTag = false;
     foundDeprecatedTags = {},
          faviconUrl = {
               default: 'favicon.ico',
               alt: null
          };
     var link, links, preliminaries, rootNode;
     var title = '';
     var description = '';
     rootNode = findRootNode(document);

     if (rootNode != null) {
          preliminaries = findPreliminaries(rootNode, robots);
          links = [];

          findLinks(rootNode, function (node, attrName, url, specialCase) {
               link = linkObj(url);
               if (link && link.html) {
                    link.html.attrs = node.attrMap;
                    link.html.attrName = attrName;
                    link.html.base = preliminaries.base;
                    link.html.index = links.length;
                    if (node && node.__location && node.__location.attrs) {
                         link.html.location = node.__location.attrs[attrName];
                    }
                    link.html.selector = getSelector(node);
                    link.html.tag = stringifyNode(node);
                    link.html.tagName = node.nodeName;
                    link.html.text = getText(node);
                    if (typeof specialCase !== 'undefined') {
                         link.specialCase = specialCase;
                    }
               }

               links.push(link);
          });
     }

     var keywords = keywordAnalyzer.wrest(textHtml, {
          frequency: true,
          stopWords: [''],
          limit: 5
     });

     var keyObj = {};
     _.each(keywords, function (keyword) {
          var key = _.keys(keyword)[0];
          keyObj['_' + key.toLowerCase()] = {
               key: key,
               count: keyword[key]
          }
     });


     promise.resolve({
          links: links,
          html: {
               contrib: {
                    inlineStyles: hasInlineStyles,
                    scriptTags: hasScriptsTags,
                    styleTags: hasStyleTag
               },
               hasFlash: hasFlash,
               hasViewPorts: hasViewPorts,
               hasIframe: hasIframe,
               faviconUrl: faviconUrl,
               hasPrintCSS: hasPrintCSS,
               pageCharset: pageCharset,
               textToHtml: 0,
               htmlLength: 0,
               // w3cResponse: response,
               deprecatedHtml: (_.keys(foundDeprecatedTags) > 0) ? foundDeprecatedTags : false,
               textLength: textHtml.length,
               keywords: keyObj
          }
     });

     //  });
     return promise.promise;
}

//::: PRIVATE FUNCTIONS

var deprecatedTags = {
     'applet': 0,
     'basefont': 0,
     'center': 0,
     'dir': 0,
     'font': 0,
     'isindex': 0,
     'menu': 0,
     's': 0,
     'strike': 0,
     'u': 0,
     'iframe': 0 // Special Case
};

// check for favicon
// <link rel="shortcut icon" href="favicon.ico" type="image/x-icon">
// <link rel="icon" href="favicon.ico" type="image/x-icon">
// root favicon.ico <-- Publish to links

function checkForFlash(node) {
     if (hasFlash === true) {
          return;
     }
     if (node && node.nodeName === 'embed') {
          if (node.attrs) {
               _.each(node.attrs, function (attr) {
                    if (attr.name === 'src' & attr.value && attr.value.indexOf('.swf') > -1) {
                         hasFlash = true;
                    }
               });
          }
     } else if (node && node.nodeName === 'object') {
          if (node.attrs) {
               _.each(node.attrs, function (attr) {
                    if (attr.name === 'data' & attr.value && attr.value.indexOf('.swf') > -1) {
                         hasFlash = true;
                    }
               });
          }
          if (hasFlash !== true && node.childNodes) {
               _.each(node.childNodes, function (child) {
                    if (child && child.nodeName === 'param') {
                         var foundKey = false;
                         var foundValue = false;
                         _.each(child.attrs, function (attr) {
                              if (attr && attr.name === 'name' && (attr.value === 'movie' || attr.value === 'src')) {
                                   foundKey = true;
                              } else if (attr && attr.name === 'value' && attr.value.indexOf('.swf') > -1) {
                                   foundValue = true;
                              }
                         });
                         if (foundKey && foundValue) {
                              hasFlash = true;
                         }

                    }
               })
          }
     }
}

var excludedTags = {
     'style': function () {
          hasStyleTag = true;
     },
     'script': function (node) {
          if (node && node.attrs) {
               var hasSrc = false;
               _.each(node.attrs, function (attr) {
                    if (attr.name === 'src') {
                         hasSrc = true;
                    }
               });
               if (hasSrc === false) {
                    hasScriptsTags = true;
               }
          }
     },
     'svg': true,
     '#comment': true,
     'link': true,
     'meta': true
};

function checkIfDeprecated(node) {
     if (node && node.nodeName && typeof deprecatedTags[node.nodeName] !== 'undefined') {
          if (node.nodeName === 'iframe') {
               return hasIframe = true;
          }
          if (typeof foundDeprecatedTags[node.nodeName] == 'undefined') {
               foundDeprecatedTags[node.nodeName] = 0;
          }
          foundDeprecatedTags[node.nodeName]++
     }
}

function checkIfExcluded(node) {
     if (node.__location && excludedPaths[node.__location.line + ':' + node.__location.col]) {
          return true;
     } else if (node.__location && excludedTags[node.nodeName]) {
          if (typeof excludedTags[node.nodeName] === 'function') {
               excludedTags[node.nodeName](node);
          }
          excludedPaths[node.__location.line + ':' + node.__location.col] = true;
          return true;
     } else if (node.parentNode) {
          return checkIfExcluded(node.parentNode);
     } else {
          return false;
     }
}

function cycleAttributes(node) {
     var obj = {
          favicon: {
               found: false,
               href: null
          },
          charset: {
               isCharset: false,
               value: null
          }
     }

     if (node && node.nodeName) {
          var href = null;
          var foundFavicon = false;
          if (node && node.attrs) {
               _.each(node.attrs, function (attr) {
                    if (attr && attr.name && typeof attr.value === 'string') {
                         obj.favicon = checkIfFavicon(node, attr, obj.favicon);
                         obj.charset = checkIfChartSet(node, attr, obj.charset);
                         checkIfPrintCSS(node, attr);
                    }
               });
          }
     }
     if (obj.favicon.found === true && obj.favicon.href !== null) {
          faviconUrl.alt = obj.favicon.href;
     }
     if (obj.charset.isCharset === true && obj.charset.value !== null) {
          pageCharset = obj.charset.value;
     }
}

function checkIfPrintCSS(node, attr) {
     if (node.nodeName === 'style' || node.nodeName === 'link') {
          if (attr.name === 'media' && attr.value.toLowerCase() === 'print') {
               hasPrintCSS = true;
          }
     }
}

function checkIfFavicon(node, attr, obj) {
     if (faviconUrl.alt === null) {
          if (node.nodeName === 'link') {
               if (attr.name === 'href') {
                    obj.href = attr.value;
               } else if (attr.name === 'rel' && attr.value.indexOf('icon') > -1) {
                    obj.found = true;
               }
          }
     }
     return obj;
}

function checkIfChartSet(node, attr, obj) {
     if (pageCharset === null) {
          if (node.nodeName === "meta") {
               if (attr.name === "charset") {
                    pageCharset = attr.value;
               }
               if (attr.name === 'http-equiv') {
                    if (attr.value.toLowerCase() === 'content-type') {
                         obj.isCharset = true;
                    }
               }
               if (attr.name === 'content') {
                    obj.value = attr.value;
               }

          }
     }
     return obj;
}

function checkIfChildOfBody(node) {
     if (node && node.parentNode) {
          /* Has Parents */
          var parent = node.parentNode;

          var parentLocal = (parent.__location) ? parent.__location : {
               val: false
          };
          var nodeLocal = (node.__location) ? node.__location : {
               val: false
          };
          var parentIsChildOfBody = bodyChildrenPaths[parentLocal.line + ':' + parentLocal.col];
          var parentIsBody = parent.nodeName === 'body';
          var nodeIsChild = nodeLocal.val !== false;
          var aParentIsBody = false;

          if (parentIsBody !== true && parentIsChildOfBody !== true && nodeIsChild) {
               aParentIsBody = checkIfChildOfBody(parent);
          }

          var excluded = checkIfExcluded(node);

          if ((nodeIsChild && excluded !== true) && (parentIsChildOfBody || parentIsBody || aParentIsBody)) {
               /* Parent already marked as child of body */
               bodyChildrenPaths[node.__location.line + ':' + node.__location.col] = true;
               return true;
          } else {
               /* None of the parents was a child of body or body */
               return false;
          }
     } else {
          /* Has no parents */
          return false;
     }
}

/*
    Traverses the root node to locate links that match filters.
*/
function findLinks(rootNode, callback) {
     var attrName, i, link, linkAttrs, numAttrs = 0,
          url;

     walk(rootNode, function (node) {
          checkIfDeprecated(node);
          cycleAttributes(node);
          node.childOfBody = checkIfChildOfBody(node);
          linkAttrs = maxFilterLevel[node.nodeName];
          if (node.childOfBody) {
               checkForFlash(node);
               if (node.nodeName === '#text') {
                    var text = node.value;
                    text = text.replace(/(\r\n|\n|\r|\t)/gm, "");
                    textHtml += text;
               } else if (hasStyleTag !== true && node.nodeName === 'script') {
                    hasStyleTag = true;
               } else if (hasInlineStyles !== true && linkAttrs === null && node.attrs) {
                    _.each(node.attrs, function (attr) {
                         if (attr.name === 'style') {
                              hasInlineStyles = true;
                         }
                    });
               }
          }

          // If a supported element
          if (linkAttrs != null) {
               if (node && node.attrs) {
                    numAttrs = node.attrs.length;
               }

               // Faster to loop through Arrays than Objects
               for (i = 0; i < numAttrs; i++) {
                    if (node && node.attrs && node.attrs[i]) {
                         attrName = node.attrs[i].name;
                         if (attrName === 'style') {
                              hasInlineStyles = true;
                         }
                    }
                    url = null;

                    // If a supported attribute
                    if (linkAttrs[attrName] === true) {
                         // Special case for `<meta http-equiv="refresh" content="5; url=redirect.html">`
                         if (node.nodeName === "meta" && attrName === "content") {
                              if (node.attrMap["http-equiv"] != null && node.attrMap["http-equiv"].toLowerCase() === "refresh") {
                                   url = parseMetaRefresh(node.attrMap[attrName]).url;
                              }
                         } else if (node.nodeName === "meta" && attrName === "name" && node.attrs[i].value.toLowerCase() === "viewport") {
                              hasViewPorts = true;
                         } else if (node.nodeName === "meta" && attrName === "name" && node.attrs[i].value === "description") {
                              //console.log('node3', node.attrs)

                              callback(node, attrName, url, 'description');
                         } else {
                              // https://html.spec.whatwg.org/multipage/infrastructure.html#valid-url-potentially-surrounded-by-spaces
                              url = node.attrMap[attrName].trim();
                         }

                         if (url != null) {
                              callback(node, attrName, url);
                         }
                    }
               }
          } else if (node.nodeName === 'title') {
               callback(node, attrName, '', 'title');
          } else if (node.nodeName === 'h1') {
               callback(node, attrName, '', 'h1');
          } else if (node.nodeName === 'h2') {
               callback(node, attrName, '', 'h2');
          } else if (node.nodeName === 'h3') {
               callback(node, attrName, '', 'h3');
          } else if (node.nodeName === 'h4') {
               callback(node, attrName, '', 'h4');
          } else if (node.nodeName === 'h5') {
               callback(node, attrName, '', 'h5');
          } else if (node.nodeName === 'h6') {
               callback(node, attrName, '', 'h6');
          }
     });
}

/*
    Traverses the root node to locate preliminary elements/data.

    <base href/>

        Looks for the first instance. If no `href` attribute exists,
        the element is ignored and possible successors are considered.

    <meta name content/>

        Looks for all robot instances and cascades the values.
*/
function findPreliminaries(rootNode, robots) {
     var name;
     var find = {
          base: true,
          robots: robots != null
     };
     var found = {
          base: false
     };
     var result = {
          base: null
     };

     walk(rootNode, function (node) {
          switch (node.nodeName) {
               // `<base>` can be anywhere, not just within `<head>`
          case "base":
               {
                    if (find.base === true && found.base === false && node.attrMap.href != null) {
                         // https://html.spec.whatwg.org/multipage/infrastructure.html#valid-url-potentially-surrounded-by-spaces
                         result.base = node.attrMap.href.trim();
                         found.base = true;
                    }

                    break;
               }
               // `<meta>` can be anywhere
          case "meta":
               {
                    if (find.robots === true && node.attrMap.name != null && node.attrMap.content != null) {
                         name = node.attrMap.name.trim().toLowerCase();

                         switch (name) {
                         case "description":
                         case "keywords":
                              {
                                   break;
                              }
                              // Catches all because we have "robots" and countless botnames such as "googlebot"
                         default:
                              {
                                   if (name === "robots" || RobotDirectives.isBot(name) === true) {
                                        robots.meta(name, node.attrMap.content);
                                   }
                              }
                         }
                    }
                    break;
               }
          }

          if (found.base === true && find.robots === false) {
               // Kill walk
               return false;
          }
     });

     return result;
}

/*
    Find the `<html>` element.
*/
function findRootNode(document) {
     var i;
     var rootNodes = document.childNodes;

     for (i = 0; i < rootNodes.length; i++) {
          // Doctypes have no `childNodes` property
          if (rootNodes[i].childNodes != null) {
               return rootNodes[i];
          }
     }
}

/*
    Find a node's `:nth-child()` index among its siblings.
*/
function getNthIndex(node) {
     var child, i;
     var count = 0;
     var parentsChildren = node.parentNode.childNodes;
     var numParentsChildren = parentsChildren.length;

     for (i = 0; i < numParentsChildren; i++) {
          child = parentsChildren[i];

          if (child !== node) {
               // Exclude text and comments nodes
               if (child.nodeName[0] !== "#") {
                    count++;
               }
          } else {
               break;
          }
     }

     // `:nth-child()` indices don't start at 0
     return count + 1;
}

/*
    Builds a CSS selector that matches `node`.
*/
function getSelector(node) {
     var name;
     var selector = [];

     while (node.nodeName !== "#document") {
          name = node.nodeName;

          // Only one of these are ever allowed -- so, index is unnecessary
          if (name !== "html" && name !== "body" & name !== "head") {
               name += ":nth-child(" + getNthIndex(node) + ")";
          }

          // Building backwards
          selector.push(name);

          node = node.parentNode;
     }

     return selector.reverse().join(" > ");
}

function getText(node) {
     var text = null;

     if (node.childNodes.length > 0) {
          text = "";

          walk(node, function (node) {
               if (node.nodeName === "#text") {
                    text += node.value;
               }
          });

          // TODO :: don't normalize if within <pre> ? use "normalize-html-whitespace" package if so
          text = condenseWhitespace(text);
     }

     return text;
}

/*
    Serialize an HTML node back to a string.
*/
function stringifyNode(node) {
     var result = "<" + node.nodeName;
     var numAttrs = 0;
     if (node && node.attrs) {
          numAttrs = node.attrs.length;
     }

     for (var i = 0; i < numAttrs; i++) {
          if (node && node.attrs) {
               result += " " + node.attrs[i].name + '="' + node.attrs[i].value + '"';
          }
     }

     result += ">";

     return result;
}

// TODO :: contribute these to npmjs.com/dom-walk
function walk(node, callback) {
     var childNode, i;

     if (callback(node) === false) return false;

     if (node.childNodes != null) {
          i = 0;
          childNode = node.childNodes[i];
     }

     while (childNode != null) {
          if (walk(childNode, callback) === false) return false;

          childNode = node.childNodes[++i];
     }
}

module.exports = scrapeHtml;
