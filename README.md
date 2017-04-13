## Installation

1. Install Node
    Site: http://nodejs.org/
2. Install Homebrew
    Site: https://brew.sh/
3. Install Heroku Toolbelt
    Site: https://toolbelt.heroku.com/
3. Install PhantomJS
    Site: http://phantomjs.org/download.html
4. Install RabbitMQ (Locally)
    Command: brew install rabbitmq
    Run Automatically:
    Setup:
    AddToEnv:
    Visit to view:
5. Install DynamoDB (Locally)
    Install:
    Setup:
    AddToEnv:
    View: (Below)
6. Install DynamoDB Dashboard (Useful)
7. Install Node Inspector
    Site: https://github.com/node-inspector/node-inspector
    Command: node --debug
    View: (Url)
8. Install Git


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


https://github.com/stomita/heroku-buildpack-phantomjs

sharp buildpack
https://github.com/alex88/heroku-buildpack-vips
http://sharp.dimens.io/en/stable/install/


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