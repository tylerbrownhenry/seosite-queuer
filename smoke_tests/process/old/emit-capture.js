var arr = ['webmagnat.ro',
'nickelfreesolutions.com',
'scheepvaarttelefoongids.nl',
'tursan.net',
'plannersanonymous.com',
'doing.fr',
'saltstack.com',
'deconsquad.com',
'migom.com',
'tjprc.org',
'worklife.dk',
'inno-make.com'];

require('dotenv').config();
var dynamoose = require('dynamoose');
dynamoose.AWS.config.update({
     region: "us-west-2",
     endpoint: process.env.AWS_DYNAMODB_ENDPOINT
});

var dynamoose = require('dynamoose');
var AWS = require('aws-sdk');
var s3 = new AWS.S3({
     region: process.env.AWS_REGION
});

var amqpConnection = require('../../app/amqp-connections/amqp');

amqpConnection();


var publish = require('../../app/settings/requests/capture/publish');

_.each(arr, function (e) {
consoe.log('test',e);
     publish({
          uid: 'Z1pErb',
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
          requestId: 'Z1pErb'
     }, {
          url: {
               url: 'http://www.mariojacome.com'
          }
     });

});
