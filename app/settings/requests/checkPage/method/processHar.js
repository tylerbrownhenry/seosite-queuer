let utils = require('../../../../utils'),
     Scan = require('../../../../models/scan'),
    //  actions = require("../../clean_actions"),
     q = require("q"),
     _ = require("underscore");
/**
 * after scanning the page, parse the html for information
 * @param  {Object} input request info and options
 * @param  {Object} res   information returned from page scan
 */
function processHar(data,actions) {
      let res = data.res,
      input = data.input,
        url = input.url,
          options = input.options,
          deferred = q.defer(),
          requestId = input.requestId,
          uid = input.uid,
          source = input.source,
          processes = 1, /* w3c was published */
          isRetry = input.isRetry;

     res.emails = input.emails; /* TODO Double check if this is a length and if Scan has it */
     res.completedTime = utils.getNowUTC();

     res.uid = uid;
     res.tapTargetCheck = res.checkElements;
     res.requestId = requestId;

     let newScan = new Scan(res);

     const arrActions = [ /*'screenCapture',*/'meta', 'checkLinks', 'checkSSL', 'checkSocial', 'serverInfo', 'checkResources'];
     var processActions = [];
     _.each(arrActions, function (key) {
          processActions.push(actions[key].commands.publish.command({params:{
               action: key,
               command:'publish',
               input: input,
               res: res,
               newScan: newScan
          },promise:q.defer()}));
     });

     q.all(processActions).then((resp) => {
          _.each(resp, function (re) {
               processes += re.processes
          });

          utils.saveScan(newScan, (err) => {
               if (err !== null) {
                    return deferred.reject({
                         processes:processes,
                         message: 'error:save:scan'
                    });
               } else {
                    deferred.resolve({
                         processes:processes,
                         notify: true
                    });
               }
          })
     }).catch((e) => {
          console.log('processsHar error',e)
          return deferred.reject(e);
     })
     return deferred.promise;
}

module.exports = processHar;
