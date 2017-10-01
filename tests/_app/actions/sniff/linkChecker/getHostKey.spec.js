var chai = require('chai'),
     expect = chai.expect,
     defaultOptions = require('../../../../../app/actions/sniff/linkChecker/defaultOptions'),
     getHostKey = require('../../../../../app/actions/sniff/linkChecker/getHostKey'),
     _ = require('underscore'),
     sinon = require('sinon');

describe('app/actions/sniff/linkChecker/getHostKey', function () {

     it('return base host name as string', function () {
          var response = getHostKey('http://www.test.com', defaultOptions);
          expect(response === 'test.com/').to.equal(true);
     });

     it('return base host name as object', function () {
          var obj = {
               protocol: 'http:',
               slashes: true,
               auth: null,
               host: 'www.test.com',
               port: null,
               hostname: 'www.test.com',
               hash: null,
               search: null,
               query: null,
               pathname: '/',
               path: '/',
               href: 'http://www.test.com/'
          }
          var response = getHostKey(obj, defaultOptions);
          expect(response === 'test.com/').to.equal(true);
     });

     it('return false if protocol not defined on parsed object', function () {
          var obj = {
               protocol: 'http://',
               slashes: true,
               auth: null,
               host: 'www.test.com',
               port: null,
               hostname: null,
               hash: null,
               search: null,
               query: null,
               pathname: '/',
               path: '/',
               href: 'http://www.test.com/',
               parsed:{

               }
          }
          var response = getHostKey(obj, defaultOptions);
          expect(response === false).to.equal(true);
     });

     it('return false if hostname not defined on parsed object', function () {
          var obj = {
               protocol: 'http://',
               slashes: true,
               auth: null,
               host: 'www.test.com',
               port: null,
               hostname: null,
               hash: null,
               search: null,
               query: null,
               pathname: '/',
               path: '/',
               href: 'http://www.test.com/',
               parsed:{
                 protocol: 'http://'
               }
          }
          var response = getHostKey(obj, defaultOptions);
          expect(response === false).to.equal(true);
     });
     it('return base url if providing parsed protocol and hostname', function () {
          var obj = {
               protocol: 'http://',
               slashes: true,
               auth: null,
               host: 'www.test.com',
               port: null,
               hostname: null,
               hash: null,
               search: null,
               query: null,
               pathname: '/',
               path: '/',
               href: 'http://www.test.com/',
               parsed:{
                 protocol: 'http://',
                 hostname: 'www.test.com'
               }
          }
          var response = getHostKey(obj, defaultOptions);
          //console.log('RESPONSE',response);
          expect(response === 'test.com/').to.equal(true);
     });

     it('default ports and ignoreSchemes', function () {
          var obj = {
               protocol: 'http://',
               slashes: true,
               auth: null,
               host: 'www.test.com',
               port: null,
               hostname: null,
               hash: null,
               search: null,
               query: null,
               pathname: '/',
               path: '/',
               href: 'http://www.test.com/',
               parsed:{
                 protocol: 'http://',
                 hostname: 'www.test.com'
               }
          }
          var options = defaultOptions;
          options.defaultPorts['http://'] = 3000;
          options.ignoreSchemes = false;
          options.ignoreSubdomains = false;
          var response = getHostKey(obj, options);
          expect(response === 'http://://www.test.com/').to.equal(true);
     });

     it('ignoring ports', function () {
          var obj = {
               protocol: 'http://',
               slashes: true,
               auth: null,
               host: 'www.test.com',
               port: null,
               hostname: null,
               hash: null,
               search: null,
               query: null,
               pathname: '/',
               path: '/',
               href: 'http://www.test.com/',
               parsed:{
                 protocol: 'http://',
                 hostname: 'www.test.com'
               }
          }
          var options = defaultOptions;
          options.defaultPorts['http://'] = 3000;
          options.ignorePorts = false;
          var response = getHostKey(obj, options);
          expect(response === 'http://://www.test.com:3000/').to.equal(true);
     });


});
