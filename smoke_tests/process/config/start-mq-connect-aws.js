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
var amqpConnection = require('../../../app/amqp-connections/amqp');
var fs = require('fs');
amqpConnection();

module.exports = function(debugName){
  fs.closeSync(fs.openSync('./smoke_tests/' + debugName + '.txt', 'w'));
}
