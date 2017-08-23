var _ = require('underscore');
var q = require('q');
var w3cjs = require('w3cjs');


/**
 * checks W3C Compatibility of string of html
 * @param  {String}   html      string of html
 * @param  {Function} callback
 * @return {Boolean}
 */
module.exports = (html, parse) => {
     var promise = q.defer();
     var results = w3cjs.validate({
         input: html,
         output: 'json',
         callback: function (err,res) {
            if(err){
              promise.reject(err);
            }
             var resp = {
                  valid: false,
                  warnings: 0,
                  infos: 0,
                  errors: 0
             }
             if(res.messages){
               _.each(res.messages, function (message) {
                    if (message.type === 'warning') {
                         resp.warnings++;
                    } else if(message.type === 'error') {
                         resp.errors++;
                    }else if(message.type === 'info') {
                         resp.infos++;
                    }
               });
             }
             promise.resolve(resp);
         }
     });
     return promise.promise;
}
