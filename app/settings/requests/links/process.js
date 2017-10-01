var dynamoose = require('dynamoose'),
     linkSchema = require("../../../models/link"),
     Link = dynamoose.model('Link', linkSchema),
    //  _updateCount = require("../page/updateCount"),
     publisher = require('../../../amqp-connections/publisher'),
     _ = require('underscore'),
     sh = require('shorthash'),
     utils = require('../../../utils'),
     q = require('q');

function broadcast(deferred, requestId, url, commands, linkObj, processes) {
     _.each(commands, function (command) {
          let id = command._id,
          buffer = new Buffer(JSON.stringify({
               url: command.resolvedUrl,
               requestId: command.requestId,
               linkId: command._id,
               baseUrl: url,
               _link: linkObj[id],
               action: 'checkLinks',
               command: 'process'
          }));
          publisher.publish("", "actions", buffer);
     });
     deferred.resolve();
}

function init(data){
  let deferred = q.defer(),
     commands = data.params.commands,
     siteUrl = data.params.siteUrl,
     requestId = data.params.requestId,
     linkObj = data.params.linkObj;
     utils.batchPut(Link, commands, (err, e) => {
          if (err !== null) {
               console.log('checkLinks batchPut error',err);
               deferred.reject();
          } else {
            broadcast(deferred, requestId, siteUrl, commands, linkObj);
          }
     });
     return deferred.promise;
}

/**
 * saves any link found during scan in database, and marks it on the scan object
 * @param  {Object} input message from rabbitMQ
 * @param  {Object} res   scan response object
 * @return {Promise}
 */
function publish(data) {
     let input = data.params.input,
          res = data.params.res,
          newScan = data.params.newScan,
          deferred = q.defer(),
          requestId = input.requestId,
          parentLink = newScan.url.url,
          commands = [],
          linkObj = {},
          links = res.links;

     res.links = undefined;
     res.linkCount = links.length;

     _.each(links, (link) => {
          if (link.url) {
               var linkId = sh.unique(link.url.original + requestId);
               if (typeof linkObj[linkId] === 'undefined') {
                    commands.push({
                         "_id": linkId,
                         "found": Date(),
                         "linkId": linkId,
                         "attrs": link.html.attrs,
                         "resolvedUrl": parentLink,
                         "requestId": requestId,
                         "scanned": null,
                         "status": 'pending',
                         "site": parentLink,
                        //  "uid": input.uid,
                         "url": link.url.original,
                    });
                    link._id = linkId;
                    linkObj[linkId] = link;
               }
          }
     });
     deferred.resolve({
       linkObj: linkObj,
       commands:commands
     });
     return deferred.promise;
};

module.exports.process = require('./method/process').process;
module.exports.publish = publish;
module.exports.init = init;
