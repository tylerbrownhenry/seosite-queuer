require('dotenv').config();
var dynamoose = require('dynamoose');
dynamoose.AWS.config.update({
     region: "us-west-2",
     endpoint: process.env.AWS_DYNAMODB_ENDPOINT
});

// var AWS = require("aws-sdk");
//
// AWS.config.update({
//      region: "us-west-2",
//      endpoint: process.env.AWS_DYNAMODB_ENDPOINT
// });
//
// var dynamodb = new AWS.DynamoDB();
//
// var params = {
//      TableName: "Request"
// };
//
// dynamodb.deleteTable(params, function (err, data) {
//      if (err) {
//           console.error("Unable to delete table. Error JSON:", JSON.stringify(err, null, 2));
//      } else {
//           console.log("Deleted table. Table description JSON:", JSON.stringify(data, null, 2));
//      }
// })
// dynamodb.createTable(params);

// var express = require('express');
// var app = express();
// var bodyParser = require('body-parser');
// var morgan = require('morgan');
// var io = require('socket.io');
// var q = require('q');
// var _ = require('underscore');
var dynamoose = require('dynamoose');
// var jwt = require('jsonwebtoken');
// var sh = require("shorthash");
var AWS = require('aws-sdk');
var s3 = new AWS.S3({
     region: process.env.AWS_REGION
});

process.on('uncaughtException', function (err) {
     // handle the error safely
     console.log('uncaughtException', err)
})

// var notify = require('./app/actions/callback');
// var publisher = require('./app/amqp-connections/publisher');
// var requests = require('./app/settings/requests');
var amqpConnection = require('./app/amqp-connections/amqp');
// var User = require('./app/models/user');
// var requestSchema = require('./app/models/request');
// module.exports = dynamoose.model('Request', requestSchema);

// var permissions = {
//  free: require('./app/permissions/freeUserPermissions'),
//  paid: require('.app/permissions/paidUserPermissions')
// }

var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
     for (var i = 0; i < numCPUs; i++) {
          // Create a worker
          cluster.fork();
     }
} else {
     var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
     //  mongoose.connect(process.env.MONGO_URL + '/' + process.env.MONGO_DB); // connect to database
     //
     //  mongoose.connection.on('connected', function () {
     //       console.log('Mongoose default connection open to ');
     //  });
     //
     //  mongoose.connection.on('error', function (err) {
     //       console.log('Mongoose default connection error: ' + err);
     //  });

     //  app.set('superSecret', process.env.SECRET);
     //  app.use(bodyParser.urlencoded({
     // extended: false
     //  })); // use body parser so we can get info from POST and/or URL parameters
     //  app.use(bodyParser.json());
     //  app.use(morgan('dev'));

     //  var apiRoutes = express.Router();
     //  app.all('*', function (req, res, next) {
     //       res.header('Access-Control-Allow-Origin', '*');
     //       res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
     //       // res.header('Access-Control-Allow-Headers', 'accept, content-type, application/x-www-form-urlencoded, x-www-form-urlencoded, x-parse-application-id, x-parse-rest-api-key, x-parse-session-token');
     //       res.header('Access-Control-Allow-Headers', '*');
     //       next();
     //  });

     // ---------------------------------------------------------
     // authenticated routes
     // ---------------------------------------------------------

     //  app.get('/refreshPermissions', function (req, res) {
     //       permissions.free.update({
     //            label: 'free'
     //       }, function (err) {
     //            if (err) {
     //                 res.json({
     //                      message: err
     //                 });
     //            }
     //            permissions.paid.update({
     //                 label: 'paid'
     //            }, function (err) {
     //                 if (err) {
     //                      res.json({
     //                           message: err
     //                      });
     //                 }
     //                 var message = 'Permissions updated saved successfully';
     //                 console.log(message);
     //                 res.json({
     //                      message: message
     //                 });
     //            });
     //       });
     //  });

     //  apiRoutes.get('/', function (req, res) {
     //       res.json({
     //            message: 'Yo!' + JSON.stringify(req.body)
     //       });
     //  });

     //  app.use('/api', apiRoutes);
     //
     //  var server = app.listen(port, function () {
     //       console.log('Express server listening on port ' + server.address().port);
     //  });

     amqpConnection();

     //  apiRoutes.post('/v1/deleteCaptures', function (req, res) {
     //       console.log('delete!', req.body);
     //       res.json({
     //            message: 'deleting captures requested!'
     //       });
     //       requests._preFlight(req, res, ['token', 'uid', 'filename'], function (user, options) {
     //            console.log('here we are');
     //
     //            function deleteFile(filename) {
     //                 console.log('filename', filename);
     //                 var bucketInstance = new AWS.S3();
     //                 var params = {
     //                      Bucket: process.env.AWS_BUCKET_NAME,
     //                      Key: filename
     //                 };
     //                 bucketInstance.deleteObject(params, function (err, data) {
     //                      if (data) {
     //                           console.log("File deleted successfully", data);
     //                      } else {
     //                           console.log("Check if you have sufficient permissions : " + err);
     //                      }
     //                 });
     //            }
     //            deleteFile(req.body.filename.replace(/^.*[\\\/]/, ''))
     //       });
     //  });

     //  apiRoutes.post('/v1/capture', function (req, res) {
     //       res.json({
     //            message: 'Ok we got it from here!'
     //       });
     //       requests._preFlight(req, res, ['options', 'token', 'url', 'uid'], function (user, options) {
     //            console.log('we is in!');
     //            console.log('server.js _preFlight succees');
     //            var message = {
     //                 date: Date.now(),
     //                 user: user.uid,
     //                 url: req.body.url,
     //                 options: options
     //            }
     //            var requestId = sh.unique(JSON.stringify(message));
     //            message.requestId = requestId;
     //            User.collection.findOneAndUpdate({
     //                 uid: user.uid
     //            }, {
     //                 $inc: {
     //                      'activity.requests.monthly.count': 1,
     //                      'activity.requests.daily.count': 1
     //                 }
     //            }, function (err, user) {
     //                 console.log('user', err, 'user', user)
     //            });
     //            publisher.publish("", "capture", new Buffer(JSON.stringify(message))).then(function (re) {
     //                 console.log('server.js publisher.publish succees');
     //                 notify({
     //                      message: 'Starting Capture!',
     //                      uid: user.uid,
     //                      page: req.body.page,
     //                      type: req.body.type,
     //                      status: 'pending',
     //                      temp_id: req.body.temp_id,
     //                      i_id: requestId
     //                 });
     //            }).catch(function (err) {
     //                 console.log('server.js publisher.publish err', err);
     //                 notify({
     //                      message: JSON.stringify(err.message),
     //                      title: 'Server Error',
     //                      uid: user.uid,
     //                      page: req.body.page,
     //                      type: req.body.type,
     //                      status: 'error',
     //                      temp_id: req.body.temp_id,
     //                      i_id: requestId
     //                 });
     //            });
     //       });
     //  });

     //  apiRoutes.post('/v1/freeScan', function (req, res) {
     //       res.json({
     //            message: 'Ok we got it from here!'
     //       });
     //       requests._preFlight(req, res, ['url', 'uid', 'token'], function (user, options) {
     //            console.log('we is in!');
     //            var message = {
     //                 date: Date.now(),
     //                 user: req.body.uid,
     //                 url: req.body.url,
     //                 options: {
     //                      free: true
     //                 }
     //            }
     //            var requestId = sh.unique(JSON.stringify(message));
     //            message.requestId = requestId;
     //            console.log('server.js _preFlight succees', message);
     //            publisher.publish("", "freeSummary", new Buffer(JSON.stringify(message))).then(function (re) {
     //                 console.log('server.js publisher.publish succees');
     //                 notify({
     //                      message: 'Starting Scan!',
     //                      uid: user.uid,
     //                      page: req.body.page,
     //                      type: req.body.type,
     //                      status: 'pending',
     //                      temp_id: req.body.temp_id,
     //                      i_id: requestId
     //                 });
     //            }).catch(function (err) {
     //                 console.log('server.js publisher.publish err', err);
     //                 notify({
     //                      message: JSON.stringify(err.message),
     //                      uid: user.uid,
     //                      page: req.body.page,
     //                      title: 'Server Error',
     //                      type: req.body.type,
     //                      status: 'error',
     //                      temp_id: req.body.temp_id,
     //                      i_id: requestId
     //                 });
     //            });
     //       });
     //  });

     //  apiRoutes.post('/v1/queue', function (req, res) {
     //       res.json({
     //            message: 'Ok we got it from here!'
     //       });
     //       requests._preFlight(req, res, ['options', 'token', 'url', 'uid'], function (user, options) {
     //            console.log('we is in!');
     //            var message = {
     //                 date: Date.now(),
     //                 user: user.uid,
     //                 url: req.body.url,
     //                 options: JSON.parse(req.body.options)
     //            }
     //            var requestId = sh.unique(JSON.stringify(message));
     //            var requestDate = Date.now();
     //            message.requestId = requestId;
     //            console.log('server.js _preFlight succees', message);
     //            var _request = new Request({
     //                 url: message.url,
     //                 uid: message.user,
     //                 options: message.options,
     //                 requestId: message.requestId,
     //                 requestDate: requestDate,
     //                 processes: 0,
     //                 status: 'init'
     //            });
     //
     //            _request.save(function (err, result) {
     //                 console.log('err', err, 'result', result);
     //                 publisher.publish("", "pageScan", new Buffer(JSON.stringify(message))).then(function (re) {
     //                      console.log('server.js publisher.publish succees');
     //                      notify({
     //                           message: 'Starting Scan!',
     //                           uid: user.uid,
     //                           page: req.body.page,
     //                           type: req.body.type,
     //                           requestDate: requestDate,
     //                           status: 'pending',
     //                           temp_id: req.body.temp_id,
     //                           i_id: requestId
     //                      });
     //                 }).catch(function (err) {
     //                      console.log('server.js publisher.publish err', err);
     //                      notify({
     //                           message: JSON.stringify(err.message),
     //                           uid: user.uid,
     //                           page: req.body.page,
     //                           type: req.body.type,
     //                           status: 'error',
     //                           temp_id: req.body.temp_id,
     //                           i_id: requestId
     //                      });
     //                 });
     //            });
     //       });
     //  });
}
