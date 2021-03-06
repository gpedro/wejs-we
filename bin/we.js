#!/usr/bin/env node


/**
 * Module dependencies
 */

var _ = require('lodash');
var program = require('./_commander');
var package = require('../package.json');
var NOOP = function() {};

program
  .version(package.version, '-v, --version');
//
// Normalize version argument, i.e.
//
// $ we -v
// $ we -V
// $ we --version
// $ we version
//
// make `-v` option case-insensitive
process.argv = _.map(process.argv, function(arg) {
  return (arg === '-V') ? '-v' : arg;
});
// $ we version (--version synonym)
program
  .command('version')
  .description('')
  .action(program.versionInformation);

program
  .command('generate [type]')
  .action(require('./we-generator'));






// Don't balk at unknown options
program.unknownOption = NOOP;
// $ we
//
program.parse(process.argv);
var NO_COMMAND_SPECIFIED = program.args.length === 0;
if (NO_COMMAND_SPECIFIED) {
  program.usageMinusWildcard();
}
