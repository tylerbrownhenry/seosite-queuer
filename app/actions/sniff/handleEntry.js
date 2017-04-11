var q = require('q');
var _ = require('underscore');
var request = require('request');
var http = require('http');
var zlib = require('zlib');

function handleHeaders(obj, list) {
     _.each(_.keys(list), function (headerKey) {
          obj += headerKey + ': ' + list[headerKey] + '\r\n';
     });
     return obj += '\r\n';
}

module.exports = function entryHandler(entry, idx, key, options) {
     var promise = q.defer();

     var reqOpts = {
          method: entry.request.method,
          url: entry.request.url,
          headers: {},
          timeout: options.resouceDelay || 20000
     };

     _.each(entry.request.headers, function (header) {
          reqOpts.headers[header.name] = header.value;
     });

     var rawReqHeaders = handleHeaders('HTTP/1.1 GET ' + entry.request.url + '\r\n', reqOpts.headers);

     rawReqHeaders += '\r\n';

     request(reqOpts)
          .on('error', function (err) {
               //console.log('entry error', err);
               promise.resolve({
                    idx: idx,
                    url: entry.request.url,
                    method: entry.request.method,
                    data:err,
                    status: 'failed'
               });
          })
          .on('response', function (res) {
               //console.log('entry response');
               try {
                    var rawResHeaders = ('HTTP/' + res.httpVersion + ' ' + res.statusCode + ' ' + http.STATUS_CODES[res.statusCode] + '\r\n');
                    rawResHeaders = handleHeaders(rawResHeaders, res.headers);

                    var uncompressedSize = 0; // size after uncompression
                    var bodySize = 0; // bytes size over the wire
                    var body = ''; // plain text body (after uncompressing gzip/deflate)

                    function tally() {
                         entry.request.headerSize = Buffer.byteLength(rawReqHeaders, 'utf8');

                         if (options.bodies && ALLOWED_CONTENT_TYPES.indexOf(entry.response.content._type) !== -1) {
                              // Store only human-readable content (i.e., not binary)
                              // (and if the user actually wants the response bodies in the HAR).
                              entry.response.content.text = body;
                         }

                         entry.response.bodySize = bodySize;
                         entry.response.content.headersSize = Buffer.byteLength(rawResHeaders, 'utf8');
                         entry.response.content.size = uncompressedSize;
                         entry.response.content.compression = uncompressedSize - bodySize;
                         entry.response.content.bodySize = bodySize + entry.response.content.compression;

                         promise.resolve({
                              idx: idx,
                              data: entry
                         });
                    }

                    switch (res.headers['content-encoding']) {
                    case 'gzip':
                         var gzip = zlib.createGunzip();

                         gzip.on('data', function (data) {
                              body += data;
                              uncompressedSize += data.length;
                         }).on('end', function () {
                              tally();
                         });

                         res.on('data', function (data) {
                              bodySize += data.length;
                         }).pipe(gzip);

                         break;
                    case 'deflate':
                         var deflate = zlib.createInflate();

                         deflate.on('data', function (data) {
                              body += data;
                              uncompressedSize += data.length;
                         }).on('end', function () {
                              tally();
                         });

                         res.on('data', function (data) {
                              bodySize += data.length;
                         }).pipe(deflate);

                         break;
                    default:
                         res.on('data', function (data) {
                              body += data;
                              uncompressedSize += bodySize += data.length;
                         }).on('end', function () {
                              tally();
                         });

                         break;
                    }
               } catch (err) {
                    promise.reject(err);
               }
          });
     return promise.promise;
};
