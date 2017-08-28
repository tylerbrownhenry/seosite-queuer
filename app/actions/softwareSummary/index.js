const wappalyzer = require('wappalyzer'),
     q = require('q');

module.exports = function (siteURL,response,pageInfo) {
  let deferred = q.defer();
  var headers = response.resources[_.keys(response.resources)[0]].request.headers;
  console.log('softwareSummary-->',pageInfo,'headers',headers, 'siteURL',siteURL);
    wappalyzer.analyze(siteURL, {
      html:pageInfo.content,
      env: pageInfo.vars,
      headers:headers,
      url: siteURL
    }).then(json => {
      deferred.resolve({failed:pageInfo.failed,softwareSummary:json});
      console.log('wappalyzer success', json);
    })
    .catch(error => {
      console.log('wappalyzer failed', error);
      deferred.resolve({failed:pageInfo.failed,softwareSummary:{error:error}});
    });

   return deferred.promise;
};
