var scrapeHtml = require("./scrapeHtml");
var parseHtml = require("./parseHtml");
var linkObj = require("./linkObj");
var excludeLink = require('./excludeLink');
var parseOptions = require("./parseOptions");
var q = require("q");

function enqueueLink(link, instance) {

     linkObj.resolve(link, instance.baseUrl, instance.options);

     var excludedReason = excludeLink(link, instance);

     if (excludedReason !== false) {
          link.html.offsetIndex = instance.excludedLinks++;
          link.excluded = true;
          link.excludedReason = excludedReason;
          linkObj.clean(link);
          return;
     }

     link.html.offsetIndex = link.html.index - instance.excludedLinks;
     link.excluded = false;

     if (instance.linkEnqueued instanceof Error) { // TODO :: is this redundant? maybe use `linkObj.invalidate()` in `excludeLink()` ?
          link.broken = true;
          link.brokenReason = instance.linkEnqueued.message === "Invalid URI" ? "BLC_INVALID" : "BLC_UNKNOWN"; // TODO :: update limited-request-queue to support path-only URLs
          linkObj.clean(link);
     }
}

var RobotDirectives = require("robot-directives");

function scan(html, baseUrl, robots, instance) {
    //console.log('app/actions/sniff/linkChecker/initScrapeHtml.js scan html:',html,'baseUrl:',baseUrl,'robots:',robots,'instance:',instance);

     var promise = q.defer();
     var tree;
     var thisObj = this;

     instance.baseUrl = baseUrl;
     instance.robots = robots;

     parseHtml(html).then(function (document) {
          tree = document;
          return scrapeHtml(document, robots);
     }).then(function (links) {
          //console.log('app/actions/sniff/linkChecker/initScrapeHtml.js parseHtml:links',links)
          instance.foundLinks = links;
          instance._tree = tree;

          if (typeof instance !== 'undefined' || typeof instance.foundLinks === 'undefined' || instance.foundLinks === null || instance.foundLinks.length === 0) {
               return promise.resolve(instance);
          }

          _.each(links, function (link) {
               enqueueLink(link, instance);
          });

          instance.parsed = true;
          promise.resolve(instance);

     }).catch(function (err) {
          promise.reject({
               status: 'error',
               message: err
          });
     });

     return promise.promise;
};

function _scan(html, url, headers) {
     function Instance() {
          this.active = false;
          this.baseUrl = undefined;
          this.excludedLinks = 0;
          this.linkEnqueued = null;
          this.parsed = false;
          this.robots = null;
          this.options = parseOptions({});
          this.currentResponse = {};
     }
     var instance = new Instance();
     instance.baseUrl = url;
     instance.currentResponse = html;
     instance.currentRobots = new RobotDirectives({
          userAgent: instance.options.userAgent /* Is default what we want? */
     });
     return scan(html, url, instance.currentRobots, instance);
}

module.exports = _scan;
