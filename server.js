require('dotenv').config();
require('./epipebomb');

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

process.on('uncaughtException', function (err) {
     // handle the error safely
     console.log('uncaughtException', err)
})
var amqpConnection = require('./app/amqp-connections/amqp');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

var permissions = {
    free : require('./app/permissions/freeUserPermissions'),
    paid: require('./app/permissions/paidUserPermissions')
}

permissions.free.save()
permissions.paid.save()

// if (cluster.isMaster) {
    //  for (var i = 0; i < numCPUs; i++) {
          // Create a worker
          // cluster.fork();
    //  }
// } else {
     amqpConnection();
// }
