require('dotenv').config();
const bhttp = require('bhttp'),
     Twitter = require('twit'),
     q = require('q');
let tokens = require('twitter-tokens');
tokens.timeout_ms = 30000;

/**
 * calls api to get the follower count of a twitter handle
 * @param  {Object}   tokens   token/options for connecting to twitter
 * @param  {String}   username twitter username
 * @return {Object}            promise
 */
function getTwitterFollowers(tokens, username) {
     const client = new Twitter(tokens);
     let deferred = q.defer();
     client.get('users/lookup.json?screen_name=' + username + ',', function (err, data, response) {
          if (err) {
               console.log('getTwitterFollowers error', err);
               deferred.reject(err);
          } else if (data && data[0]) {
               deferred.resolve(data[0].followers_count)
          }
     })
     return deferred.promise;
}

/**
 * wrapper for get twitter followers
 * @param  {String} id twitter username
 * @return {Object}    promise
 */
function checkTwitter(username) {
     var deferred = q.defer();
     if (typeof username !== 'undefined' && username !== null && username !== '') {
          getTwitterFollowers(tokens, username).then(followers => {
               if (followers) {
                    deferred.resolve({
                         'twitter-followers': followers
                    });
               } else {
                    deferred.resolve(null);
               }
          }).catch(function (err) {
            console.log('err followers',err);
               deferred.resolve(null);
          });
     } else {
          deferred.resolve(null)
     }
     return deferred.promise;
}

/**
 * calls sharedcount api for getting social media information of url
 * @param  {String} url url to scan
 * @return {Object}     promise
 */
function checkShareCount(url) {
     let deferred = q.defer(),
          shareCountURL = 'https://api.sharedcount.com/v1.0/?apikey=' + process.env.SHARED_COUNT_APIKEY + '&url=' + url

     bhttp.get(shareCountURL, {
          responseTimeout: 30000
     }, function (err, response) {
          if (response && response.body) {
               if (response.body.Error) {
                    deferred.reject(response.body.Error);
               } else {
                    deferred.resolve({
                         'shared-count': response.body
                    });
               }
          } else {
               deferred.reject(err);
          }
     });
     return deferred.promise;
};

/**
 * wrapper for twitter and sharedcount api calls for url
 * @param  {String} url       url to scan
 * @param  {String} twitterId twitter username
 * @return {Object}           promise
 */
function checkSocial(url, twitterId) {
     var deferred = q.defer();
     q.all([checkShareCount(url), checkTwitter(twitterId)]).then(function (res) {
          deferred.resolve(res);
     }).catch(function (err) {
          deferred.reject(err);
     })
     return deferred.promise;
}

module.exports = checkSocial;
