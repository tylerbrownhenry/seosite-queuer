var arr = require('./config/website-list').slice(0, 300);
require('./config/start-mq-connect-aws')('pageScan');

var dynamoose = require('dynamoose');
var requestSchema = require('../../app/models/request');
var Request = dynamoose.model('Request', requestSchema);
var publisher = require('../../app/amqp-connections/publisher');
var sh = require('shorthash');
var _ = require('underscore');
return
_.each(arr, function (e) {

     broadcast({
          test: {
               filename: 'pageScan'
          },
          requestDate: 1503701497848,
          oid: 'ZzxprO',
          uid: 'tvUxg',
          url: e,
          source: undefined,
          requestType: 'embed:scan',
          scanGroup: 'default',
          options: {
               captures: undefined,
               links: undefined,
               security: undefined,
               type: 'page:scan',
               save: {
                    "resources": true,
                    "links": true,
                    "security": true,
                    "metaData": true,
                    "captures": true
               }
          },
          processes: 1,
          requestId: sh.unique(e)
     });
})

function broadcast(message) {
     message.requestId = sh.unique(JSON.stringify(message));
     var request = new Request(message);
     request.save(function (err, res) {
          publisher.publish("", "page:scan", new Buffer(JSON.stringify(message)));
     });
}
