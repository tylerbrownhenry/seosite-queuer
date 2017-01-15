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
        id: { type: String, required: true},
        active: { type: Boolean, required: true},
        apiKey: { type: String, required: true},
    });

    var siteSchema = new mongoose.Schema({
        url: { type: String, required: true},
        user: { type: String, required: true},
        scanned: { type: Date, default: Date.now } /* Add defaults, set everything 0 Timezone */
    });

    var queueSchema = new mongoose.Schema({
        url: { type: String},
        user: { type: String},
        siteChecker : Object,
        urlCache: Object,
        linkQueue: Object,
        scanned: { type: Date, default: Date.now } /* Add defaults, set everything 0 Timezone */
    });

    var pageSchema = new mongoose.Schema({
        url: { type: String, required: true},
        user: { type: String, required: true},
        site: { type: String, required: true},
        scanned: { type: Date, default: Date.now },
        broken: { type: Boolean, default: false },
        parent: String
    });

    var linkSchema = new mongoose.Schema({
        user: { type: String, required: true},
        site: { type: String, required: true},
        url: { required: true, unique:true, type: String, index: true},
        scanned: { type: Date, default: Date.now },
        link: Object
    });

    var User = mongoose.model('User', userSchema, 'users');
    var Site = mongoose.model('Site', siteSchema, 'scanned-sites');
    var Page = mongoose.model('Page', pageSchema, 'scanned-pages');
    var Queue = mongoose.model('Queue', queueSchema, 'active-scans');


    var Link = mongoose.model('Link', linkSchema, 'scanned-links');
    // User.create({name:'superSecretAdminUser',apiKey:'irvNTiy7dGabDn3QayAM',active:true,id:1267633},function(e){
    //   console.log('inserted');
    // });
// console.log('test');
    function apiKeyTest(dbUser,req){
        console.log('dbUser',dbUser,'req',req.body);
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
            console.log('dataset',dataset,'req',req.body);
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
        app.get("/test", function(req,res){
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({alive:true}));
        });
        app.post("/page", checkPage);
        app.post("/site", checkSite);
        app.post("/createUser", createUser);
    }
return;
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

    function createUser(req,res){
        var test = checkRequirements(['name','apiKey'],req.body);
        if(test.response === false){
            return handleError(res,{
                    'name': 'Error',
                    'message': 'Missing Required Parameters',
                    'parameters' : test.params
            });
        } else {
            function test(dbUser,req){
                return true;
            }
            validateUser(res,req,test,function(response){
                console.log('createUser');
                // User.create({name:'superSecretAdminUser',apiKey:'irvNTiy7dGabDn3QayAM',active:true,id:1267633},function(e){
                //   console.log('inserted');
                // });
            })
            processRequest(req, res)
        }
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
                processPAgeRequest(req, res, dataset);
            });
        }
    }

    function processPageRequest(req, res, dataset) {
        var response = {
            links: {
                all:[],
                broken: [],
                internal: [],
                checked:[]
            }
        };
        var checkedLimit = req.body.checkedLimit;
        if(checkedLimit > dataset.checkedLimit){
            checkedLimit = dataset.checkedLimit;
        }
        // // Scans the HTML content at each queued URL to find broken links.
        var htmlUrlChecker = new blc.HtmlUrlChecker(
            {
                checkedLimit: checkedLimit
            }, 
            {
                _filter: function(result){
                    response.links.all.push(result);
                    return false;
                },
                html: function(tree, robots, response, pageUrl, customData){
                    console.log('done');
                },
                link: function(result, customData){
                    response.links.checked.push(result);
                },
                end: function(){
                    res.setHeader('Content-Type', 'application/json');
                    _.each(response.links.checked,function(link){
                        if(link.broken === true){
                            response.links.broken.push(link);
                        }
                        if(link.internal === true){
                            response.links.internal.push(link);
                        }
                    });
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
        console.log('test!!!');
        // var hostKey = getHostKey(req.body.url, {
        //     defaultPorts: {
        //         ftp:21, 
        //         http:80, 
        //         https:443
        //     },
        //     ignorePorts: true,
        //     ignoreSchemes: true,
        //     ignoreSubdomains: true,
        //     maxSockets: Infinity,
        //     maxSocketsPerHost: 1,
        //     rateLimit: 0
        // });
        // console.log('hostKey',hostKey);

        var brokenUrl = false;
        var urlChecker = new blc.UrlChecker({}, {
            link: function(result, customData){
                console.log('result',result.broken);

                if(typeof result.broken === true){

                    return handleError(res,{
                        'message': 'The url you provided appears to be broken.',
                        'name': 'Error'
                    });
                }
                 // linkQueue.RequestQueue.activeHosts:
            },
            end: function(){
                console.log('done');
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

        // _processSiteRequest(req, res, dataset);

    }

    function checkUserSite(req,res,userdataset,cb){
        Site.findOne({user:userdataset._id,url:req.body.url},function(err, dataset){
            if(typeof dataset !== 'undefined' && dataset !== null){            
                /* Exists */
                cb(true,dataset); 
            } else {
                /* Does not exist */
                cb(false); 
            }
        });
    }

    function checkSiteLinks(req,res,preExisting,sitedataset,userdataset){
        console.log('preExisting',preExisting,'site',sitedataset._id,'user',userdataset._id);
        _processSiteRequest(req,res,sitedataset,userdataset);
    }

    function checkUserSites(req,res,userdataset){
        checkUserSite(req,res,userdataset,function(exists,dataset){
            if(exists === true){
                checkSiteLinks(req,res,true,dataset,userdataset);
            } else {
                Site.create({
                    user:userdataset._id,
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




        // User.create({name:'superSecretAdminUser',apiKey:'irvNTiy7dGabDn3QayAM',active:true,id:1267633},function(e){
    //   console.log('inserted');
    // });


        // Site.findOne({user:req.body.name,url:req.body.url},function(err, dataset){
        //     console.log('dataset',dataset,'req',req.body);
        //     if(typeof dataset !== 'undefined' && dataset !== null){            
        //         callback(true,dataset); /* Exists */
        //     } else {
        //         callback(false); /* Does not exist */
        //     }
        // });
    

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

        // function Branch(e){
        //     return {
        //         parent: e.base,
        //         url: e.url,
        //         children: {},
        //         html: e.html,
        //         broken: e.broken,
        //         internal: e.internal,
        //         samePage: e.samePage,
        //         excluded: e.excluded,
        //         brokenReason: e.brokenReason,
        //         excludedReason: e.excludedReason
        //     }
        // }

        // var tree = new Branch({
        //     url:req.body.url
        // });
        // currentItem = tree;

        // var count = 0;
        // var states = [];

        // var settings = {};

        // Queue.findOne({url:req.body.url,user:req.body.name},function(e,r){
        //     // console.log('test',e,r);

        //     settings.siteChecker  = JSON.parse(r.siteChecker);
        //     settings.urlCache  = JSON.parse(r.urlCache);
        //     settings.linkQueue  = JSON.parse(r.linkQueue);

            // settings = JSON.parse(r);
            // console.log(settings);
            // res.setHeader('Content-Type', 'application/json');
            // res.send(JSON.stringify(settings));
 
   
        // function updateCache(siteUrl,pageUrl,user){
            // var promise = Q.defer();
            // Page.update({
            //     url: pageUrl,
            //     site: siteUrl,
            //     user: req.body.name
            // },{
            //     status:'scanned'
            // }


            // Page.find({
            //     parent: pageUrl,
            //     status: 'notscanned'
            //     user: req.body.name
            // },{
            //     status:.scanned = true;
            // }



            // function(err, dataset){
            //     console.log('dataset',dataset,'req',req.body);
            //     if(typeof dataset !== 'undefined' && dataset !== null){            
                    
            //         dataset.save(function (err) {
            //             if(err) {
            //                 console.error('ERROR!');
            //             }
            //         });
            //             promise.resolve(true,dataset);
            //             callback(true,dataset);
            //         } else {
            //             promise.resolve(true,dataset);
            //             callback(false,test.message);
            //         }
            //     } else {
                    
            //         /* Create New */   
            //     }
            // });
        // }

    // var pageSchema = new mongoose.Schema({
    //     url: { type: String, required: true},
    //     user: { type: String, required: true},
    //     site: { type: String, required: true},
    //     scanned: { type: Date, default: Date.now },
    //     broken: { type: Boolean, default: false },
    //     parent: String
    // });


        // }

        /*
        Go to url, get all links, check all of the links
        */



        var siteChecker = new blc.SiteChecker({
                checkedLimit: checkedLimit
            }, {
             _filter: function(result){
                console.log('result',result);
                // response.links.all.push(result);
                return false;
            },
            robots: function(robots, customData){

            },
            html: function(tree, robots, response, pageUrl, customData){

            },
            junk: function(result, customData){

            },
            link: function(result, customData){
                // currentItem.children[result.url.resolved] = new Branch(result);
                // console.log('link',result.url.original);
                // console.log('link',result.url.original,'result',result,'siteChecker',siteChecker.htmlUrlChecker.htmlUrlQueue.priorityQueue.length,siteChecker.htmlUrlChecker.htmlUrlQueue.counter)
                response.links.push({
                    user: userdata._id,
                    site: sitedata._id,
                    scanned: Date.now,
                    url:result.url.resolved,
                    link:result
                });
            },
            page: function(error, pageUrl, customData){
               
                response.pages.push({
                    user: userdata._id,
                    site: sitedata._id,
                    link:pageUrl
                });

                console.log('page',req.body);

                // console.log('page',count,'pageUrl',pageUrl,'urls in queue',_.clone(_.keys(siteChecker.htmlUrlChecker.htmlUrlQueue.items).length));
                // currentItem
                // count++;
               
                // var obj = {
                //     leng:_.clone(siteChecker.sitePagesChecked.count),
                //     urlsInQue:_.clone(_.keys(siteChecker.htmlUrlChecker.htmlUrlQueue.items).length),
                //     values:_.clone(_.keys(siteChecker.sitePagesChecked.values).length),
                //     siteUrlQueue:siteChecker.siteUrlQueue,
                //     htmlUrlChecker:_.clone(siteChecker.htmlUrlChecker),
                //     "htmlUrlChecker.htmlUrlQueue":_.clone(siteChecker.htmlUrlChecker.htmlUrlQueue),
                //     sitePagesChecked:siteChecker.sitePagesChecked,
                //     siteChecker:siteChecker};

                //     _.each(_.keys(siteChecker.htmlUrlChecker.htmlUrlQueue),function(key){
                //         obj['__'+key] = _.clone(siteChecker.htmlUrlChecker.htmlUrlQueue[key]);
                //     });

                // states.push(obj)
                // if(count === 5){
                    // siteChecker.pause();
                    // res.setHeader('Content-Type', 'application/json');
                    // res.send(JSON.stringify([,siteChecker.htmlUrlChecker.htmlChecker.urlChecker.linkQueue]));
                    // Queue.create({
                    //     url:req.body.url,
                    //     user:req.body.name,
                    //     siteChecker: JSON.stringify(siteChecker),
                    //     urlCache: JSON.stringify(siteChecker.htmlUrlChecker.htmlChecker.urlChecker.cache),
                    //     linkQueue: JSON.stringify(siteChecker.htmlUrlChecker.htmlChecker.urlChecker.linkQueue)
                    // },{checkKeys: false},function(e,r){
                    //     console.log('test',e,r);
                    // });
                // }

                 // console.log('cache',siteChecker.htmlUrlChecker.htmlUrlQueue);

                 // console.log('cache',siteChecker.htmlUrlChecker.htmlChecker.urlChecker.linkQueue);

                 console.log('cache');

                //     return Error('we f\'d!');                
                //  }
            },
            site: function(error, siteUrl, customData){
                console.log('site');
                response.sites.push({
                    user: userdata._id,
                    site: sitedata._id,
                    link:siteUrl
                });
            },
            end: function(){


                Link.collection.insert(response.links, function(){
                    console.log('linksAdded')
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify(response));
                });


                var bulk = Link.collection.initializeUnorderedBulkOp();
                _.each(response.links,function(link){
                    bulk.find({url: link.url}).upsert().update(link);
                });

                bulk.execute(function(){
                    console.log('updated');
                });

            }
        });



            // var siteChecker = _.extend(settings,siteChecker);

            // siteChecker.htmlUrlChecker.htmlUrlQueue.priorityQueue = settings.siteChecker.htmlUrlChecker.htmlUrlQueue.priorityQueue;
            // siteChecker.htmlUrlChecker.htmlUrlQueue.items =         settings.siteChecker.htmlUrlChecker.htmlUrlQueue.items;
            // siteChecker.htmlUrlChecker.htmlUrlQueue.counter =       settings.siteChecker.htmlUrlChecker.htmlUrlQueue.counter;
            // siteChecker.htmlUrlChecker.htmlUrlQueue.activeHosts =   settings.siteChecker.htmlUrlChecker.htmlUrlQueue.activeHosts;
            // siteChecker.siteUrlQueue.priorityQueue =                settings.siteChecker.siteUrlQueue.priorityQueue;

            // siteChecker.sitePagesChecked.expiries = settings.siteChecker.sitePagesChecked.expiries;
            // siteChecker.sitePagesChecked.values = settings.siteChecker.sitePagesChecked.values;
            // siteChecker.sitePagesChecked.count = settings.siteChecker.sitePagesChecked.count;
            
            // siteChecker.htmlUrlChecker.htmlChecker.urlChecker.cache =  settings.urlCache
            // siteChecker.htmlUrlChecker.htmlChecker.urlChecker.linkQueue =  settings.linkQueue

            // siteChecker.siteUrlQueue.activeHosts = settings.siteChecker.siteUrlQueue.activeHosts;
            // siteChecker.siteUrlQueue.counter = settings.siteChecker.siteUrlQueue.counter;

            // siteChecker.pause();
            siteChecker.enqueue(req.body.url);
            // res.setHeader('Content-Type', 'application/json');
            // res.send(JSON.stringify(settings));


            //  Queue.create({url:req.body.url+2,user:req.body.name,siteChecker:JSON.stringify(siteChecker)},{checkKeys: false},function(e,r){
            //     //         console.log('test',e,r);
            // });

        // });

        // try{
        //     var cb  = siteChecker.enqueue(req.body.url);
        //     if(typeof cb !== 'string' && typeof cb !== 'number'){
        //         return handleError(res,{
        //             'message': cb.message,
        //             'name': cb.name
        //         });
        //     }
        // } catch(err){
        //     var cb = {};
        //     return handleError(res,{
        //             'message': cb.message,
        //             'name': cb.name
        //         });            
        // }
        // var response = {
        //     links: {
        //         all:[],
        //         broken: [],
        //         internal: [],
        //         checked:[]
        //     }
        // };
        // var checkedLimit = req.body.checkedLimit;
        // if(checkedLimit > dataset.checkedLimit){
        //     checkedLimit = dataset.checkedLimit;
        // }
        // // // Scans the HTML content at each queued URL to find broken links.
        // var htmlUrlChecker = new blc.HtmlUrlChecker(
        //     {
        //         checkedLimit: checkedLimit
        //     }, 
        //     {
        //         _filter: function(result){
        //             response.links.all.push(result);
        //             return false;
        //         },
        //         html: function(tree, robots, response, pageUrl, customData){
        //             console.log('done');
        //         },
        //         link: function(result, customData){
        //             response.links.checked.push(result);
        //         },
        //         end: function(){
        //             res.setHeader('Content-Type', 'application/json');
        //             _.each(response.links.checked,function(link){
        //                 if(link.broken === true){
        //                     response.links.broken.push(link);
        //                 }
        //                 if(link.internal === true){
        //                     response.links.internal.push(link);
        //                 }
        //             });
        //             res.send(JSON.stringify(response));
        //         }
        //     }
        // );
        // var cb  = htmlUrlChecker.enqueue(req.body.url);
        // if(typeof cb !== 'string' && typeof cb !== 'number'){

        // }
       // return;
    }