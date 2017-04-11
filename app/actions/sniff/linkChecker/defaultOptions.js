"use strict";
require('dotenv').config();
var userAgent = require("default-user-agent");

var defaultOptions = {
     acceptedSchemes: {
          "http": true,
          "https": false
     },
     cacheExpiryTime: 3600000,
     cacheResponses: true,
     excludedKeywords: [],
     defaultPorts: ['https', 'http'],
     excludedSchemes: ["data", "geo", "javascript", "mailto", "sms", "tel"],
     excludeExternalLinks: true,
     excludeInternalLinks: false,
     excludeLinksToSamePage: true,
     filterLevel: 1,
     // filterLevels = {
     //     0: true, // clickable links
     //     1: true, // clickable links, media, iframes, meta refreshes
     //     2: true, // clickable links, media, iframes, meta refreshes, stylesheets, scripts, forms
     //     3: true, // clickable links, media, iframes, meta refreshes, stylesheets, scripts, forms, metadata
     // }
     honorRobotExclusions: true,
     maxSockets: Infinity,
     maxSocketsPerHost: 1,
     rateLimit: 0,
     requestMethod: "head",
     retry405Head: true,
     tags: require("./tags"),
     userAgent: userAgent(process.env.USER_AGENT_NAME, process.env.USER_AGENT_NAME)
};

module.exports = defaultOptions;
