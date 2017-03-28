//python -mwebbrowser http://localhost:3000
//python -mwebbrowser http://localhost:4000
//python -mwebbrowser http://localhost:15672


install phantomjs
http://phantomjs.org/download.html
cahnge the path to phantomjs

install rabbitMQ Locally

brew update
brew install rabbitmq



when deploying to heroku
remember to add buildpack

https://github.com/stomita/heroku-buildpack-phantomjs

sharp buildpack
https://github.com/alex88/heroku-buildpack-vips
http://sharp.dimens.io/en/stable/install/


For socket.io
https://devcenter.heroku.com/articles/node-websockets
heroku features:enable http-session-affinity

multi node socket.io
http://socket.io/docs/using-multiple-nodes/


NOT VERY VALID BUT CAN BE CLEANED UP

## Installation

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku Toolbelt](https://toolbelt.heroku.com/) installed.

### Command Line

```sh
$ git clone https://TylerHenry@bitbucket.org/TylerHenry/seadoc-blc.git # or clone your own fork
$ cd seadoc-blc
$ npm install
$ npm start
```

Your app should now be running on [localhost:8080](http://localhost:8080/).

### Connecting to Heroku

```sh
$ heroku login
$ Enter your Heroku credentials.
$ Email:
$ Password (typing will be hidden):
```

Check requirments, each command should return a version number, otherwise go back and install them

```sh
$ node -v
$ npm -v
$ git -v
```

### Deploying to Heroku

```sh
$ heroku create
$ git push heroku master
$ heroku open
```
or

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)


### Publishing Updates

```sh
$ git add .
$ git commit -m "Commit Message"
$ git push heroku master
$ heroku open
```

### View Logs

```sh
$ heroku logs —tail
```

### Run Locally

```sh
$ heroku local web
```

### Restart a Heroku Instance, find dyno name then stop it

```sh
$ heroku ps
$ heroku ps:stop <dyno name>
$ heroku ps:restart
```

## Documentation

For more information about using Node.js on Heroku, see these Dev Center articles:

- [Getting Started with Node.js on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Heroku Node.js Support](https://devcenter.heroku.com/articles/nodejs-support)
- [Node.js on Heroku](https://devcenter.heroku.com/categories/nodejs)
- [Best Practices for Node.js Development](https://devcenter.heroku.com/articles/node-best-practices)
- [Using WebSockets on Heroku with Node.js](https://devcenter.heroku.com/articles/node-websockets)

### [Visit here for more information about the broken-links-checker api that this borrows heavily from](https://davidwalsh.name/broken-link-checker)


# Endpoints


## Full Site Crawl Request

    POST http://localhost:8080/site

## Description
Api for crawling an entire website for broken links and general information


## Parameters
Essential information:

- **apiKey** (required)  - User based token for accessing api
- **name** (required) — Name of user
- **site** (required) — Valid Url to crawl

Optional attributes:

- **checkedLimit** (beta) — Number of pages to limit the crawl to, capped is checked at the user level as well

Todo:

- **saveResponse** (beta) — Just return the response or save it as well
- **filterLevel** (beta) — There are several levels of filtering avaiable, like to include checks for images etc.

## Return format
Status code 200, along with a JSON object

## Errors
All known errors cause the resource to return HTTP error code header together with a JSON array containing at least 'name' and 'message' keys describing the source of error.

- **400 Bad Request**

## Example
**Request**

```
POST http://localhost:8080/site
```

**Payload**
```
{
    "name":"superSecretAdminUser",
    "checkedLimit":100,
    "apiKey":"irvNTiy7dGabDn3QayAM",
    "url":"http://www.example.com"
}
```

**Header**
```
Content-Type:application/json
Origin:http://localhost:8080
Referer:http://localhost:8080/site

```

**Return**
``` json
{
   "links":[

        (See 'links' api results for expanded result)

   ]
   "pages":[
      {
         "uid":"58714c611fd29483871c38c6",
         "sid":"5872cdb56190a0208bf95b58",
         "link":"https://www.example.com"
      },
      {
         "uid":"58714c611fd29483871c38c6",
         "sid":"5872cdb56190a0208bf95b58",
         "link":"https://www.example.com/aboutus"
      }
   ],
   "sites":[
      {
         "uid":"58714c611fd29483871c38c6",
         "link":"https://www.exampled.com"
      }
   ]
}
```

***
***
***

## Single Page Request

    POST http://localhost:8080/page

## Description
Api for checking links on a single url

## Parameters
Essential information:

- **apiKey** (required)  - User based token for accessing api
- **name** (required) — Name of user
- **url** (required) — Valid Url to crawl

Optional attributes:

- **checkedLimit** (beta) — Number of pages to limit the crawl to, capped is checked at the user level as well

Todo:

- **saveResponse** (beta) — Just return the response or save it as well
- **filterLevel** (beta) — There are several levels of filtering avaiable, like to include checks for images etc.

## Return format
Status code 200, along with a JSON object

## Errors
All known errors cause the resource to return HTTP error code header together with a JSON array containing at least 'name' and 'message' keys describing the source of error.

- **400 Bad Request**

## Example
**Request**

```
POST http://localhost:8080/page
```

**Payload**
```
{
    "name":"superSecretAdminUser",
    "checkedLimit":100,
    "apiKey":"irvNTiy7dGabDn3QayAM",
    "url":"http://www.example.com"
}
```

**Header**
```
Content-Type:application/json
Origin:http://localhost:8080
Referer:http://localhost:8080/page

```

**Return**
``` json
{
  "links": [

    (See 'links' api results for expanded result)

  ]
}
```




***
***
***
***

## Stored Sites By User

    POST http://localhost:8080/sites

## Description
Fetching all previously made site crawls and their status by user

## Parameters
Essential information:

- **apiKey** (required)  - User based token for accessing api
- **name** (required) — Name of user

Optional attributes:

- **checkedLimit** (beta) — Number of pages to limit the crawl to, capped is checked at the user level as well

Todo:

- **saveResponse** (beta) — Just return the response or save it as well
- **filterLevel** (beta) — There are several levels of filtering avaiable, like to include checks for images etc.

## Return format
Status code 200, along with a JSON object

## Errors
All known errors cause the resource to return HTTP error code header together with a JSON array containing at least 'name' and 'message' keys describing the source of error.

- **400 Bad Request**

## Example
**Request**

```
POST http://localhost:8080/page
```

**Payload**
```
{
    "name":"superSecretAdminUser",
    "apiKey":"irvNTiy7dGabDn3QayAM"
}
```

**Header**
```
Content-Type:application/json
Origin:http://localhost:8080
Referer:http://localhost:8080/page

```

**Return**
``` json
{
   "sites":[
      {
         "_id":"5872a6b98390ee0004c69d49",
         "uid":"58714c611fd29483871c38c6",
         "url":"http://www.example.com",
         "__v":0,
         "scanned":"2017-01-08T20:53:13.415Z",
         "pending":false
      },
      {
         "_id":"587294fab649eb13337b3629",
         "uid":"58714c611fd29483871c38c6",
         "url":"http://www.exampled2.com",
         "__v":0,
         "scanned":"2017-01-08T19:37:30.859Z",
         "pending":true
      }
   ]
}
```

***
***
***
***

## User Stored Links By Site

    POST http://localhost:8080/links

## Description
Fetching all stored links information for a user by one site

## Parameters
Essential information:

- **apiKey** (required)  - User based token for accessing api
- **name** (required) — Name of user
- **siteId** (required) — Id of site, can be retrieved from /sites api

Optional attributes:

- **url** (required) — Use a fuzzier verison, by passing in url instead of id (More user friendly)
- **checkedLimit** (beta) — Number of pages to limit the crawl to, capped is checked at the user level as well

Todo:

- **saveResponse** (beta) — Just return the response or save it as well
- **filterLevel** (beta) — There are several levels of filtering avaiable, like to include checks for images etc.

## Return format
Status code 200, along with a JSON object

## Errors
All known errors cause the resource to return HTTP error code header together with a JSON array containing at least 'name' and 'message' keys describing the source of error.

- **400 Bad Request**

## Example
**Request**

```
POST http://localhost:8080/links
```

**Payload**
```
{
    "name":"superSecretAdminUser",
    "apiKey":"irvNTiy7dGabDn3QayAM",
    "siteId":"dfsdfdGabDn3QayAM",
}
```

**Header**
```
Content-Type:application/json
Origin:http://localhost:8080
Referer:http://localhost:8080/page

```

**Return**
``` json
{
   "links":[
      {
         "_id":"5872c9436f88fa7011c54272",
         "url":"https://example.myportfolio.com/projects",
         "uid":"58714c611fd29483871c38c6",
         "sid":"5872a6b98390ee0004c69d49",
         "link":{
            "link":{
               "excludedReason":null,
               "brokenReason":null,
               "excluded":false,
               "samePage":false,
               "internal":true,
               "broken":false,
               "http":{
                  "response":{
                     "redirects":[

                     ],
                     "url":"https://example.myportfolio.com/projects",
                     "statusMessage":"OK",
                     "statusCode":200,
                     "httpVersion":"1.1",
                     "headers":{
                        "vary":"Accept-Encoding,Fastly-SSL",
                        "x-timer":"S1483917628.247880,VS0,VE0",
                        "x-cache-hits":"2",
                        "x-cache":"HIT",
                        "x-served-by":"cache-atl6240-ATL",
                        "connection":"close",
                        "age":"65413",
                        "via":"1.1 varnish",
                        "date":"Sun, 08 Jan 2017 23:20:28 GMT",
                        "accept-ranges":"bytes",
                        "content-length":"42776",
                        "x-xss-protection":"1; mode=block",
                        "x-trace-id":"EaHlAgfhD09t4bzUPx6C/GMHe0c",
                        "x-content-type-options":"nosniff",
                        "strict-transport-security":"max-age=31536000",
                        "server":"nginx",
                        "content-type":"text/html; charset=UTF-8",
                        "cache-control":"s-maxage=86400"
                     }
                  },
                  "cached":true
               },
               "html":{
                  "tag":"<a href=\"/projects\">",
                  "text":"Projects",
                  "attrs":{
                     "href":"/projects"
                  },
                  "attrName":"href",
                  "tagName":"a",
                  "selector":"html > body > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > header:nth-child(1) > div:nth-child(2) > nav:nth-child(1) > div:nth-child(1) > a:nth-child(1)",
                  "location":{
                     "endOffset":13373,
                     "startOffset":13357,
                     "col":37,
                     "line":97
                  },
                  "offsetIndex":12,
                  "index":17
               },
               "base":{
                  "resolved":"https://example.myportfolio.com/out-of-this-world-christmas",
                  "original":"https://example.myportfolio.com/out-of-this-world-christmas"
               },
               "url":{
                  "redirected":null,
                  "resolved":"https://example.myportfolio.com/projects",
                  "original":"/projects"
               }
            },
            "url":"https://example.myportfolio.com/projects"
         },
         "scanned":"2017-01-08T23:29:01.406Z"
      },
      {
        ...
      }
  ]
}
```




/**
 * A page summary has a number of tasks that it needs to do before being considered complete.
 * 1. If scanning links, all links must be scanned
 * 2. If saving meta data, all meta data must be processed
 * 3. If saving resources, all resoucres must be processed
 * 4. Page itself must get contacted and the html must get parsed
 *
 * Of these their are also a couple api calls involved in saving the data.
 * 1. BatchPut of all of the link Objects
 * 2. Update count of scan object
 * 3. Request is marked active
 */

 /**
  * Api Call: Request is marked active -->
  * Pass -->
  *   Sniff Url
  *   Pass -->
  *     processResources
  *     processMetaData
  *     Pass -->
  *       Save Scan
  *         Pass -->
  *           If Scanning Links and there are links
  *             Process links
  *               batchPut
  *                 Pass -->
  *                   updateCount
  *                     Pass -->
  *                       Publish links individually?
  *                         Pass -->
  *                            Fogetabout it
  *                            (Eventually as the links are consumed they check the Request process list to see if all the links have been scanned)
  *                            (What if a single link is not sent to the queue... how can we tell when to finish the scan?)
  *                         Fail -->
  *                           (Problem) Link will remain unscanned?
  *
  *                     Fail -->
  *                       (Should) send to rabbitMQ to process later (maybe make this happen before processLinks)
  *                 Fail -->
  *                  (Should) Send batchPut to rabbit to process later
  *           Else
  *             Update Request as complete
  *               Pass -->
  *                 Done
  *               Fail -->
  *                 (Should) Send request to save back to rabbitMQ to process later
  *         Fail -->
  *           (Should) Publish unsaved scan to rabbitMQ, and restart here.
  *     Fail -->
  *       No retry, likely an object bug (should be preventable / codeable / bulletproofable)
  *   Fail -->
  *     Todo:
  *     Check why failed
  *     If timed out, do we retry?
  *     If 500 do not retry..
  *     etc.
  * Fail -->
  *   Message nacked (Retrying)
  *
  */
