// let q = require('q'),
    //  _ = require('underscore'),
    //  wappalyzer = require('wappalyzer'),
    //  devices = require('puppeteer/DeviceDescriptors'),
    //  open = require('../browse/open');

function evalutePage(page) {




     var failed = false;

     /**
      * Author: Jason Farrell
      * Author URI: http://useallfive.com/
      *
      * Description: Checks if a DOM element is truly visible.
      * Package URL: https://github.com/UseAllFive/true-visibility
      */
     Element.prototype.isVisible = function () {

          'use strict';

          /**
           * Checks if a DOM element is visible. Takes into
           * consideration its parents and overflow.
           *
           * @param (el)      the DOM element to check if is visible
           *
           * These params are optional that are sent in recursively,
           * you typically won't use these:
           *
           * @param (t)       Top corner position number
           * @param (r)       Right corner position number
           * @param (b)       Bottom corner position number
           * @param (l)       Left corner position number
           * @param (w)       Element width number
           * @param (h)       Element height number
           */
          function _isVisible(el, t, r, b, l, w, h) {
               var p = el.parentNode,
                    VISIBLE_PADDING = 2;

               if (!_elementInDocument(el)) {
                    return false;
               }

               //-- Return true for document node
               if (9 === p.nodeType) {
                    return true;
               }

               //-- Return false if our element is invisible
               if (
                    '0' === _getStyle(el, 'opacity') ||
                    'none' === _getStyle(el, 'display') ||
                    'hidden' === _getStyle(el, 'visibility')
               ) {
                    return false;
               }

               if (
                    'undefined' === typeof (t) ||
                    'undefined' === typeof (r) ||
                    'undefined' === typeof (b) ||
                    'undefined' === typeof (l) ||
                    'undefined' === typeof (w) ||
                    'undefined' === typeof (h)
               ) {
                    t = el.offsetTop;
                    l = el.offsetLeft;
                    b = t + el.offsetHeight;
                    r = l + el.offsetWidth;
                    w = el.offsetWidth;
                    h = el.offsetHeight;
               }
               //-- If we have a parent, let's continue:
               if (p) {
                    //-- Check if the parent can hide its children.
                    if (('hidden' === _getStyle(p, 'overflow') || 'scroll' === _getStyle(p, 'overflow'))) {
                         //-- Only check if the offset is different for the parent
                         if (
                              //-- If the target element is to the right of the parent elm
                              l + VISIBLE_PADDING > p.offsetWidth + p.scrollLeft ||
                              //-- If the target element is to the left of the parent elm
                              l + w - VISIBLE_PADDING < p.scrollLeft ||
                              //-- If the target element is under the parent elm
                              t + VISIBLE_PADDING > p.offsetHeight + p.scrollTop ||
                              //-- If the target element is above the parent elm
                              t + h - VISIBLE_PADDING < p.scrollTop
                         ) {
                              //-- Our target element is out of bounds:
                              return false;
                         }
                    }
                    //-- Add the offset parent's left/top coords to our element's offset:
                    if (el.offsetParent === p) {
                         l += p.offsetLeft;
                         t += p.offsetTop;
                    }
                    //-- Let's recursively check upwards:
                    return _isVisible(p, t, r, b, l, w, h);
               }
               return true;
          }

          //-- Cross browser method to get style properties:
          function _getStyle(el, property) {
               if (window.getComputedStyle) {
                    return document.defaultView.getComputedStyle(el, null)[property];
               }
               if (el.currentStyle) {
                    return el.currentStyle[property];
               }
          }

          function _elementInDocument(element) {
               while (element = element.parentNode) {
                    if (element == document) {
                         return true;
                    }
               }
               return false;
          }

          return _isVisible(this);

     };

     function checkTargetSize(target) {
          var style = window.getComputedStyle(target);
          var height = Number(style.width.replace('px', ''));
          var width = Number(style.height.replace('px', ''));
          if (!isNaN(width) && width < 40 || !isNaN(height) && height < 40) {
               return 'tooSmall';
          }
          return false;
     }

     //  function checkTargetProximity(){
     //    //later (maybeNever)
     //  }

     //  function checkTargetStacking(){
     //    //later (maybeNever)
     //  }

     function cleanSelections(input, tapTargets) {
          var newArr = [];
          for (var i = 0, max = input.length; i < max; i++) {
               newArr.push(input[i]);
          }
          return tapTargets.concat(newArr);
     }

     var tapTargets = [];
     var issues = [];
     tapTargets = cleanSelections(document.getElementsByTagName("input"), tapTargets);
     tapTargets = cleanSelections(document.getElementsByTagName("textarea"), tapTargets);
     tapTargets = cleanSelections(document.getElementsByTagName("select"), tapTargets);
     tapTargets = cleanSelections(document.getElementsByTagName("a"), tapTargets);
     tapTargets = cleanSelections(document.getElementsByTagName("button"), tapTargets);

     for (var i = 0, max = tapTargets.length; i < max && failed === false; i++) {
          if (tapTargets[i] && typeof tapTargets[i].isVisible === 'function' && tapTargets[i].isVisible() === true) {
               if (checkTargetSize(tapTargets[i]) === 'tooSmall') {
                    failed = true;
               }
          }

     }
     return {
          // html : document.documentElement.outerHTML,
          failed: failed
     };

}

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

module.exports = evalutePage;
