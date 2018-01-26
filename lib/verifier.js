const Debug = require('debug');
const get = require('lodash.get');
const omit = require('lodash.omit');

const debug = Debug('@queuetue/feathers-authentication-key:verify');

class ApiKeyVerifier {
  constructor (app, options = {}) {
    this.app = app;
    this.options = options;
    this.entityService = typeof options.service === 'string' ? app.service(options.service) : options.service;
    this.keyService = app.service('api-keys');

    if (!this.entityService) {
      throw new Error(`options.service does not exist.\n\tMake sure you are passing a valid service path or service instance and it is initialized before @queuetue/feathers-authentication-key.`);
    }

    if (!this.keyService) {
      throw new Error(`service 'apiKeys' does not exist.`);
    }

    this.verify = this.verify.bind(this);
  }

  verify (req, done) {
    // console.log(req);

    debug('Checking credentials', req.body.apiKey);

    const id = this.entityService.id;

    if (id === null || id === undefined) {
      debug('failed: the entityService.id was not set');
      return done(new Error('the `id` property must be set on the entity service for authentication'));
    }

    this.keyService.get(req.body.apiKey)
      .then(key => {
        if (!key || key.expired) {
          return done(new Error(`the key ${req.body.apiKey} could not be identified or has expired.`));
        }
        return this.entityService.get(key[`${this.options.entity}Id`]);
      })
      .then(entity => {
        if (!entity) {
          return done(new Error(`${this.options.entity} could not be identified from key '${req.body.apiKey}'.`));
        }
        const id = entity[this.entityService.id];
        const payload = { [`${this.options.entity}Id`]: id };
        done(null, entity, payload);
      })
      .catch(error => error ? done(error) : done(null, error, { message: 'Login error' }));
  }
}

module.exports = ApiKeyVerifier;
