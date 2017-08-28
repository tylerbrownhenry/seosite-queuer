const _ = require('underscore');
bhttp = require("bhttp"),
     minifyHtml = require('html-minifier').minify,
     CleanCSS = require('clean-css'),
     _minJS = require('yuicompressor').compress,
     imagemin = require('imagemin'),
     imageminJpegtran = require('imagemin-jpegtran'),
     imageminPngquant = require('imagemin-pngquant'),
     imageminGifsicle = require('imagemin-gifsicle'),
     request = require('request').defaults({
          encoding: null
     });

/**
 * minifies a javascript screen and returns the minified length
 * @param  {String}   code     stringified body of a javascript file
 * @param  {Function} callback
 */
function minJs(code, callback) {
     try {
          _minJS(code, {
               charset: 'utf8',
               type: 'js',
               nomunge: true,
               'line-break': 80
          }, (err, data, extra) => {
               if (data && data.length) {
                    callback(data.length);
               } else {
                    callback();
               }
          });
     } catch (e) {
          console.log('minified js failed', e);
          callback();
     }
}

/**
 * checks a css file for media queries and print styles, then minifies it;
 * @param  {String}   url      url of a css file to fetch
 * @param  {Function} callback
 */
function checkCSS(url, callback) {
     bhttp.get(url, {
          responseTimeout: 30000
     }, (err, response) => {
          if (response && response.body) {
               let body = response.body.toString(),
                    hasMediaQueries = (body.search('@media[^{]*\{(?:(?!\}\s*\}).)*') !== -1) ? true : false,
                    hasPrintStyles = (body.search('@media print') !== -1) ? true : false,
                    resp = 0;
               try {
                    resp = new CleanCSS({}).minify(body);
               } catch (e) {
                    resp = 0;
               }
               callback(resp, hasMediaQueries, hasPrintStyles);
          } else {
               callback(0, false, false);
          }
     });
}

/**
 * gets the contents of a javascript file and passes it to a minifier
 * @param  {String}   url      url of javascript file
 * @param  {Function} callback
 */
function checkJS(url, callback) {
     bhttp.get(url, {
          responseTimeout: 30000
     }, (err, response) => {
          if (response && response.body) {
               try {
                    var resp = response.body.toString();
                    minJs(resp, (minSize) => {
                         if (minSize) {
                              var originalSize = resp.length;
                              var results = {
                                   stats: {
                                        efficiency: 1 - minSize / originalSize,
                                        minifiedSize: minSize,
                                        originalSize: originalSize
                                   }
                              }
                              callback(results);
                         } else {
                              console.log('minified js failure!', minSize);
                              callback();
                         }
                    });
               } catch (e) {
                    console.log('minified js failure!', e);
                    callback();
               }
          } else {
               console.log('resource minified failed', err, url);
               callback();
          }
     });
}

/**
 * fetches an html file and then attempts to minifiy it
 * @param  {String}   url      url to an html file
 * @param  {Function} callback
 */
function checkHTML(url, callback) {
     bhttp.get(url, {
          responseTimeout: 30000
     }, (err, response) => {
          if (response && response.body) {
               try {

                    let body = response.body.toString(),
                         minSize = Number(minifyHtml(body).length),
                         originalSize = body.length,
                         results = {
                              stats: {
                                   efficiency: 1 - minSize / originalSize,
                                   minifiedSize: minSize,
                                   originalSize: originalSize
                              }
                         }
                    callback(results);
               } catch (e) {
                    console.log('minified html failed', e);
                    callback();
               }
          }
     });
}

/**
 * fetches and img and then to minifies it and returns the comparsion of minfied to original
 * @param  {String}   url
 * @param  {Function} callback
 */
function checkIMAGE(url, callback) {
     request.get(url, {
          timeout: 30000
     }, (error, response, body) => {
          if (!error && response.statusCode == 200) {
               try {
                    let data = new Buffer(body),
                         originalSize = data.byteLength;
                    imagemin.buffer(data, {
                         options: {
                              optimizationLevel: 3,

                         },
                         plugins: [
                              imageminGifsicle(),
                              imageminJpegtran(),
                              imageminPngquant({
                                   quality: '65-80'
                              })
                         ]
                    }).then(files => {
                         let minSize = files.byteLength;
                         let results = {
                              stats: {
                                   efficiency: 1 - minSize / originalSize,
                                   minifiedSize: minSize,
                                   originalSize: originalSize
                              }
                         }
                         callback(results);
                    }).catch((e) => {
                         console.log('minified image failed', e);
                         callback();
                    })
               } catch (e) {
                    console.log('minified image failed', e);
                    callback();
               }
          } else {
               console.log('minified image failed', error);
               callback();
          }
     });
}

/**
 * sorts the input to the correct minify function
 * @param  {Object}   resource contains a type and url to fetch and minify
 * @param  {Function} callback
 */
module.exports = (resource, callback) => {
     if (resource.type === 'js') {
          try {
               checkJS(resource.url, (resp) => {
                    if (resp) {
                         callback(null, resp);
                    } else {
                         console.log('resource minified failed', resource.url);
                         callback(true);
                    }
               });
          } catch (e) {
               console.log('resource minified failed', resource.url);
               callback(true);
          }
     } else if (resource.type === 'css') {
          try {
               checkCSS(resource.url, (resp, hasMediaQueries, hasPrintStyles) => {
                    resp.css = {
                         hasMediaQueries: hasMediaQueries,
                         hasPrintStyles: hasPrintStyles
                    }
                    if (resp) {
                         callback(null, resp);
                    } else {
                         console.log('css minified failed', resource.url);
                         callback(true);
                    }
               });
          } catch (e) {
               console.log('css minified failed', resource.url);
               callback(true);
          }
     } else if (resource.type === 'html') {
          try {
               checkHTML(resource.url, (resp) => {
                    if (resp) {
                         callback(null, resp);
                    } else {
                         console.log('html minified failed', resource.url);
                         callback(true);
                    }
               });
          } catch (e) {
               console.log('html minified failed', resource.url);
               callback(true);
          }
     } else if (resource.type === 'img') {
          try {
               checkIMAGE(resource.url, (resp) => {
                    if (resp) {
                         callback(null, resp);
                    } else {
                         console.log('img minified failed', resource.url);
                         callback(true);
                    }
               });
          } catch (e) {
               console.log('img minified failed', resource.url);
               callback(true);
          }
     } else {
          callback(true)
     }
}
