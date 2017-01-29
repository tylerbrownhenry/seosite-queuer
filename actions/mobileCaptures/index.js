var async = require('async');
var mongoose = require('mongoose');
var q = require('q');
var phantom = require('node-phantom-simple');
var utils = require('../sniff/utils');
var saveImageToAWS = require('./saveCapture');
var Capture = require('../../schemas/captureSchema');

function doit(url,requestId){
    var promise = q.defer();
    console.log('url2',url);
    var sizes = ['1920x1080','1600x1200','1400x900','1024x768','800x600','420x360'];
    var siteURL = url;
    var siteName = siteURL.replace('http://','');
    siteName = siteName.replace('.','_') + '_';
    var imageDir = './images/';

    function scrot(sizes, callback){
        size = sizes.split('x');
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
                                Capture.collection.findOneAndUpdate({
                                    requestId: requestId
                                }, {
                                    $set: captures[size] = url
                                },
                                function(e, r, s) {
                                    console.log('request failed',e,r,s);
                                });

                            } else {
                                console.log('trouble in paradise...');
                            }
                        })

                    });
                    page.close();
                    callback.apply();
                });
            })
        })
    }

    async.eachSeries(sizes, scrot, function(err){
        if (err){
            console.log('done, error');
            promise.reject({
                status:'error',
                data:'Captures not taken'
            });
        } else {
            console.log('done, quitting');
        }
        promise.resolve({
            status:'success',
            data:'Captures taken'
        }); 
    });
    return promise.promise;
}

module.exports = doit;