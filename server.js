var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var amqpConnection    = require('./index');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var User   = require('./user'); // get our mongoose model
require('dotenv').config();

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

    function authorize(req, res,callback){
        User.findOne({
            email: req.body.email
        }, function(err, user) {
            jwt.verify(req.body.token, app.get('superSecret'), function(err, decoded) {          
                console.log('verify',err, decoded);
                if (err) {
                    return res.json({ success: false, message: 'Failed to authenticate token.' });      
                } else {
                    if (decoded != req.body.email) {
                        res.json({ success: false, message: 'Authentication failed.' });
                    } else {
                        callback(res,req,user)
                    }
                }
            });
        });
    }

    // ---------------------------------------------------------
    // authenticated routes
    // ---------------------------------------------------------
    apiRoutes.post('/queue', function(req, res) {
        authorize(req,res,function(res,req,user){
            // startQueue();
            amqpConnection(true)
            res.json({
                success: true,
                message: 'Added to Queue'
            });
        });
    });

    app.get('/refreshPermissions', function(req, res) {
        authorize(req,res,function(res,req,user){
            var freeUser   = require('./freeUserPermissions'); 
            var paidUser   = require('./paidUserPermissions');

            freeUser.upsert({label:freeUser.label},function(err) {
                if (err){
                    res.json({ message: err });
                }
                paidUser.save({label:paidUSer.label},function(err) {
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
        publisher.publish("", "jobs", new Buffer(JSON.stringify({user:'17PmsI',url:'https://en.wikipedia.org/wiki/List_of_largest_cities',options:{
        // publisher.publish("", "jobs", new Buffer(JSON.stringify({user:'17PmsI',url:'http://badssl.com',options:{
            limit: 1000,
            filterLevel: 0,
            scanDepth: 3,
            date: Date.now()
        }})));
    })

    app.get('/refreshCounts', function(req, res) {
        authorize(req,res,function(res,req,user){
            console.log('req',req.body.type);
            // var Link = mongoose.model('Link', linkSchema, 'links ');
        });
    });

    apiRoutes.get('/', function(req, res) {
        res.json({ message: 'Welcome to the coolest API on earth!' + JSON.stringify(req.body)});
    });

    app.use('/api', apiRoutes);
    app.listen(port);

    console.log('Magic happens at http://localhost:' + port);
    amqpConnection();
}