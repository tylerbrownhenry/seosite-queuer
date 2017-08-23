const puppeteer = require('puppeteer');
const md5 = require('md5');
// const sh = require('shorthash');
(async() => {

     let responses = 0;
     const browser = await puppeteer.launch();
     const page = await browser.newPage();
     await page.tracing.start({
          path: 'trace.json'
     });
     page.on('load', function (load) {
          console.log('load called!');
     })
     page.on('console', function (load) {
          // console.log('console called!');
     })
     page.on('dialog', function (load) {
          console.log('dialog called!');
     })
     page.on('error', function (load) {
          console.log('load called!');
     })
     page.on('frameattached', function (load) {
          console.log('frameattached called!');
     })
     page.on('framedeattached', function (load) {
          console.log('framedeattached called!');
     })
     page.on('framenavigated', function (load) {
          console.log('framenavigated called!');
     })
     page.on('pageerror', function (load) {
          console.log('pageerror called!');
     })
     page.on('request', function (load) {
          // console.log('request called!');
     })
     page.on('requestfailed', function (load) {
          console.log('requestfailed called!');
     });

     let resources = 0;
     page.on('requestfinished', function (load) {
          console.log('requestfinished called!', load._requestId, md5(load.url));
          resources++
          // page.screenshot({path: 'example2.png'});
          if (resources == 100) {
               // page.close();
              //  evaluatePage(page);
                 page.screenshot({path: 'example3.png'}).then(function(){

                page.evaluate(function(){
                     return Promise.resolve(8 * 7);
                }).then(function (e) {
                     console.log('YO', e); // prints "56"
                     browser.close();
                //
                })
              })
          }

     })
     page.on('response', function (load) {
          // const id = md5(load._request.url);
          //
          // if(typeof resources[id] === 'undefined'){
          //   resources[id] = true;
          //   console.log('response new!');
          // } else {
          //   console.log('response exists!');
          // }
     })
     await page.goto('http://www.ign.com', {
          waitUntil: 'networkidle',
          networkIdleInflight: 1
     });
     await page.tracing.stop();
     // await page.goto('http://ign.com', {waitUntil: 'networkidle'});
     // await page.screenshot({path: 'example.png'});
     //
     // browser.close();
})();

// const puppeteer = require('puppeteer');
//
// function sleep(ms){
//      return new Promise(resolve=>{
//          setTimeout(resolve,ms)
//      })
//  }
//
// (async() => {
//
// const browser = await puppeteer.launch();
// const page = await browser.newPage();
// await page.setViewport({width: 1280, height: 1024, deviceScaleFactor: 1});
// await page.goto('https://theverge.com', {waitUntil: 'networkidle'});
// var innerHeight = await page.evaluate(_ => {return window.innerHeight}),
//     height = await page.evaluate(_ => {return document.body.clientHeight});
// console.log(height);
// console.log("Scrolling");
// for(i=0; i<(height/innerHeight); i++) {
//     page.evaluate(_ => {
//         window.scrollBy(0, window.innerHeight);
//     });
//     await sleep(200);
//     console.log(i);
// }
// console.log("Waiting for transfers");
// await page.waitForNavigation({networkIdleTimeout: 15000, waitUntil: 'networkidle'});
// console.log("Done.");
// var height = await page.evaluate(() => {return document.body.clientHeight});
// console.log(height);
// await page.pdf({path: 'theverge.pdf', width: "1280px", height: height + "px", printBackground: true});
// browser.close();
// })();
