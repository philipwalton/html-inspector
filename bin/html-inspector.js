#!/usr/bin/env node

var fs = require('fs'),
  path = require('path'),
  program = require('commander');

var inspectLocation,
  configFile;

var basePath = path.normalize(__dirname + path.sep + '..'),
  phantomRunner = basePath + path.sep + 'bin' + path.sep + 'phantom-runner.js';

program
  .version('0.0.1')
  .option('-l, --local [file]', 'Inspect local file')
  .option('-u, --url [url]', 'Inspect external url')
  .option('-c, --config [file]', 'Configuration file')
  .parse(process.argv);

// Allow either a local file or a url
if(program.local) {
  inspectLocation = path.resolve(program.local);
} else if(program.url) {
  inspectLocation = program.url
}

if(program.config) {
  configFile = path.resolve(program.config);
}

// Spawn process to run PhantomJS from CLI
// TODO: Is this the way to go?
function run(cmd, args, callback) {
  var spawn = require('child_process').spawn;
  var command = spawn(cmd, args);
  var result = '';
  command.stdout.on('data', function(data) {
    result += data.toString();
  });
  command.on('error', function() {
    console.log(arguments);
  });
  command.on('close', function(code) {
    return callback(result);
  });
}

run("phantomjs", [phantomRunner, basePath, inspectLocation, configFile], function(result) {
  console.log(result);
});
