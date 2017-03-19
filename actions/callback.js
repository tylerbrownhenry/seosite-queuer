var http = require('http'),
     querystring = require('querystring'),
     Alert = require('../schemas/alertSchema');

function callback(data) {
     console.log('postApiCall-->', data);

     Alert.update({
               uid: data.uid
          }, {
               $push: {
                    "messages": {
                         message: data.message,
                         uid: data.uid,
                         page: data.page,
                         type: data.type,
                         status: data.status,
                         requestDate: Date(),
                         temp_id: data.temp_id,
                         i_id: data.i_id
                    }
               }
          }, {
               safe: true,
               upsert: true
          },
          function (err, model) {
               console.log(err);
          }
     );

     var postData = querystring.stringify({
          // message:data.message,
          // title:data.title,
          uid: data.uid,
          page: data.page,
          // eventType: data.eventType,
          // item: data.item,
          // preClass: data.preClass,
          // postClass: data.postClass
     });

     console.log('postData', postData);
     var options = {
          hostname: process.env.DASHBOARD_URL || 'localhost',
          // port: 3000,
          path: '/callback',
          method: 'POST',
          headers: {
               'Content-Type': 'application/x-www-form-urlencoded',
               'Content-Length': Buffer.byteLength(postData)
          }
     };

     if (process.env.NODE_ENV === 'dev' && process.env.DASHBOARD_PORT) {
          options.port = process.env.DASHBOARD_PORT;
     }

     var req = http.request(options, (res) => {
          console.log(`STATUS: ${res.statusCode}`);
          console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
               console.log(`BODY: ${chunk}`);
          });
          res.on('end', () => {
               console.log('No more data in response.');
          });
     });

     console.log('dfdsfs', postData);
     req.on('error', (e) => {
          /* Do sometihng if not responsive? */
          console.log(`problem with request: ${e.message}`);
     });

     // write data to request body
     req.write(postData);
     req.end();

}

module.exports = callback;
