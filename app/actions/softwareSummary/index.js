const wappalyzer = require('./wappalyzer/driver'),
     q = require('q'),
     _ = require('underscore');

module.exports = (siteURL,response,pageInfo) => {
  let deferred = q.defer();
  var headers = response.resources[_.keys(response.resources)[0]].request.headers;
    wappalyzer.analyze(siteURL, {
      html:pageInfo.content,
      env: pageInfo.vars,
      headers:headers,
      url: siteURL
    }).then((json) => {
      deferred.resolve({failed:pageInfo.failed,softwareSummary:json});
    })
    .catch((error) => {
      deferred.resolve({failed:pageInfo.failed,softwareSummary:{error:error}});
    });
   return deferred.promise;
};
