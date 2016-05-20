#!/usr/bin/env node

require('babel-polyfill');

var process = require('process');
var request = require('request-promise');
var winston = require('winston');

var argv = require('commander')
    .option('-p, --port <n>', 'port to open', parseInt)
    .option('-u, --username <name>', 'username for the bot to use')
    .option('-t, --slack-token <token>', 'the slack access token. It can also be set via environment variable SLACK_TOKEN')
    .option('-l, --logging-level', 'logging level')
    .option('--debug', 'dump web requests debug info')
    .parse(process.argv);

winston.level = argv.loggingLevel || 'info';

if (argv.debug) {
    require('request-debug')(request);
}

var SLACK_TOKEN = argv.slackToken || process.env.SLACK_TOKEN;
var PORT = argv.port || parseInt(process.env.INSTANT_PORT) || 10007;
var USERNAME = argv.username || 'instant-notification';

if (!SLACK_TOKEN) {
    throw "SLACK_TOKEN is not set!";
}

var app = require('../app.js')(SLACK_TOKEN, USERNAME);

app.listen(PORT, () => {
    winston.info(`Listening on port ${PORT}`);
});
