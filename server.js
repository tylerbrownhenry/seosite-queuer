var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var io      = require('socket.io');
var q      = require('Q');
var notify = require('./actions/callback');
var mongoose    = require('mongoose');
var publisher    = require('./amqp-connections/publisher');
var _    = require('underscore');
var checkUserPermissions    = require('./settings/checkRequestPermissions');
var amqpConnection    = require('./amqp-connections/amqp');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var User   = require('./schemas/userSchema'); // get our mongoose model
require('dotenv').config();

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

    app.get('/setup', function(req, res) {
        // create a sample user
        var nick = new User({ 
            password: 'password',
            admin: true,
            email: 'nick@yo.com',
            profile:{
                name: 'Nick Cerminara', 
            }
        });
        nick.save(function(err) {
            if (err){
                throw err;
            } 
            console.log('User saved successfully');
            res.json({ success: true });
        });
    });

    var apiRoutes = express.Router(); 


    function _authorize(req,res){
        var promise = q.defer();
        User.findOne({
            uid: req.body.uid,
            apiToken: req.body.token
        }, function(err, user) {
            var user = user.toJSON();
            if (err) {
                promise.reject({
                    success: false,
                    type: 'error',
                    message: [{parent:'form',title:'Rats... ',message:'Failed to authenticate token.'}]
                });
            } else {
                if (typeof user === 'undefined' || user === null) {
                    promise.reject({ 
                        success: false,
                        type: 'userInput',
                        message: [{parent:'form',title:'Shucks... ',message:'Invalid user/token combination.'}]
                    });
                } else {
                    promise.resolve(user);
                }
            }
        });
        return promise.promise;
    }

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

    // ---------------------------------------------------------
    // authenticated routes
    // ---------------------------------------------------------
    apiRoutes.get('/requestPermissions', function(req, res) {
        console.log('req',req.body);
        authorize(req,res,function(res,req,user){
            // startQueue();
            // amqpConnection(true)

            /* Check Permissions of User */
            console.log('success!');
            res.json({
                success: true,
                message: 'Added to Queue'
            });
        });
    });




    function checkOptions(req){
        var promise = q.defer();
        var resp = true;
        if(!req || !req.body){
            promise.reject({
                success: false,
                type: 'userInput',
                message: [
                {
                    parent:'url',
                    title: 'Whoops! ',
                    message: 'Url is required.'
                },
                {
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
            checkRequirements(params,req.body).then(function(){
                _authorize(req).then(function(user){
                    console.log('user',user);
                    var options = JSON.parse(req.body.options)
                    checkUserPermissions(user,options,permissions[user.stripe.plan]).then(function(passed){
                       promise.resolve(user,options);
                    }).catch(function(err){
                        console.log('test...2');
                        promise.reject(err);
                    })
                }).catch(function(err){
                    console.log('test...23');
                    promise.reject(err);
                });
            }).catch(function(err){
                console.log('test...24');
                promise.reject(err);
            });
        }).catch(function(err){
            console.log('test...25');
            promise.reject(err);
        });
        return promise.promise;
    }  
       


    app.get('/refreshPermissions', function(req, res) {
        authorize(req,res,function(res,req,user){
            // var freeUser   = require('./freeUserPermissions'); 
            // var paidUser   = require('./paidUserPermissions');

            permissions.free.upsert({label:freeUser.label},function(err) {
                if (err){
                    res.json({ message: err });
                }
                permissions.paid.save({label:paidUSer.label},function(err) {
                    if (err){
                        res.json({ message: err });
                    } 
                    var message = 'Permissions updated saved successfully';
                    console.log(message);
                    res.json({ message: message });
                });
            });
        });
    });

    app.get('/testPublish',function(req,res){
        var publisher = require('./publisher'); 
        publisher.publish("", "jobs", new Buffer(JSON.stringify({user:'17PmsI',url:'http://mariojacome.com',options:{
        // publisher.publish("", "jobs", new Buffer(JSON.stringify({user:'17PmsI',url:'https://en.wikipedia.org/wiki/List_of_largest_cities',options:{
        // publisher.publish("", "jobs", new Buffer(JSON.stringify({user:'17PmsI',url:'https://badssl.com',options:{
            limit: 1000,
            filterLevel: 0,
            scanDepth: 3,
            date: Date.now()
        }})));
    })

    app.get('/refreshCounts', function(req, res) {
        /*
        Should only be called by a bot
        */
        authorize(req,res,function(res,req,user){
            console.log('req',req.body.type);
            // var Link = mongoose.model('Link', linkSchema, 'links ');
        });
    });







    apiRoutes.post('/queue', function(req, res) {



        console.log('right back at ya!');
        res.json({ message: 'Ok'});
        console.log('req.body.preClass',req.body);
        console.log('req.body.page',req.body.page);
        checkApiCall(req,res,['options','token','url','uid']).then(function(user,options){
            publisher.publish("", "pages", new Buffer(JSON.stringify({
                user: user.uid,
                url:req.body.url,
                options:options
            }))).then(function(re){
                console.log('test',re);
                notify({
                    message:'Starting Scan!',
                    uid: user.uid,
                    page: req.body.page,
                    eventType: 'requestUpdate',
                    preClass: '',
                    postClass: 'pending',
                    item: 'requestId'});

            }).catch(function(err){
                console.log('err',err);
                notify({
                    message:JSON.stringify(err.message),
                    uid: user.uid,
                    page: req.body.page,
                    title: 'Server Error',
                    eventType: 'requestError',
                    preClass: null,
                    postClass: 'error',
                    item: req.body.preClass});
            });
        }).catch(function(err){
            console.log('err',err);
            notify({
                message:JSON.stringify(err.message),
                title: 'Validation Error',
                uid: req.body.uid,
                page: req.body.page,
                eventType: 'requestError',
                preClass: null,
                postClass: 'error',
                item: req.body.preClass});

            return;
        });
    });

    apiRoutes.get('/', function(req, res) {
        res.json({ message: 'Welcome to the coolest API on earth!' + JSON.stringify(req.body)});
    });

    app.use('/api', apiRoutes);
    // app.listen(port);

    var server = app.listen(port, function() {
        console.log('Express server listening on port ' + server.address().port);
    });

    console.log('Magic happens at http://localhost:' + port);
    amqpConnection();
}