require('dotenv').config();
var bhttp = require('bhttp');
var q = require('q');

function checkTwitter(id) {
     var promise = q.defer();
     var tokens = require('twitter-tokens');
     var getTwitterFollowers = require('get-twitter-followers');
     if (typeof id !== 'undefined' && id !== null && id !== '') {
          getTwitterFollowers(tokens, id).then(followers => {
               if (typeof followers === 'object' && followers.length) {
                    promise.resolve({'twitter-followers':followers.length});
               } else {
                    promise.resolve(null);
               }
          }).catch(function () {
               promise.resolve(null);
          });
     } else {
          promise.resolve(null)
     }
     return promise.promise;
}

function checkShareCount(url) {
     var promise = q.defer();
     var shareCountURL = 'https://api.sharedcount.com/v1.0/?apikey=' + process.env.SHARED_COUNT_APIKEY + '&url=' + url

     bhttp.get(shareCountURL, {}, function (err, response) {
          if (response && response.body) {
               if (response.body.Error) {
                    promise.reject(response.body.Error);
               } else {
                    promise.resolve({'shared-count':response.body});
               }
          } else {
               promise.reject(err);
          }
     });
     return promise.promise;
};


function checkSocial(url,twitterId) {
    var promise = q.defer();
     q.all([checkShareCount(url), checkTwitter(twitterId)]).then(function(res){
       promise.resolve(res);
     }).catch(function(err){
       promise.reject(err);
     })
     return promise.promise;
 }
 module.exports = checkSocial;
