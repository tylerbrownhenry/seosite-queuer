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

function minJs(code, callback) {
     _minJS(code, {
          charset: 'utf8',
          type: 'js',
          nomunge: true,
          'line-break': 80
     }, function (err, data, extra) {
          if (data) {
               callback(data.length);
          } else {
               callback();
          }
     })
}

function checkCSS(url, callback) {
     bhttp.get(url, {}, (err, response) => {
          if (response && response.body) {
               let body = response.body.toString()
               let hasMediaQueries = (body.search('@media[^{]*\{(?:(?!\}\s*\}).)*') !== -1) ? true : false;
               let hasPrintStyles = (body.search('@media print') !== -1) ? true : false;
               let resp = 0;
               try {
                    resp = new CleanCSS({}).minify(body);
               } catch (e) {
                    resp = 0;
               }
               callback(resp, hasMediaQueries, hasPrintStyles);
          }
     });
}

function checkJS(url, callback) {
     bhttp.get(url, {}, (err, response) => {
          if (response && response.body) {
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
                         callback();
                    }
               });
          } else {
               callback();
          }
     });
}

function checkHTML(url, callback) {
     bhttp.get(url, {}, (err, response) => {
          if (response && response.body) {
               var body = response.body.toString();
               var minSize = Number(minifyHtml(body).length);
               var originalSize = body.length;
               var results = {
                    stats: {
                         efficiency: 1 - minSize / originalSize,
                         minifiedSize: minSize,
                         originalSize: originalSize
                    }
               }
               callback(results);
          }
     });
}

function checkIMAGE(url, callback) {

     request.get(url, (error, response, body) => {
          if (!error && response.statusCode == 200) {
               data = new Buffer(body);
               let originalSize = data.byteLength;
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
               });

          }
     });
}

module.exports = function (resource, callback) {
     if (resource.type === 'js') {
          checkJS(resource.url, (resp) => {
               if (resp) {
                    callback(null, resp);
               } else {
                    callback(true);
               }
          });
     } else if (resource.type === 'css') {
          checkCSS(resource.url, (resp, hasMediaQueries, hasPrintStyles) => {
               resp.css = {
                    hasMediaQueries: hasMediaQueries,
                    hasPrintStyles: hasPrintStyles
               }
               if (resp) {
                    callback(null, resp);
               } else {
                    callback(true);
               }
          });
     } else if (resource.type === 'html') {
          checkHTML(resource.url, (resp) => {
               if (resp) {
                    callback(null, resp);
               } else {
                    callback(true);
               }
          });
     } else if (resource.type === 'img') {
          checkIMAGE(resource.url, (resp) => {
               if (resp) {
                    callback(null, resp);
               } else {
                    callback(true);
               }
          });
     } else {
          callback(true)
     }
}
