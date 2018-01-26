const Debug = require('debug');
const merge = require('lodash.merge');
const omit = require('lodash.omit');
const pick = require('lodash.pick');
// const hooks = require('./hooks');
const DefaultVerifier = require('./verifier');

const passportCustom = require('passport-custom');

const debug = Debug('@queuetue/feathers-authentication-key');
const defaults = {
  name: 'apiKey',
  keyField: 'apiKey'
};

const KEYS = [
  'entity',
  'service',
  'passReqToCallback',
  'session'
];

function init (options = {}) {
  return function keyAuth () {
    const app = this;
    const _super = app.setup;

    if (!app.passport) {
      throw new Error(`Can not find app.passport. Did you initialize feathers-authentication before @queuetue/feathers-authentication-key?`);
    }

    let name = options.name || defaults.name;
    let authOptions = app.get('authentication') || {};
    let apiKeyOptions = authOptions[name] || {};

    // NOTE (EK): Pull from global auth config to support legacy auth for an easier transition.
    const apiKeySettings = merge({}, defaults, pick(authOptions, KEYS), apiKeyOptions, omit(options, ['Verifier']));
    let Verifier = DefaultVerifier;

    if (options.Verifier) {
      Verifier = options.Verifier;
    }

    app.setup = function () {
      let result = _super.apply(this, arguments);
      let verifier = new Verifier(app, apiKeySettings);

      if (!verifier.verify) {
        throw new Error(`Your verifier must implement a 'verify' function. It should have the same signature as a custom passport verify callback.`);
      }

      // Register 'apiKey' strategy with passport
      debug('Registering apiKey authentication strategy with options:', apiKeySettings);
      // app.passport.use(apiKeySettings.name, new passportCustom.Strategy(apiKeySettings, verifier.verify.bind(verifier)));
      app.passport.use(apiKeySettings.name, new passportCustom.Strategy(verifier.verify.bind(verifier)));
      app.passport.options(apiKeySettings.name, apiKeySettings);

      return result;
    };
  };
}

module.exports = init;

// Exposed Modules
Object.assign(module.exports, {
  default: init,
  defaults,
  // hooks,
  Verifier: DefaultVerifier
});
