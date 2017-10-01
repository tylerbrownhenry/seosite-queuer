var sh = require('shorthash'),
     q = require('q'),
     Update = require('../models/update');

function publish(data) {
    let promise = q.defer(),
    update = {
          id: sh.unique(data.status + data.uid + (data.i_id || data.requestId)),
          uid: data.uid,
          i_id: data.i_id || data.requestId,
          status: data.status, // 'success' || 'error'
          statusType: data.statusType, // 'update' || 'complete' || 'failed'
          type: data.type, //'page:scan'
          message: data.message,
          source: data.source
     };
     update = new Update(update);
     update.save(function (err) {
          if (err) {
            promise.reject();
          } else {
              promise.resolve(update);

          }
     });
     return promise.promise;
}


module.exports = {
  publish : publish
}
