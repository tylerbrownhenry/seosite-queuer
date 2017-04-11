var args = process.argv.slice(2);

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

var utils = require('./app/utils');
var publisher = require('./app/amqp-connections/publisher');
var amqpConnection = require('./app/amqp-connections/amqp');
amqpConnection(function () {
     var RequestSchema = require('./app/models/request');
     var Request = dynamoose.model('Request', RequestSchema);
     utils.findBy(Request, {
          requestId: args[0]
     }, function (err, res) {
          publisher.publish("", "summary", new Buffer(JSON.stringify(res))).then(function (e) {
          });
     });
});
