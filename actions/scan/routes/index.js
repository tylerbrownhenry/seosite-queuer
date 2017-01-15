    /*
     * Routes handlers
     */
    var mongoose = require('mongoose'),
    fs = require('fs'),
    Q = require('q'),
    blc = require('../lib/index'),
    _ = require("underscore");

    var userSchema = new mongoose.Schema({
        name: { type: String, required: true},
        active: { type: Boolean, required: true},
        apiKey: { type: String, required: true},
    });

    var siteSchema = new mongoose.Schema({
        url: { type: String, required: true},
        uid: { type: Object, required: true},
        pending: { type: Boolean, default: true, required: true},
        scanned: { type: Date, default: Date.now } /* Add defaults, set everything 0 Timezone */
    });

    var linkSchema = new mongoose.Schema({
        uid: { type: Object, required: true},
        sid: { type: Object, required: true},
        url: { required: true, unique:true, type: String, index: true},
        scanned: { type: Date, default: Date.now }, /* Add defaults, set everything 0 Timezone */
        link: Object
    });

    var User = mongoose.model('User', userSchema, 'users');
    var Site = mongoose.model('Site', siteSchema, 'scanned-sites');
    var Link = mongoose.model('Link', linkSchema, 'scanned-links');


/*
1. Todo: Pass in tag level (for images and links etc)
2. Save other links (that are ignore)
3. Pass in option to save or not save
4. Add User Roles to decide if an save or not save
5. Build a more advanced queue for larger websites
*/

    function apiKeyTest(dbUser,req){
        if(req.body.apiKey === dbUser.apiKey && dbUser.active === true){
            return {valid:true}
        } else {
            if(dbUser.active !== true){
                 return {valid:false,message: 'User exists, but account is suspended.'}
            } else {
                 return {valid:false,message: 'ApiKey is invalid'};
            }
        }
    }

    function _validateUser(req,check,callback){
        User.findOne({name:req.body.name},function(err, dataset){
            if(typeof dataset !== 'undefined' && dataset !== null){            
                var test = check(dataset,req);
                if(test.valid === true){
                    callback(true,dataset);
                } else {
                    callback(false,test.message);
                }
            } else {
                callback(false,'User not found: ' + req.body.name);    
            }
        });
    }

    function validateUser(res,req,test,callback){
        _validateUser(req,test,function(response,info){
            if(response === true){
                callback(info);
            } else {
                return handleError(res,{
                    'name': 'Error',
                    'message': info
                });
            }
        });
    }

    function handleError(res,error){
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).send(JSON.stringify(
            {
            'error': error
            }
        ));
    }

    // Basic routing
    module.exports = function(app) {
        app.get("/", function(req,res){
            // res.setHeader('Content-Type', 'application/json');
            res.render('index', { 
                title: 'Broken Link Scanner Admin Area', 
                message: 'Hello there!' 
            });
        });
        app.post("/page", checkPage);
        app.post("/site", checkSite);
        app.post("/sites", listSites);
        app.post("/links", listLinks);
    }

    function checkRequirements(requirements,input,params){
        var response = true;
        var params = [];
        _.each(requirements,function(key){
            if(typeof input[key] === 'undefined' || input[key] === ''){
                response = false;
                params.push(key);
            }
        });
        return {response:response,params:params};
    }

    function checkSite(req, res) {
        var test = checkRequirements(['name','apiKey','url'],req.body);
        if(test.response === false){
            return handleError(res,{
                    'name': 'Error',
                    'message': 'Missing Required Parameters',
                    'parameters' : test.params
            });
        } else {
            validateUser(res,req,apiKeyTest,function(dataset){
                processSiteRequest(req, res, dataset);
            });
        }
    }

    function checkPage(req, res) {
        var test = checkRequirements(['name','apiKey','url'],req.body);
        if(test.response === false){
            return handleError(res,{
                    'name': 'Error',
                    'message': 'Missing Required Parameters',
                    'parameters' : test.params
            });
        } else {
            validateUser(res,req,apiKeyTest,function(dataset){
                processPageRequest(req, res, dataset);
            });
        }
    }

    function listLinks(req, res) {
        var test = checkRequirements(['name','apiKey','siteId'],req.body);
        if(test.response === false){
            return handleError(res,{
                    'name': 'Error',
                    'message': 'Missing Required Parameters',
                    'parameters' : test.params
            });
        } else {
            validateUser(res,req,apiKeyTest,function(dataset){
                processLinkListRequest(req, res, dataset);
            });
        }
    }

    function listSites(req, res) {
        var test = checkRequirements(['name','apiKey'],req.body);
        if(test.response === false){
            return handleError(res,{
                    'name': 'Error',
                    'message': 'Missing Required Parameters',
                    'parameters' : test.params
            });
        } else {
            validateUser(res,req,apiKeyTest,function(dataset){
                processSiteListRequest(req, res, dataset);
            });
        }
    }

    function processPageRequest(req, res, dataset) {
        var response = {
            links:[]
        }
        var checkedLimit = req.body.checkedLimit;
        if(checkedLimit > dataset.checkedLimit){
            checkedLimit = dataset.checkedLimit;
        }
        // // Scans the HTML content at each queued URL to find broken links.
        var htmlUrlChecker = new blc.HtmlUrlChecker({
                    checkedLimit: checkedLimit
                }, 
                {
                link: function(result, customData){
                    response.links.push(result);
                },
                end: function(){
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify(response));
                }
            }
        );
        var cb  = htmlUrlChecker.enqueue(req.body.url);
        if(typeof cb !== 'string' && typeof cb !== 'number'){
            return handleError(res,{
                'message': cb.message,
                'name': cb.name
            });
        }
       return;
    }

    function processSiteRequest(req, res, userdataset) {
        var brokenUrl = false;
        var urlChecker = new blc.UrlChecker({}, {
            link: function(result, customData){
                if(typeof result.broken === true){
                    brokenUrl = true;
                    return handleError(res,{
                        'message': 'The url you provided appears to be broken.',
                        'name': 'Error'
                    });
                }
            },
            end: function(){
                if(brokenUrl === false){
                    checkUserSites(req,res,userdataset);
                }
            }
        });
       try{
            var cb  = urlChecker.enqueue(req.body.url);
            if(typeof cb !== 'string' && typeof cb !== 'number'){
                return handleError(res,{
                    'message': cb.message,
                    'name': cb.name
                });
            }
        } catch(err){
            var cb = {};
            return handleError(res,{
                    'message': 'An error occured while trying to examine the url: '+ req.body.url,
                    'name': 'Processing Error'
                });            
        }
    }

    function processLinkListRequest(req,res,userdataset){
        console.log('userdataset._id',userdataset._id,'siteId',req.body.siteId);
        Link.find({ "uid": new mongoose.Types.ObjectId(userdataset._id), "sid": new mongoose.Types.ObjectId(req.body.siteId) },function(err, dataset){
            if(typeof dataset !== 'undefined' && dataset !== null){            
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({links:dataset}));
            } else {
                handleError(res,{
                    'message': 'No links found for that site',
                    'name': 'Empty'
                });
            }
        });
    }

    function processSiteListRequest(req,res,userdataset){
        Site.find({uid:userdataset._id},function(err, dataset){
            if(typeof dataset !== 'undefined' && dataset !== null){            
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({sites:dataset}));
            } else {
                handleError(res,{
                    'message': 'No sites found for that user',
                    'name': 'Empty'
                });
            }
        });
    }

    function checkUserSite(req,res,userdataset,cb){
        Site.findOne({uid:userdataset._id,url:req.body.url},function(err, dataset){
            if(typeof dataset !== 'undefined' && dataset !== null){            
                cb(true,dataset); /* Exists */
            } else {
                cb(false);  /* Does not exist */
            }
        });
    }

    function checkSiteLinks(req,res,preExisting,sitedataset,userdataset){
        if(preExisting !== true){
            _processSiteRequest(req,res,sitedataset,userdataset);
        } else {        
            Site.update({
                uid:userdataset._id,
                url: req.body.url,
                pending: true,
            },function(e,r){
                _processSiteRequest(req,res,sitedataset,userdataset);
            });
        }
    }

    function checkUserSites(req,res,userdataset){
        checkUserSite(req,res,userdataset,function(exists,dataset){
            if(exists === true){
                checkSiteLinks(req,res,true,dataset,userdataset);
            } else {
                Site.create({
                    uid:userdataset._id,
                    url: req.body.url,
                },function(e,dataset){
                    if(typeof e !== 'string' && typeof e !== 'number' && e !== null){
                        return handleError(res,{
                            'message': e.message,
                            'name': e.name
                        });
                    } else {
                        checkSiteLinks(req,res,false,dataset,userdataset);
                    }
                });
            }
        });
    }

    function _processSiteRequest(req, res, sitedata,userdata) {
        var checkedLimit = req.body.checkedLimit;
        if(checkedLimit > userdata.checkedLimit){
            checkedLimit = userdata.checkedLimit;
        }

        var response = {
            links:[],
            pages:[],
            sites:[]
        }

        var siteChecker = new blc.SiteChecker({
                checkedLimit: checkedLimit
            }, {
            link: function(result, customData){
                response.links.push({
                    scanned: Date.now,
                    url:result.url.resolved,
                    link:result
                });
            },
            page: function(error, pageUrl, customData){
                response.pages.push({
                    uid: userdata._id,
                    sid: sitedata._id,
                    link:pageUrl
                });
            },
            site: function(error, siteUrl, customData){
                response.sites.push({
                    uid: userdata._id,
                    link:siteUrl
                });
            },
            end: function(){

                var commands = [];

                _.each(response.links,function(link){
                    commands.push({ 
                        updateOne : {
                            "filter" : { "url" : link.url, "uid": userdata._id, "sid": sitedata._id },
                            "replacement" : { 
                                "url" : link.url, 
                                "uid": userdata._id,
                                "sid": sitedata._id,
                                "scanned": Date.now,
                                "link": link
                            },
                            "upsert" : true
                        }
                    });
                });
                
                Link.collection.bulkWrite(commands).then(function(e,r,s){
                      console.log('Links updated');
                });

                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(response));

                Site.update({
                    _id: sitedata._id,
                    pending: false,
                },function(e,r){
                    console.log('Site updated');
                });

            }
        });
        siteChecker.enqueue(req.body.url);
    }