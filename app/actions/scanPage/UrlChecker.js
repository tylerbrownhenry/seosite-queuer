"use strict";

var checkUrl = require("./internal/checkUrl");
var linkObj = require("./internal/linkObj");
var parseOptions = require("./internal/parseOptions");
var isString = require("is-string");
var maybeCallback = require("maybe-callback");
// var UrlCache = require("./internal/urlcache");
var urlobj = require("urlobj");
var getHostKey = require("./internal/getHostKey");

var defaultOptions = {
     defaultPorts: {
          ftp: 21,
          http: 80,
          https: 443
     },
     ignorePorts: true,
     ignoreSchemes: true,
     ignoreSubdomains: true,
     maxSockets: Infinity,
     maxSocketsPerHost: 1,
     rateLimit: 0
};

function RequestQueue(options, handlers) {
     this.activeHosts = {}; // Socket counts stored by host
     this.items = {}; // Items stored by ID
     this.priorityQueue = []; // List of IDs

     this.activeSockets = 0;
     this.counter = 0;
     this.handlers = handlers || {};
     this.options = Object.assign({}, defaultOptions, options);
     this.paused = false;
}

RequestQueue.prototype.dequeue = function (id) {
     var item = this.items[id];
     var error;

     if (item === undefined || item.active === true) {
          return new Error("ID not found");
     }

     dequeue(item, this);
     remove(item, this);
     return true;
};

RequestQueue.prototype.enqueue = function (input) {
     var idOrError;

     // enqueue("url")
     if (typeof input === "string" || input instanceof String === true) {
          input = {
               url: input
          };
     }

     idOrError = enqueue(input, this);

     if (idOrError instanceof Error === false) {
          startNext(this);
     }

     return idOrError;
};

/*
    Add item to queue and item list.
*/
function enqueue(input, instance) {
     var hostKey = getHostKey(input.url, instance.options);
     var id = input.id;

     if (hostKey === false) {
          return new Error("Invalid URI");
     }

     if (id == null) id = instance.counter++;

     if (instance.items[id] !== undefined) {
          return new Error("Non-unique ID");
     }

     instance.items[id] = {
          active: false,
          hostKey: hostKey,
          id: id,
          input: input
     };
     instance.priorityQueue.push(id);

     return id;
}

RequestQueue.prototype.length = function () {
     return this.priorityQueue.length + this.activeSockets;
};

RequestQueue.prototype.numActive = function () {
     return this.activeSockets;
};

RequestQueue.prototype.numQueued = function () {
     return this.priorityQueue.length;
};

RequestQueue.prototype.pause = function () {
     this.paused = true;
};

RequestQueue.prototype.resume = function () {
     this.paused = false;
     startNext(this);
};

//::: PRIVATE FUNCTIONS

/*
    Call a class' event handler if it exists.
*/
function callHandler(handler, args, timeout) {
     if (typeof handler === "function") {
          if (timeout > 0) {
               setTimeout(function () {
                    handler.apply(null, args);

               }, timeout);
          } else {
               handler.apply(null, args);
          }
     }
}

/*
    Remove item (id) from queue, but nowhere else.
*/
function dequeue(item, instance) {
     var queueIndex = instance.priorityQueue.indexOf(item.id);

     if (queueIndex < 0) return false;

     instance.priorityQueue.splice(queueIndex, 1);

     return true;
}

/*
    Add item to queue and item list.
*/
function enqueue(input, instance) {
     var hostKey = getHostKey(input.url, instance.options);
     var id = input.id;

     if (hostKey === false) {
          return new Error("Invalid URI");
     }

     if (id == null) id = instance.counter++;

     if (instance.items[id] !== undefined) {
          return new Error("Non-unique ID");
     }

     instance.items[id] = {
          active: false,
          hostKey: hostKey,
          id: id,
          input: input
     };
     instance.priorityQueue.push(id);

     return id;
}

/*
    Generate a `done()` function for use in resuming the queue when an item's
    process has been completed.
*/
function getDoneCallback(item, instance) {
     return function () {
          instance.activeSockets--;

          remove(item, instance);

          startNext(instance);
     };
}

/*
    Remove item from item list and activeHosts.
*/
function remove(item, instance) {
     instance.activeHosts[item.hostKey]--;

     if (instance.activeHosts[item.hostKey] <= 0) {
          delete instance.activeHosts[item.hostKey];
     }

     delete instance.items[item.id];

     if (instance.priorityQueue.length <= 0 && instance.activeSockets <= 0) {
          instance.counter = 0; // reset

          callHandler(instance.handlers.end, []);
     }
}

/*
    Possibly start next request(s).
*/
function startNext(instance) {
     var availableSockets = instance.options.maxSockets - instance.activeSockets;
     var i = 0;
     var canStart, currItem, numItems;

     if (instance.paused === true) return;
     if (availableSockets <= 0) return;

     while (i < instance.priorityQueue.length) {
          canStart = false;
          currItem = instance.items[instance.priorityQueue[i]];

          // Not important, but feature complete
          if (instance.options.maxSocketsPerHost > 0) {
               if (instance.activeHosts[currItem.hostKey] === undefined) {
                    // Create key with first count
                    instance.activeHosts[currItem.hostKey] = 1;
                    canStart = true;
               } else if (instance.activeHosts[currItem.hostKey] < instance.options.maxSocketsPerHost) {
                    instance.activeHosts[currItem.hostKey]++;
                    canStart = true;
               }
          }

          if (canStart === true) {
               instance.activeSockets++;
               availableSockets--;

               currItem.active = true;

               dequeue(currItem, instance);

               callHandler(instance.handlers.item, [currItem.input, getDoneCallback(currItem, instance)], instance.options.rateLimit);

               if (availableSockets <= 0) break;
          } else {
               // Move onto next
               i++;
          }
     }
}

function UrlChecker(a, b) {
     var c = this;
     this.handlers = b || {};
     this.options = a = parseOptions(a);
     this.cache = {};
     this.linkQueue = new RequestQueue({
          maxSockets: this.options.maxSockets,
          maxSocketsPerHost: this.options.maxSocketsPerHost,
          rateLimit: this.options.rateLimit
     }, {
          item: function (a, b) {
               function d(d) {
                    maybeCallback(c.handlers.link)(d, a.data.customData);
                    b();
               }
               if (void 0 !== a.data.linkObj) {
                    checkUrl(a.data.linkObj, null, c.cache, c.options).then(d);
               } else {
                    checkUrl(a.data.orgUrl, a.data.baseUrl, c.cache, c.options).then(d);
               }
          },
          end: function () {
               maybeCallback(c.handlers.end)();
          }
     });
}

UrlChecker.prototype.clearCache = function () {
     // return this.cache.clear();
};

UrlChecker.prototype.dequeue = function (a) {
     return this.linkQueue.dequeue(a);
};

UrlChecker.prototype.enqueue = function (a, b, c) {
     if (false === isString(a) && true === a.broken_link_checker) return this.linkQueue.enqueue({
          url: a.url.parsed,
          data: {
               customData: c,
               linkObj: a
          }
     });
     else return this.linkQueue.enqueue({
          url: urlobj.resolve(b || "", urlobj.parse(a)),
          data: {
               orgUrl: a,
               baseUrl: b,
               customData: c
          }
     });
};

UrlChecker.prototype.numActiveLinks = function () {
     return this.linkQueue.numActive();
};

UrlChecker.prototype.numQueuedLinks = function () {
     return this.linkQueue.numQueued();
};

UrlChecker.prototype.pause = function () {
     return this.linkQueue.pause();
};

UrlChecker.prototype.resume = function () {
     return this.linkQueue.resume();
};

UrlChecker.prototype.__getCache = function () {
     return this.cache;
};

module.exports = UrlChecker;
