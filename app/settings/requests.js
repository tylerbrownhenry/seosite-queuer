"use strict";
var q = require('q');
var _ = require('underscore');

module.exports = {
     types: {
          link: require('./requests/link').init,
          retry: require('./requests/retry').init,
          resource: require('./requests/resource').init,
          pageScan: require('./requests/pageScan/process').process,
          capture: require('./requests/capture'),
          actions: require('./requests/actions').process,
          customerUpdates: require('./requests/customerUpdates')
     }
}
