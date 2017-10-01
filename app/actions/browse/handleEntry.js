let q = require('q'),
     _ = require('underscore'),
     request = require('request'),
     http = require('http'),
     zlib = require('zlib');

function tally(promise, options, entry, rawReqHeaders, rawResHeaders, body, bodySize, uncompressedSize, idx) {
     entry.request.headerSize = Buffer.byteLength(rawReqHeaders, 'utf8');

     if (options.bodies && ALLOWED_CONTENT_TYPES.indexOf(entry.response.content._type) !== -1) {
          // Store only human-readable content (i.e., not binary)(and if the user actually wants the response bodies in the HAR).
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

function processRequest(promise, res, entry, options, idx, rawReqHeaders) {
     try {
          var rawResHeaders = ('HTTP/' + res.httpVersion + ' ' + res.statusCode + ' ' + http.STATUS_CODES[res.statusCode] + '\r\n');
          rawResHeaders = handleHeaders(rawResHeaders, res.headers);

          var uncompressedSize = 0; // size after uncompression
          var bodySize = 0; // bytes size over the wire
          var body = ''; // plain text body (after uncompressing gzip/deflate)

          switch (res.headers['content-encoding']) {
          case 'gzip':
               var gzip = zlib.createGunzip();

               gzip.on('data', function (data) {
                    body += data;
                    uncompressedSize += data.length;
               }).on('end', function () {
                    tally(promise, options, entry, rawReqHeaders, rawResHeaders, body, bodySize, uncompressedSize, idx);
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
                    tally(promise, options, entry, rawReqHeaders, rawResHeaders, body, bodySize, uncompressedSize, idx);
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
                    tally(promise, options, entry, rawReqHeaders, rawResHeaders, body, bodySize, uncompressedSize, idx);
               });

               break;
          }
     } catch (err) {
          promise.reject(err);
     }
}

function createHeaders(entry) {
     var headers = {};
     _.each(entry.request.headers, function (header) {
          headers[header.name] = header.value;
     });
     return headers;
};

function handleHeaders(obj, list) {
     _.each(_.keys(list), function (headerKey) {
          obj += headerKey + ': ' + list[headerKey] + '\r\n';
     });
     return obj += '\r\n';
}

function entryHandler(entry, idx, options) {
     var promise = q.defer();
     var reqOpts = {
          method: entry.request.method,
          url: entry.request.url,
          headers: {},
          timeout: options.resouceDelay || 20000
     };

     reqOpts.headers = createHeaders(entry);
     var rawReqHeaders = handleHeaders('HTTP/1.1 GET ' + entry.request.url + '\r\n', reqOpts.headers) + '\r\n';

     request(reqOpts)
          .on('error', function (err) {
               promise.resolve({
                    idx: idx,
                    url: entry.request.url,
                    method: entry.request.method,
                    data: err,
                    status: 'failed'
               });
          })
          .on('response', function (res) {
               processRequest(promise, res, entry, options, idx, rawReqHeaders);
          });
     return promise.promise;
};

module.exports = {
     entryHandler: entryHandler,
     tally: tally,
     processRequest: processRequest,
     createHeaders: createHeaders,
     handleHeaders: handleHeaders
}
