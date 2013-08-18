#!/usr/bin/env node

var fs = require('fs'),
  path = require('path'),
  program = require('commander')

var inspectLocation,
  baseVersions = ['full', 'core', 'convention', 'best-practices', 'validation'],
  baseVersion,
  configFile,
  reporters = ['console.simple'],
  reporter;

var basePath = path.normalize(__dirname + path.sep + '..'),
  phantomRunner = basePath + path.sep + 'bin' + path.sep + 'phantom-runner.js',
  reporterBasePath = path.resolve(basePath + '/src/reporter') + path.sep

program
  .version('0.0.1')
  .usage('[options] <file or url>')
  .option('-c, --config [file]', 'Configuration file (./html-inspector-config.js)', './html-inspector-config.js')
  .option('-b, --base [base]', 'Use HTML Inspector version (' + baseVersions.join(', ') + ')', 'full')
  .option('-r, --reporter [reporter]', 'Reporter (' + reporters.join(', ') + ')', 'console.simple')
  .parse(process.argv)

baseVersion = program.base

if(program.args.length !== 1 || baseVersions.indexOf(baseVersion) === -1 || reporters.indexOf(program.reporter) === -1) {
  program.help()
}

// Try to resolve local file, otherwise assume and pass url
var inputLocation = program.args[0],
  inspectLocation = fs.exists(path.resolve(inputLocation)) ? path.resolve(inputLocation) : inputLocation

if(program.config) {
  configFile = path.resolve(program.config)
}

reporter = require(reporterBasePath + program.reporter);

// Spawn process to run PhantomJS from CLI
// TODO: Is this the way to go?
function run(cmd, args, callback) {
  var spawn = require('child_process').spawn
  var command = spawn(cmd, args)
  var result = ''
  command.stdout.on('data', function(data) {
    result += data.toString()
  })
  command.on('error', function() {
    console.log(arguments)
  })
  command.on('close', function(code) {
    return callback(result)
  })
}

run("phantomjs", [phantomRunner, basePath, baseVersion, inspectLocation, configFile], function(result) {

  var errors

  try {
    errors = JSON.parse(result)
  } catch(error) {
    console.log(result + '\n')
  }

  if(errors) {
    reporter.write(errors)
  }

})
