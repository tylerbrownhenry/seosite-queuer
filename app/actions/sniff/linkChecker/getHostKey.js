"use strict";
var isBrowser = require("is-browser");
var _ = require("underscore");
var parseDomain, parseUrl;

if (isBrowser === true) {
     parseDomain = function () {
          return null
     };
     parseUrl = require("url-parse");
} else {
     parseDomain = require("parse-domain");
     parseUrl = require("url").parse;
}

function getHostKey(url, options) {
     var domainObj, port, protocol, urlObj;
     var key = "";

     if (typeof url === "string") {
          urlObj = parseUrl(url);
     } else {
          urlObj = url;
     }
     protocol = urlObj.protocol;
     // Not using strict equals because `urlObj` might be a foreign object type
     if (!protocol || !urlObj.hostname) {
          urlObj = urlObj.parsed;
          protocol = urlObj.protocol;
          if (!protocol || !urlObj.hostname) {
               return false;
          }
     }
     // Remove ":" suffix
     if (protocol.indexOf(":") === protocol.length - 1) {
          protocol = protocol.substr(0, protocol.length - 1);
     }

     port = urlObj.port;

     // Get default port
     if (port == null && options.defaultPorts[protocol] !== undefined) {
          port = options.defaultPorts[protocol];
     }

     if (options.ignoreSchemes === false) {
          key += protocol + "://";
     }

     if (options.ignoreSubdomains === false) {
          key += urlObj.hostname;
     } else {
          domainObj = parseDomain(urlObj.hostname);

          //console.log('domainObj',domainObj,'urlObj',urlObj.hostname);
          if (domainObj === null) {
               key += urlObj.hostname;
          } else {
               key += domainObj.domain + "." + domainObj.tld;
          }
     }

     if (options.ignorePorts === false && port != null) {
          key += ":" + port;
     }

     key += "/";

     return key;
}

module.exports = getHostKey;
