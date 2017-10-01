var chai = require('chai'),
     expect = chai.expect,
     excludeLink = require('../../../../../app/actions/sniff/linkChecker/excludeLink'),
     defaultOptions = require('../../../../../app/actions/sniff/linkChecker/defaultOptions'),
     RobotDirectives = require("robot-directives"),
     _ = require('underscore'),
     sinon = require('sinon');

describe('app/actions/sniff/linkChecker/excludeLink', function () {

     var instance = {
          options: defaultOptions,
          robots: new RobotDirectives({
               userAgent: defaultOptions.userAgent /* Is default what we want? */
          })
     }

     var link = {
          broken: null,
          brokenReason: null,
          broken_link_checker: true,
          excluded: null,
          excludedReason: null,
          html: {
               attrName: "href",
               attrs: {
                    href: "http://twitter.com/intent/tweet?text=Home http://mariojacome.com/",
                    target: "_blank"
               },
               base: null,
               index: 38,
               location: {
                    col: 10,
                    endOffset: 38420,
                    line: 345,
                    startOffset: 38348
               },
               offsetIndex: null,
               selector: "html > body > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > a:nth-child(1)",
               tag: '<a href="http://twitter.com/intent/tweet?text=Home http://mariojacome.com/" target="_blank">',
               tagName: "a",
               text: ""
          },
          http: {
               cached: null,
               response: null
          },
          internal: null,
          resolved: false,
          samePage: null,
          url: {
               original: "http://twitter.com/intent/tweet?text=Home http://mariojacome.com/",
               parsed: {
                    extra: {
                         protocolTruncated: false
                    }
               },
               redirected: null,
               resolved: null,
          }
     };

     it('returns false for valid links', function () {
          var response = excludeLink(link, instance);
          expect(response === false).to.equal(true);
     });

     it('returns BLC_HTML for invalid tagNames', function () {
          link.html.tagName = 'nonsense';
          var response = excludeLink(link, instance);
          expect(response === 'BLC_HTML').to.equal(true);
     });

     it('when wanting to exlude external links, exclude them', function () {
          link.html.tagName = 'a';
          link.internal = false;
          var response = excludeLink(link, instance);
          //console.log('response',response);
          expect(response === 'BLC_EXTERNAL').to.equal(true);
     });

     it('when wanting to exlude internal links, exclude them', function () {
          link.html.tagName = 'a';
          link.internal = true;
          instance.options.excludeInternalLinks = true;
          var response = excludeLink(link, instance);
          expect(response === 'BLC_INTERNAL').to.equal(true);
     });

     it('when wanting to exlude links to same page, exclude them', function () {
          link.html.tagName = 'a';
          link.internal = true;
          link.samePage = true;
          instance.options.excludeInternalLinks = false;
          instance.options.excludeLinksToSamePage = true;
          var response = excludeLink(link, instance);
          expect(response === 'BLC_SAMEPAGE').to.equal(true);
     });

     it('when wanting to exlude schemas, exclude them', function () {
          link.html.tagName = 'a';
          link.internal = true;
          link.samePage = false;
          instance.options.excludeInternalLinks = false;
          instance.options.excludeLinksToSamePage = false;
          link.url.parsed.extra.protocolTruncated = 'data';
          var response = excludeLink(link, instance);
          expect(response === 'BLC_SCHEME').to.equal(true);
     });

     it('when wanting to honorRobotExclusions, honor them', function () {
          link.html.tagName = 'a';
          link.internal = true;
          link.samePage = false;
          instance.options.excludeInternalLinks = false;
          instance.options.excludeLinksToSamePage = false;
          link.url.parsed.extra.protocolTruncated = 'a';
          instance.options.honorRobotExclusions = true;
          var response = excludeLink(link, instance);
          expect(response === false).to.equal(true);
     });

     it('when wanting to honorRobotExclusions, honor them', function () {
          link.html.tagName = 'a';
          link.internal = true;
          link.samePage = false;
          instance.options.excludeInternalLinks = false;
          instance.options.excludeLinksToSamePage = false;
          link.url.parsed.extra.protocolTruncated = 'a';
          instance.options.honorRobotExclusions = true;

          instance.robots.oneIs = function () {
               return true;
          }

          var response = excludeLink(link, instance);
          expect(response === 'BLC_ROBOTS').to.equal(true);
     });

     it('when wanting to honorRobotExclusions, honor them', function () {
          link.html.tagName = 'img';
          link.html.attrName = 'src';
          link.internal = true;
          link.samePage = false;
          instance.options.tags[1].img = {
               src: true
          };
          instance.options.excludeInternalLinks = false;
          instance.options.excludeLinksToSamePage = false;
          link.url.parsed.extra.protocolTruncated = 'a';
          instance.options.honorRobotExclusions = true;

          instance.robots.oneIs = function () {
               return false;
          }

          instance.robots.is = function () {
               return true;
          }

          var response = excludeLink(link, instance);
          expect(response === 'BLC_ROBOTS').to.equal(true);
     });

     it('when wanting to honorRobotExclusions, honor them', function () {
          link.html.tagName = 'input';
          link.html.attrName = 'src';
          link.internal = true;
          link.samePage = false;
          instance.options.tags[1].img = {
               src: true
          };
          instance.options.excludeInternalLinks = false;
          instance.options.excludeLinksToSamePage = false;
          link.url.parsed.extra.protocolTruncated = 'a';
          instance.options.honorRobotExclusions = true;

          instance.robots.oneIs = function () {
               return false;
          }

          instance.robots.is = function () {
               return true;
          }

          var response = excludeLink(link, instance);
          expect(response === 'BLC_ROBOTS').to.equal(true);
     });

     it('when wanting to honorRobotExclusions, honor them', function () {
          link.html.tagName = 'menuitem';
          link.html.attrName = 'icon';
          link.internal = true;
          link.samePage = false;
          instance.options.tags[1].img = {
               src: true
          };
          instance.options.excludeInternalLinks = false;
          instance.options.excludeLinksToSamePage = false;
          link.url.parsed.extra.protocolTruncated = 'a';
          instance.options.honorRobotExclusions = true;

          instance.robots.oneIs = function () {
               return false;
          }

          instance.robots.is = function () {
               return true;
          }

          var response = excludeLink(link, instance);
          expect(response === 'BLC_ROBOTS').to.equal(true);
     });

     it('when wanting to honorRobotExclusions, honor them', function () {
          link.html.tagName = 'video';
          link.html.attrName = 'poster';
          link.internal = true;
          link.samePage = false;
          instance.options.tags[1].img = {
               src: true
          };
          instance.options.excludeInternalLinks = false;
          instance.options.excludeLinksToSamePage = false;
          link.url.parsed.extra.protocolTruncated = 'a';
          instance.options.honorRobotExclusions = true;

          instance.robots.oneIs = function () {
               return false;
          }

          instance.robots.is = function () {
               return true;
          }

          var response = excludeLink(link, instance);
          expect(response === 'BLC_ROBOTS').to.equal(true);
     });

     it('when wanting to honorRobotExclusions, honor them', function () {
          link.html.tagName = 'a';
          link.html.attrName = 'href';
          link.internal = true;
          link.samePage = false;
          instance.options.tags[1].img = {
               src: true
          };
          instance.options.excludeInternalLinks = false;
          instance.options.excludeLinksToSamePage = false;
          link.url.parsed.extra.protocolTruncated = 'a';
          instance.options.honorRobotExclusions = true;

          instance.robots.oneIs = function () {
               return false;
          }

          instance.robots.is = function () {
               return true;
          }

          var response = excludeLink(link, instance);
          expect(response === false).to.equal(true);
     });

     it('when wanting to honorRobotExclusions, honor them', function () {
          link.html.tagName = 'a';
          link.html.attrName = 'href';
          link.html.attrs.rel = 'nofollow';
          link.internal = true;
          link.samePage = false;
          instance.options.tags[1].img = {
               src: true
          };
          instance.options.excludeInternalLinks = false;
          instance.options.excludeLinksToSamePage = false;
          link.url.parsed.extra.protocolTruncated = 'a';
          instance.options.honorRobotExclusions = true;

          instance.robots.oneIs = function () {
               return false;
          }

          instance.robots.is = function () {
               return true;
          }

          var response = excludeLink(link, instance);
          expect(response === 'BLC_ROBOTS').to.equal(true);
     });

     it('exclude keywords from url', function () {
          link.html.tagName = 'a';
          link.html.attrName = 'href';
          link.html.attrs.rel = null;
          link.internal = true;
          link.samePage = false;
          link.url.resolved = 'fail.com';
          instance.options.tags[1].img = {
               src: true
          };
          instance.options.excludeInternalLinks = false;
          instance.options.excludeLinksToSamePage = false;
          link.url.parsed.extra.protocolTruncated = 'a';
          instance.options.honorRobotExclusions = true;
          instance.options.excludedKeywords = 'fail';
          instance.robots.oneIs = function () {
               return false;
          }

          instance.robots.is = function () {
               return true;
          }

          var response = excludeLink(link,
               instance);
          expect(response === 'BLC_KEYWORD').to.equal(true);
     });

     it('exclude keywords from url', function () {
          link.html.tagName = 'a';
          link.html.attrName = 'href';
          link.html.attrs.rel = null;
          link.internal = true;
          link.samePage = false;
          link.url.resolved = 'true.com';
          instance.options.tags[1].img = {
               src: true
          };
          instance.options.excludeInternalLinks = false;
          instance.options.excludeLinksToSamePage = false;
          link.url.parsed.extra.protocolTruncated = 'a';
          instance.options.honorRobotExclusions = false;
          instance.options.excludedKeywords = [];
          instance.robots.oneIs = function () {
               return false;
          }

          instance.robots.is = function () {
               return true;
          }

          var response = excludeLink(link,
               instance);
          expect(response === false).to.equal(true);
     });

});
