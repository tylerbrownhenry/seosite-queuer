var async = require('async');
var mongoose = require('mongoose');
var q = require('q');
var phantom = require('node-phantom-simple');
var utils = require('../sniff/utils');
var saveImageToAWS = require('./saveCapture');
// var Capture = require('../../schemas/captureSchema');
// var Scan = require('../../schemas/scanSchema');

function doit(url,requestId,inputSizes){
    var promise = q.defer();
    console.log('url2',url);
    var sizes = ['1920x1080','1600x1200','1400x900','1024x768','800x600','420x360'];
    if(typeof inputSizes !== 'undefined'){
        sizes = inputSizes;
    }
    var siteURL = url;
    var siteName = siteURL.replace('http://','');
    siteName = siteName.replace('.','_') + '_';
    var imageDir = './images/';

    function scrot(_sizes, callback){
        size = _sizes.split('x');
        phantom.create().then(function (ph) {
            utils.promisify(ph.createPage)().then(function (page) {
                page.set("viewportSize", { width: size[0], height: size[1] });
                page.set("zoomFactor", 1);
                page.open(siteURL, function (status) {
                    console.log('Opened!');
                    var filename = imageDir + siteName + size[0] + 'x' + size[1] + '.png';
                    page.render(filename,function(){
                        saveImageToAWS(filename,function(err,url){
                            if(err === 'success'){
                                console.log('request',url);
                                callback({err:null,ph:ph,size:_sizes,url:url});
                            } else {
                                callback({err:err,ph:ph,size:_sizes});
                                console.log('trouble in paradise...');
                            }
                        })
                    }); /* Error? */
                    page.close();
                });
            }).then(function(){
                console.log('done 2');
                // ph.exit();
            }).finally(function(){
                console.log('done');
            })
        })
    }

    async.eachSeries(sizes, scrot, function(res){
        console.log('done',res);
        if (res && res.err){
            promise.reject({
                status:'error',
                data:'Captures not taken'
            });
        } else {
            console.log('done, quitting');
        }
        promise.resolve({
            status:'success',
            size: res.size,
            url: res.url,
            requestId: requestId,
            data:'Captures taken'
        }); 
        if(typeof res.ph !== 'undefined' && typeof res.ph.exit === 'function'){
            res.ph.exit();
        }
    });
    return promise.promise;
}

module.exports = doit;