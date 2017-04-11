var chai = require('chai'),
     expect = chai.expect,
     _ = require('underscore'),
     processMetaData = require('../../../../../app/settings/requests/meta/process'),
     sinon = require('sinon');

var harResponseData = {
     url: {
          resolvedUrl: 'test'
     },
     log: {
          entries: [{
                    request: {
                         url: 'http://whatever.com'
                    },
                    response: {
                         headers: [{
                                   name: 'Content-Encoding',
                                   value: 'gzip'
                              },
                              {
                                   name: 'Content-Type',
                                   value: 'application/x-javascript'
                              },
                              {
                                   name: "Cache-Control",
                                   value: true
                              }
                         ]
                    }
               },
               {
                    request: {
                         url: "http://www.uncached.unecoded.invalidcontenttype.com.index.js"
                    },
                    response: {
                         headers: [{
                                   name: 'Content-Encoding',
                                   value: 'fakenonesense'
                              },
                              {
                                   name: 'Content-Type',
                                   value: 'fakenonesense'
                              },
                              {
                                   name: "Cache-Control",
                                   value: false
                              }
                         ]
                    }
               },
               {
                    nothing: 'useful'
               }
          ]
     },
     links: [{
          url: {
               resolvedUrl: 'someinthg'
          }
     }]
}

describe('app/settings/requests/meta/process.js: without meta data', function () {
     var input = {
          options: {
               save: {
                    metaData: true
               }
          }
     };

     var res = {
          links: [{
               html: {
                    tagName: 'a'
               },
               url: {
                    original: "test"
               }
          }]
     }

     it('will show 4 meta data errors', function (done) {
          var result = processMetaData(harResponseData, input, res);
          expect(result.issues.tooManyLinks === false).to.equal(true);
          expect(result.issues.security === 0).to.equal(true);
          expect(result.issues.meta === 4).to.equal(true);
          expect(result.issues.links === 0).to.equal(true);
          done();
     });

});


var harResponseData = {
     url: {
          resolvedUrl: 'test'
     },
     log: {
          entries: [{
                    request: {
                         url: 'http://whatever.com'
                    },
                    response: {
                         headers: [{
                                   name: 'Content-Encoding',
                                   value: 'gzip'
                              },
                              {
                                   name: 'Content-Type',
                                   value: 'application/x-javascript'
                              },
                              {
                                   name: "Cache-Control",
                                   value: true
                              }
                         ]
                    }
               },
               {
                    request: {
                         url: "http://www.uncached.unecoded.invalidcontenttype.com.index.js"
                    },
                    response: {
                         headers: [{
                                   name: 'Content-Encoding',
                                   value: 'fakenonesense'
                              },
                              {
                                   name: 'Content-Type',
                                   value: 'fakenonesense'
                              },
                              {
                                   name: "Cache-Control",
                                   value: false
                              }
                         ]
                    }
               },
               {
                    nothing: 'useful'
               }
          ]
     },
     links: [{
          url: {
               resolvedUrl: 'someinthg'
          }
     }]
}

describe('app/settings/requests/meta/process.js with meta data:', function () {
     var input = {
          options: {
               save: {
                    metaData: true
               }
          }
     };

     var res = {
          links: [
            {
                specialCase:'h2',
                 html: {
                      attrs:{
                        content: 'some stuff'
                      },
                      tagName: 'meta'
                 },
                 url: {
                      original: "test"
                 }
            },
            {
                specialCase:'h1',
                 html: {
                      attrs:{
                        content: 'some stuff'
                      },
                      tagName: 'meta'
                 },
                 url: {
                      original: "test"
                 }
            },
            {
                specialCase:'title',
                 html: {
                      attrs:{
                        content: 'some stuff'
                      },
                      tagName: 'meta'
                 },
                 url: {
                      original: "test"
                 }
            },
            {
                 html: {
                      attrs:{
                        content: 'some stuff'
                      },
                      tagName: 'meta'
                 },
                 url: {
                      original: "test"
                 }
            },
            {
                specialCase:'notavalidoneshouldnthappenanyway...',
                 html: {
                      attrs:{
                        content: 'some stuff'
                      },
                      tagName: 'a'
                 },
                 url: {
                      original: "test"
                 }
            },
            {
                 html: {
                      attrs:{
                        content: 'some stuff'
                      },
                      tagName: 'a'
                 },
                 url: {
                      original: "whatever:"
                 }
            },
            {
                 html: {
                      attrs:{
                        content: 'some stuff'
                      },
                      tagName: 'a'
                 },
                 url: {
                      original: "tel:"
                 }
            },
            {
                specialCase:'ignored mailto link',
                 html: {
                      attrs:{
                        content: 'some stuff'
                      },
                      tagName: 'a'
                 },
                 url: {
                      original: "mailto:jogn@mail.com"
                 }
            },
            {
                 html: {
                      attrs:{
                        content: 'some stuff'
                      },
                      tagName: 'a'
                 },
                 url: {
                      original: "mailto:jogn@mail.com"
                 }
            },
            {
              specialCase:'description',
               html: {
                    attrs:{
                      content: 'some stuff'
                    },
                    tagName: 'meta'
               },
               url: {
                    original: "test"
               }
          }]
     }

     var data = _.clone(harResponseData);
     data.emails = [];
     it('finds all expected meta values', function (done){
          var result = processMetaData(data, input, res);
          //console.log('result',result);
          expect(result.issues.noIssues).to.equal(true);
          done();
     });

});


describe('app/settings/requests/meta/process.js with resources:', function () {
     var input = {
          options: {
               save: {
                    metaData: true
               }
          }
     };

     var res = {
          links: [
            {
                specialCase:'h2',
                 html: {
                      attrs:{
                        content: 'some stuff'
                      },
                      tagName: 'meta'
                 },
                 url: {
                      original: "test"
                 }
            },
            {
                specialCase:'h1',
                 html: {
                      attrs:{
                        content: 'some stuff'
                      },
                      tagName: 'meta'
                 },
                 url: {
                      original: "test"
                 }
            },
            {
                specialCase:'title',
                 html: {
                      attrs:{
                        content: 'some stuff'
                      },
                      tagName: 'meta'
                 },
                 url: {
                      original: "test"
                 }
            },
            {
                 html: {
                      attrs:{
                        content: 'some stuff'
                      },
                      tagName: 'meta'
                 },
                 url: {
                      original: "test"
                 }
            },
            {
                specialCase:'notavalidoneshouldnthappenanyway...',
                 html: {
                      attrs:{
                        content: 'some stuff'
                      },
                      tagName: 'a'
                 },
                 url: {
                      original: "test"
                 }
            },
            {
                specialCase:'an ignored telephone link',
                 html: {
                      attrs:{
                        content: 'some stuff'
                      },
                      tagName: 'a'
                 },
                 url: {
                      original: "tel:"
                 }
            },
            {
                specialCase:'ignored mailto link',
                 html: {
                      attrs:{
                        content: 'some stuff'
                      },
                      tagName: 'a'
                 },
                 url: {
                      original: "mailto:jogn@mail.com"
                 }
            },
            {
              specialCase:'description',
               html: {
                    attrs:{
                      content: 'some stuff'
                    },
                    tagName: 'meta'
               },
               url: {
                    original: "test"
               }
          }]
     }

     it('detects if gzipped or cached', function (done){
          var data = _.clone(harResponseData);
          data.resources = [
            {
              gzip:null,
              cached:null,
              minified:null,
              status: 200
            },
            {
              gzip:true,
              cached:true,
              minified:true,
              status:400
            }
          ];
          var result = processMetaData(data, input, res);
          //console.log('result--',result);
          expect(result.issues.resources === 4).to.equal(true);
          done();
     });

     it('detects if there are too many links on a page', function (done){
          var data = _.clone(harResponseData);
          var rres = _.clone(res);
          for (var i = 0; i < 110; i++) {
            rres.links.push({
                           html: {
                                attrs:{
                                  content: 'some stuff'
                                },
                                tagName: 'a'
                           },
                           url: {
                                original: "test"
                           }
                      });
          }
          data.resources = [
            {
              gzip:null,
              cached:null,
              minified:null,
              status: 200
            },
            {
              gzip:true,
              cached:true,
              minified:true,
              status:400
            }
          ];
          data.emails = [
            {
              email:'whatever@yeah.com'
            }
          ]
          var result = processMetaData(data, input, rres);
          expect(result.issues.tooManyLinks).to.equal(true);
          done();
     });

});
