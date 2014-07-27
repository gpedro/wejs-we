/**
 * MainController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */
var fs = require('fs');
module.exports = {
  // require js main file
  requireJSmain: function (req, res) {
    res.set('Content-Type', 'application/javascript');

    var requireJsConfig = '';
    var requireEnvDeps = '';

    requireJsConfig += requireEnvDeps;

    if(sails.config.requirejs){
      requireJsConfig += 'require.config('+ JSON.stringify(sails.config.requirejs) +');';
    }

    if(sails.config.environment == 'production'){
      requireJsConfig = 'require(["/min/production.js"],function(){' + requireJsConfig + '});';
    }

    res.send(200,requireJsConfig );
  },
  /**
   * Client side configs
   * @param  {object} req
   * @param  {object} res
   */
  getConfigsJS: function (req, res) {
    var authenticated = false;
    var configs = {};

    configs.version = '1';
    configs.server = {};
    configs.client = {};
    configs.user = {};
    configs.authenticatedUser = {};

    if(req.user){
      // todo check if need to use .toJson in this user
      configs.authenticatedUser = req.user;
    }

    // -- Plugin configs
    configs.plugins = {};

    if(sails.config.clientside.loadTypes){
      configs.plugins.loadTypes = sails.config.clientside.loadTypes;
    }

    if(sails.config.clientside.pluginsDefaultEnabled){
      configs.plugins.enabled = sails.config.clientside.pluginsDefaultEnabled;
    }

    configs.client.log = sails.config.clientside.log;

    fs.exists('.tmp/config/we-cs-modules.json', function(exists) {
      if (exists) {
        var fileJSON = fs.readFileSync('.tmp/config/we-cs-modules.json', 'utf8');
        configs.client.emberjsParts = JSON.parse(fileJSON);
      }
      res.send(configs);
    });
  },

  index: function (req, res) {
    res.view("home/index.ejs");
  }
};
