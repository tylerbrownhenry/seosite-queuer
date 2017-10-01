let _ = require('underscore'),
     q = require('q'),
     dynamoose = require('dynamoose'),
     utils = require('../../../utils'),
     requestSchema = require('../../../models/request'),
     Request = dynamoose.model('Request', requestSchema),
     processHar = require('./method/processHar'),
     processUrl = require('./method/processUrl');

function saveAsActive(opts,status) {
     let promise = q.defer();
     utils.updateBy(Request, {
          requestId: opts.requestId
     }, {
          $PUT: {
               status: status || 'active'
          }
     }, (err) => {
          if (err !== null) {
               promise.reject();
          } else {
               promise.resolve(opts);
          }
     });
     return promise.promise;
}

module.exports = {
     saveAsActive: saveAsActive,
     processHar: processHar,
     processUrl: processUrl
};
