#!/usr/bin/env node

require('babel-polyfill');

var process = require('process');
var request = require('request-promise');
var util = require('util');
var _ = require('lodash');
var Promise = require('bluebird');
var winston = require('winston');
winston.level = 'info';

var express = require('express');

var argv = require('minimist')(process.argv.slice(2));

if (argv.help) {
    help();
    process.exit();
}

if (argv.debug) {
    require('request-debug')(request);
}

var SLACK_TOKEN = process.env.SLACK_TOKEN;
var PORT = argv.port || 10007;
var USERNAME = argv.username || 'instant-notification';

if (!SLACK_TOKEN) {
    throw "SLACK_TOKEN is not set!";
}

async function handleRequest(channel, msg) {
    return await request({
        url: 'https://slack.com/api/chat.postMessage',
        qs: {
            token: SLACK_TOKEN,
            channel,
            text: msg,
            username: USERNAME
        }});
}

var app = express();

var routerV1 = express
    .Router()
    .all('/:channel', async (req, res) => {
        var channel = req.params.channel,
            msg = req.query.msg;

        winston.info(JSON.stringify({channel, msg}));
        var body = await handleRequest(channel, msg);
        winston.info(body);
        res.send(body);
    });

app.use('/v1', routerV1)
   .use((err, req, res, next) => {
       winston.info(err.stack);
       res.sendStatus(500);
   });

app.listen(PORT, () => {
    winston.info(`Listening on port ${PORT}`);
});

function help() {
    console.log("instant [--debug] [--port=[10007]] [--slack-token=<token>] [--username=<username>]");
    console.log("   If slack token is not specified, it must be present as the environment");
    console.log("   variable SLACK_TOKEN");
}
