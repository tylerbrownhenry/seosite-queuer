
/**
 * opens a url and checks the html for visible taptargets that are too small for mobile
 * @param  {String} siteURL url to scan
 */
// function tapTargetCheck(siteURL) {
//      let promise = q.defer(),
//           myVar = setTimeout(function () {
//                console.log('timed out tapTargetCheck',siteURL);
//           }, 31000),
//           size = ['1024', '768'];
//      open({
//           emulate: function (page) {
//                return page.emulate(devices['iPhone 6']);
//           },
//           processRequest: true,
//           evalutePage: evalutePage,
//           evaluteResults: function (response, options, pageInfo) {
//               let deferred = q.defer();
//               var headers = response.resources[_.keys(response.resources)[0]].request.headers;

                // wappalyzer.analyze(siteURL, {
                //   html:pageInfo.html,
                //   env: pageInfo.vars,
                //   headers:headers,
                //   url: siteURL
                // }).then(json => {
                  // deferred.resolve({failed:pageInfo.failed});
                  // console.log('wappalyzer success', json);
                // })
                // .catch(error => {
                  // console.log('wappalyzer failed', error);
                  // deferred.resolve({failed:pageInfo.failed,softwareSummary:{error:error}});
                // });

//                return deferred.promise;
//           },
//           address: siteURL,
//           requestId: null
//      }).then((res) => {
//           clearTimeout(myVar);
//           console.log('tapTargetCheck success', res,'siteURL',siteURL);
//           promise.resolve(res);
//      }).catch((e) => {
//           clearTimeout(myVar);
//           console.log('tapTargetCheck error', e,'siteURL',siteURL);
//           promise.reject(e);
//      })
//
//      return promise.promise;
// }
