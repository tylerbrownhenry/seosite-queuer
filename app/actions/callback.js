var http = require('http'),
sh = require('shorthash'),
     querystring = require('querystring'),
     publisher = require('../amqp-connections/publisher'),
     Update = require('../models/update');

function callback(data) {
     console.log('actions/callback.js callback',data);

     var alert = new Alert({
        alertId: sh.unique(new Date() + data.uid),
        message: data.message,
        uid: data.uid,
        page: data.page,
        type: data.type,
        status: data.status,
        requestDate: Date(),
        temp_id: data.temp_id,
        i_id: data.i_id
     });

     alert.save(function (err, model) {
          console.log('Alert saved!');
     });

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

     publisher.publish("", "update", new Buffer(JSON.stringify({uid:data.uid}))).then(function (e) {
          console.log('actions/callback.js published alert for uid',data.uid);
     });

     return
    //
    //  var options = {
    //       hostname: process.env.DASHBOARD_URL || 'localhost',
    //       // port: 3000,
    //       path: '/callback',
    //       method: 'POST',
    //       headers: {
    //            'Content-Type': 'application/x-www-form-urlencoded',
    //            'Content-Length': Buffer.byteLength(postData)
    //       }
    //  };
     //
    //  if (process.env.NODE_ENV === 'dev' && process.env.DASHBOARD_PORT) {
    //       options.port = process.env.DASHBOARD_PORT;
    //  }
     //
    //  var req = http.request(options, (res) => {
    //       console.log(`STATUS: ${res.statusCode}`);
    //       console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    //       res.setEncoding('utf8');
    //       res.on('data', (chunk) => {
    //            console.log(`BODY: ${chunk}`);
    //       });
    //       res.on('end', () => {
    //            console.log('No more data in response.');
    //       });
    //  });
     //
    //  console.log('dfdsfs', postData);
    //  req.on('error', (e) => {
    //       /* Do sometihng if not responsive? */
    //       console.log(`problem with request: ${e.message}`);
    //  });
     //
    //  // write data to request body
    //  req.write(postData);
    //  req.end();

}

module.exports = callback;
