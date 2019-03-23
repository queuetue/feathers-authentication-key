# @queuetue/feathers-authentication-key

> Api Key authentication strategy for feathers-authentication using Passport without all the boilerplate.

## Installation

```
npm install @queuetue/feathers-authentication-local --save
```

Create an api-key service, and use entries like
{
  _id: "my_api_key",
  userId: "5a6a6bbdc0a6ab23ad868049"
}

Change 'userId' to match auth entity name - profileId, accountId, etc.

## Quick example

### Server
```js
const feathers = require('@feathersjs/feathers');
const authentication = require('feathers-authentication');
const apiKey = require('@queuetue/feathers-authentication-key');
const app = feathers();

// Setup authentication
app.configure(authentication(settings));
app.configure(apiKey());

// Setup a hook to only allow valid JWTs or successful
// apiKey auth to authenticate and get new JWT access tokens

app.service('authentication').hooks({
  before: {
    create: [
      authentication.hooks.authenticate(['apiKey', 'jwt'])
    ]
  }
});
```

### Client
```js
const io = require('socket.io-client');
const feathers = require('@feathersjs/feathers');
const auth = require('@feathersjs/authentication-client');
const socketio = require('@feathersjs/socketio-client');

const feathersClient = feathers();

const socket = io(process.env.CNX_FEATHERS_BASEURL, {
    transports: ['websocket'],
    forceNew: true,
    extraHeaders: {
        Authorization: 'feathers-jwt'
    }
});

feathersClient.configure(socketio(socket));

feathersClient.configure(
    auth({
        strategy: 'apiKey',
    }
    )
);

feathersClient.authenticate({ strategy: 'apiKey', apiKey:'my_api_key' })
    .then((response)=>{
        console.log(feathersClient.passport.verifyJWT(response.accessToken));
    })

```

## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).
