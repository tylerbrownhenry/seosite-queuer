var wappalyzer = require('wappalyzer');
wappalyzer.analyze(null,null,'<script src="jquery.js></script"');
  .then(json => {
    console.log(JSON.stringify(json));
  })
  .catch(error => {
    console.error(error);
  });


// // var checkRobots = require('./app/actions/checkRobots/index');
// var bhttp = require("bhttp");
// var _ = require("underscore");
// // var w3c = require('w3c-validate').createValidator();
//
// // var _ = require('underscore');
//
// var request = require('superagent');
// // var inspect = require('util').inspect;
// // var _ = require('underscore');
//
// function w3c(buffer, callback) {
//      var self = this;
//      var output = 'json';
//
//      if (!buffer) {
//           return callback(new Error('buffer must be a non-empty string of HTML markup to validate'));
//      }
//
//      var req = request.post('http://validator.w3.org/check');
//      req.set('User-Agent', 'w3c-validate - npm module');
//      req.field('output', output);
//      req.field('uploaded_file', buffer);
//      req.end(function (err, res) {
//           if (err) {
//                return callback(err);
//           }
//           callback(res.body.messages);
//
//      });
// }
//
// function checkW3C(url, callback) {
//      bhttp.get(url, {}, function (err, response) {
//           if (response && response.body) {
//                w3c(response.body.toString(), function (err, res) {
//                     if (err) {
//                          var resp = {
//                               warnings: 0,
//                               errors: 0
//                          }
//                          _.each(err, function (i) {
//                               if (resp.type === 'info') {
//                                    resp.warnings++;
//                               } else {
//                                    resp.errors++;
//                               }
//                          });
//                     } else {
//                          callback(true);
//                     }
//                });
//           } else {
//                callback(null);
//           }
//      });
// }
//
// checkW3C('https://www.washington.edu/accessit/webdesign/student/unit5/invalidHTML.htm');
//
// // checkRobots({url:'http://www.imdb.com/robots.txt',hostname:'http://www.imdb.com/'},function(err,resp){
// //   console.log('resp',resp);
// // })
// //
// // minifyCheck({type:'js',url:'https://www.youtube.com/yts/jsbin/player-vflrAeTuj/en_US/base.js'},function(){
// // });
// // minifyCheck({type:'js',url:'https://www.google.com/js/bg/6A6V5UTfLJEZsjNj2Vc3U2vVlenFyqxJdKWTCva4Ogk.js'},function(){
// //
// // })
// //
// //
// // User-agent: *
// // Disallow: /_views/
// // Disallow: /apiproxy
// // Disallow: */empty/
// // Disallow: /beta
// // Disallow: /boards/admin.php
// // Disallow: /boards/conversations/add
// // Disallow: /boards/members
// // Disallow: /boards/search
// // Disallow: /boards/*/add-reply
// // Disallow: /boards/*/admin-notes
// // Disallow: /boards/*/ban
// // Disallow: /boards/*/create-thread
// // Disallow: /boards/*/delete
// // Disallow: /boards/*/edit
// // Disallow: /boards/*/ip
// // Disallow: /boards/*/ip-log
// // Disallow: /boards/*/like
// // Disallow: /boards/*/reply
// // Disallow: /boards/*/report
// // Disallow: /boards/*/warn
// // Disallow: /debug
// // Disallow: /pokedex/search
// // Disallow: /search
// // Disallow: /stf/
// // Disallow: /sugarfif.html
// // Disallow: /wikis/*/edit
// //
// // User-agent: Exabot
// // Disallow: /
// //
// // User-agent: AhrefsBot
// // Disallow: /
// //
// // User-agent: PiplBot
// // Disallow: /
// //
// // Sitemap: http://www.ign.com/sitemap.xml
