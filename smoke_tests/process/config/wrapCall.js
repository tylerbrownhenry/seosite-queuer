let q = require('q'),
     dynamoose = require('dynamoose'),
     requestSchema = require('../../../app/models/request'),
     Request = dynamoose.model('Request', requestSchema),
     Scan = require('../../../app/models/scan'),
     utils = require('../../../app/utils');

module.exports = {
     before: function (requestId,processes) {
          let deferred = q.defer(),
               command = {
                    requestId: requestId
               },
               scan = new Scan(command),
               request = new Request({
                    processes: (typeof processes !== 'undefined')? processes : 1,
                    requestId: requestId
               });
          Request.delete({
               requestId: requestId
          }, function (err) {
               if (err === null) {
                    request.save(function (err) {
                         if (err === null) {
                              Scan.delete({
                                   requestId: requestId
                              }, function (err) {
                                   if (err === null) {
                                        scan.save(function (err) {
                                             if (err === null) {
                                                  deferred.resolve()
                                             } else {
                                                  deferred.reject();
                                             }
                                        });
                                   } else {
                                        deferred.reject();
                                   }
                              });
                         } else {
                              deferred.reject();
                         }
                    });
               } else {
                    deferred.reject();
               }
          });
          return deferred.promise;
     },
     after: function (passed, requestId, validRequest, validScan) {
          let command = {
                    requestId: requestId
               },
               deferred = q.defer();
          utils.findBy(Scan, command, (err, res) => {
               if (res) {
                    passed = validScan(res, passed);
                    utils.findBy(Request, command, (err, res) => {
                         if (res) {
                              passed = validRequest(res, passed);
                              deferred.resolve(passed);
                         } else {
                              deferred.reject('trouble opening request');
                         }
                    });
               } else {
                    deferred.reject('trouble opening scan');
               }
          });
          return deferred.promise;
     }
}
