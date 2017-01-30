var http = require('http'),
querystring = require('querystring');

function callback(data){
    console.log('postApiCall-->',data);
    var postData = querystring.stringify({
        message:data.message,
        title:data.title,
        uid: data.uid,
        page: data.page,
        eventType: data.eventType,
        item: data.item,
        preClass: data.preClass,
        postClass: data.postClass
    });

    console.log('postData',postData);
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

    if(process.env.NODE_ENV === 'dev' && process.env.DASHBOARD_PORT){
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

    console.log('dfdsfs');
    req.on('error', (e) => {
        /* Do sometihng if not responsive? */
      console.log(`problem with request: ${e.message}`);
    });

    // write data to request body
    req.write(postData);
    req.end();

}

module.exports = callback;