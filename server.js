var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var io = require('socket.io');
var q = require('q');
var _ = require('underscore');
var mongoose    = require('mongoose');
var jwt    = require('jsonwebtoken');
var sh = require("shorthash");
var AWS = require('aws-sdk');
var s3 = new AWS.S3({region: process.env.AWS_REGION});

process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log('uncaughtException',err)
})

require('dotenv').config();

var notify = require('./actions/callback');
var publisher = require('./amqp-connections/publisher');
var requests = require('./settings/requests');
var amqpConnection = require('./amqp-connections/amqp');
var User = require('./schemas/userSchema');
var requestSchema = require('./schemas/requestSchema');
var Request = mongoose.model('Request', requestSchema, 'requests');

var permissions = {
    free : require('./permissions/freeUserPermissions'),
    paid: require('./permissions/paidUserPermissions')
}

var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
        // Create a worker
        cluster.fork();
    }
} else {
    var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
    mongoose.connect(process.env.MONGO_URL+'/'+process.env.MONGO_DB); // connect to database

    mongoose.connection.on('connected', function () {
        console.log('Mongoose default connection open to ');
    });

    mongoose.connection.on('error',function (err) {
        console.log('Mongoose default connection error: ' + err);
    });

    app.set('superSecret', process.env.SECRET);
    app.use(bodyParser.urlencoded({ extended: false })); // use body parser so we can get info from POST and/or URL parameters
    app.use(bodyParser.json());
    app.use(morgan('dev'));

    var apiRoutes = express.Router();
    app.all('*', function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        // res.header('Access-Control-Allow-Headers', 'accept, content-type, application/x-www-form-urlencoded, x-www-form-urlencoded, x-parse-application-id, x-parse-rest-api-key, x-parse-session-token');
        res.header('Access-Control-Allow-Headers', '*');
        next();
    });


    // var allowCrossDomain = function(req, res, next) {
    //     res.header('Access-Control-Allow-Origin', '*');
    //     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    //     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    //     // intercept OPTIONS method
    //     if ('OPTIONS' == req.method) {
    //       res.send(200);
    //     }
    //     else {
    //       next();
    //     }
    // };


    // ---------------------------------------------------------
    // authenticated routes
    // ---------------------------------------------------------

    function _authorize(req,res){
        var promise = q.defer();
        User.findOne({
            uid: req.body.uid,
            apiToken: req.body.token
        }, function(err, user) {
            if(user !== null){
                var user = user.toJSON();
            }
            if (err) {
                promise.reject({
                    success: false,
                    type: 'error',
                    message: [{
                        parent:'form',
                        title:'Rats... ',
                        message:'Failed to authenticate token.'
                    }]
                });
            } else {
                if (typeof user === 'undefined' || user === null) {
                    promise.reject({
                        success: false,
                        type: 'userInput',
                        message: [{
                            parent:'form',
                            title:'Shucks... ',
                            message:'Invalid user/token combination.'
                        }]
                    });
                } else {
                    promise.resolve(user);
                }
            }
        });
        return promise.promise;
    }

    function checkOptions(req){
        var promise = q.defer();
        var resp = true;
        if(!req || !req.body){
            promise.reject({
                success: false,
                type: 'userInput',
                message: [{
                    parent:'url',
                    title: 'Whoops! ',
                    message: 'Url is required.'
                },{
                    parent:'options',
                    title: 'Doh! ',
                    message: 'Options are required.'
                }]
            });
        } else {
            promise.resolve();
        }
        return promise.promise;
    }

    function checkRequirements(requirements,input){
        var promise = q.defer();
        var passed = true;
        var _params = [];
        _.each(requirements,function(key){
            if(typeof input[key] === 'undefined' || input[key] === ''){
                passed = false;
                _params.push(key);
            }
        });
        if(passed === true){
            promise.resolve();
        } else {
            var messages = [];
            _.each(_params,function(param){
                messages.push({
                    parent:param,
                    title: 'Oops!',
                    message:'Missing required parameter: ' + param + '.'})
            });
            promise.reject({
                success: false,
                type: 'userInput',
                message: messages
            });
        }
        return promise.promise;
    }

    function checkApiCall(req,res,params){
        var promise = q.defer();
        checkOptions(req).then(function(){
            console.log('server.js checkOptions success');
            checkRequirements(params,req.body).then(function(){
                console.log('server.js checkRequirements success');
                _authorize(req).then(function(user){
                    console.log('server.js _authorize success');
                    var options = JSON.parse(req.body.options);
                    requests.validate(user,options,permissions[user.stripe.plan]).then(function(passed){
                        console.log('server.js checkRequestPermissions success');
                        promise.resolve(user,options);
                    }).catch(function(err){
                        console.log('server.js checkApiCall checkRequestPermissions err',err);
                        promise.reject(err);
                    })
                }).catch(function(err){
                    console.log('server.js checkApiCall _authorize err',err);
                    promise.reject(err);
                });
            }).catch(function(err){
                console.log('server.js checkApiCall checkRequirements err',err);
                promise.reject(err);
            });
        }).catch(function(err){
            console.log('server.js checkApiCall checkOptions err',err);
            promise.reject(err);
        });
        return promise.promise;
    }

    // apiRoutes.post('/queue', function(req, res) {
    //     res.json({ message: 'Ok'});
    //     checkApiCall(req,res,['options','token','url','uid']).then(function(user,options){
    //         console.log('server.js checkApiCall succees');
    //             var message = {
    //                 date: Date.now(),
    //                 user: user.uid,
    //                 url:req.body.url,
    //                 options:options
    //             }
    //             var requestId = sh.unique(JSON.stringify(message));
    //             message.requestId = requestId;
    //         publisher.publish("", "pages", new Buffer(JSON.stringify(message))).then(function(re){
    //             console.log('server.js publisher.publish succees');
    //             notify({
    //                 message:'Starting Scan!',
    //                 uid: user.uid,
    //                 page: req.body.page,
    //                 eventType: 'requestUpdate',
    //                 preClass: '',
    //                 postClass: 'pending',
    //                 item: requestId
    //             });
    //         }).catch(function(err){
    //             console.log('server.js publisher.publish err',err);
    //             notify({
    //                 message:JSON.stringify(err.message),
    //                 uid: user.uid,
    //                 page: req.body.page,
    //                 title: 'Server Error',
    //                 eventType: 'requestError',
    //                 preClass: null,
    //                 postClass: 'error',
    //                 item: req.body.preClass});
    //             });
    //     }).catch(function(err){
    //         console.log('server.js checkApiCall err',err);
    //         notify({
    //             message:JSON.stringify(err.message),
    //             title: 'Validation Error',
    //             uid: req.body.uid,
    //             page: req.body.page,
    //             eventType: 'requestError',
    //             preClass: null,
    //             postClass: 'error',
    //             item: req.body.preClass});
    //         });
    // });

    /*
    Should only be called by a bot
    */


    function authorize(req,res,callback){
        User.findOne({
            uid: req.body.uid,
            apiToken: req.body.token
        }, function(err, user) {
            var user = user.toJSON();
            console.log('verify',err, user);
            console.log('verify',err, user,typeof user,_.keys(user));
            console.log('verify',_.keys(user));
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                user = undefined;
                if (typeof user === 'undefined' || user === null) {
                    res.json({ success: false, message: 'Authentication failed.' });
                } else {
                    callback(res,req,user)
                }
            }
        });
    }

    app.get('/refreshPermissions', function(req, res) {
        // authorize(req,res,function(res,req,user){
            permissions.free.update({label:'free'},function(err) {
                if (err){
                    res.json({ message: err });
                }
                permissions.paid.update({label:'paid'},function(err) {
                    if (err){
                        res.json({ message: err });
                    }
                    var message = 'Permissions updated saved successfully';
                    console.log(message);
                    res.json({ message: message });
                });
            });
        // });
    });

    app.get('/refreshCounts', function(req, res) {
        /*
        Should only be called by a bot
        */
        authorize(req,res,function(res,req,user){
            console.log('req',req.body.type);
            // var Link = mongoose.model('HyperLink', linkSchema, 'hyperlinks ');
        });
    });

    apiRoutes.get('/', function(req, res) {
        res.json({ message: 'Yo!' + JSON.stringify(req.body)});
    });

    app.use('/api', apiRoutes);

    var server = app.listen(port, function() {
        console.log('Express server listening on port ' + server.address().port);
    });

    amqpConnection();

    function _preFlight(req,res,needs,callback){
        checkApiCall(req,res,needs).then(function(user,options){
            callback(user,options);
        }).catch(function(err){
            notify({
                message:JSON.stringify(err.message),
                title: 'Validation Error',
                uid: req.body.uid,
                page: req.body.page,
                type: req.body.type,
                temp_id: req.body.temp_id,
                i_id: null,
                status: 'error',
            });
        });
    }


    apiRoutes.post('/v1/webtest', function(req, res) {
        res.json({ message: 'Ok we got it from here!'});
        _preFlight(req,res,['token','uid'],function(user,options){
            queue.destroy(options)
        });
    });





    apiRoutes.post('/v1/deleteCaptures', function(req, res) {
        console.log('delete!',req.body);
        res.json({ message: 'deleting captures requested!'});
        _preFlight(req,res,['token','uid','filename'],function(user,options){
            console.log('here we are');
            function deleteFile(filename) {
                console.log('filename',filename);
                var bucketInstance = new AWS.S3();
                var params = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: filename
                };
                bucketInstance.deleteObject(params, function (err, data) {
                    if (data) {
                        console.log("File deleted successfully",data);
                    }
                    else {
                        console.log("Check if you have sufficient permissions : "+err);
                    }
                });
            }
            deleteFile(req.body.filename.replace(/^.*[\\\/]/, ''))
        });
    });


    apiRoutes.post('/v1/purge', function(req, res) {
        res.json({ message: 'Ok we got it from here!'});
        _preFlight(req,res,['token','uid'],function(user,options){
            queue.destroy(options)
        });
    });


  apiRoutes.post('/v1/capture', function(req, res) {
        res.json({ message: 'Ok we got it from here!'});
        _preFlight(req,res,['options','token','url','uid'],function(user,options){
                console.log('we is in!');
                console.log('server.js checkApiCall succees');
                var message = {
                    date: Date.now(),
                    user: user.uid,
                    url:req.body.url,
                    options:options
                }
                var requestId = sh.unique(JSON.stringify(message));
                message.requestId = requestId;
                User.collection.findOneAndUpdate({
                    uid: user.uid
                    }, {
                        $inc: {
                            'activity.requests.monthly.count':1,
                            'activity.requests.daily.count':1
                        }
                },function(err, user) {
                    console.log('user',err,'user',user)
                });
            publisher.publish("", "capture", new Buffer(JSON.stringify(message))).then(function(re){
                console.log('server.js publisher.publish succees');
                notify({
                    message:'Starting Capture!',
                    uid: user.uid,
                    page: req.body.page,
                    type: req.body.type,
                    status: 'pending',
                    temp_id: req.body.temp_id,
                    i_id: requestId
                });
            }).catch(function(err){
                console.log('server.js publisher.publish err',err);
                notify({
                    message:JSON.stringify(err.message),
                    title: 'Server Error',
                    uid: user.uid,
                    page: req.body.page,
                    type: req.body.type,
                    status: 'error',
                    temp_id: req.body.temp_id,
                    i_id: requestId});
                });
        });
    });



    apiRoutes.post('/v1/freeScan', function(req, res) {
        res.json({ message: 'Ok we got it from here!'});
        _preFlight(req,res,['url','uid','token'],function(user,options){
            console.log('we is in!');
                var message = {
                    date: Date.now(),
                    user: req.body.uid,
                    url:req.body.url,
                    options: {free:true}
                }
                var requestId = sh.unique(JSON.stringify(message));
                message.requestId = requestId;
                console.log('server.js checkApiCall succees',message);
            publisher.publish("", "freeSummary", new Buffer(JSON.stringify(message))).then(function(re){
                console.log('server.js publisher.publish succees');
                notify({
                    message:'Starting Scan!',
                    uid: user.uid,
                    page: req.body.page,
                    type: req.body.type,
                    status: 'pending',
                    temp_id: req.body.temp_id,
                    i_id: requestId
                });
            }).catch(function(err){
                console.log('server.js publisher.publish err',err);
                notify({
                    message:JSON.stringify(err.message),
                    uid: user.uid,
                    page: req.body.page,
                    title: 'Server Error',
                    type: req.body.type,
                    status: 'error',
                    temp_id: req.body.temp_id,
                    i_id: requestId});
            });
        });
    });


    apiRoutes.post('/v1/queue', function(req, res) {
        res.json({ message: 'Ok we got it from here!'});
        _preFlight(req,res,['options','token','url','uid'],function(user,options){
            console.log('we is in!');
                var message = {
                    date: Date.now(),
                    user: user.uid,
                    url:req.body.url,
                    options: JSON.parse(req.body.options)
                }
                var requestId = sh.unique(JSON.stringify(message));
                var requestDate = Date.now();
                message.requestId = requestId;
                console.log('server.js checkApiCall succees',message);
            var _request = new Request({
                url: message.url,
                uid: message.user,
                options: message.options,
                requestId: message.requestId,
                requestDate: requestDate,
                processes: 0,
                status: 'init'
            });

            _request.save(function (err, result) {
                console.log('err',err,'result',result);
                publisher.publish("", "summary", new Buffer(JSON.stringify(message))).then(function(re){
                    console.log('server.js publisher.publish succees');


                    // var requestId = input.requestId;

        // console.log('input.options',input.options);

        // console.log('Saving request...');

                        notify({
                            message:'Starting Scan!',
                            uid: user.uid,
                            page: req.body.page,
                            type: req.body.type,
                            requestDate: requestDate,
                            status: 'pending',
                            temp_id: req.body.temp_id,
                            i_id: requestId
                        });
                }).catch(function(err){
                    console.log('server.js publisher.publish err',err);
                    notify({
                        message:JSON.stringify(err.message),
                        uid: user.uid,
                        page: req.body.page,
                        type: req.body.type,
                        status: 'error',
                        temp_id: req.body.temp_id,
                        i_id: requestId});
                });
            });
        });
    });
}
