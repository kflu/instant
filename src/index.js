#!/usr/bin/env node

require('babel-polyfill');

var net = require('net');
var process = require('process');
var request = require('request');
var util = require('util');
var _ = require('lodash');

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

var server = net.createServer((socket) => {
    socket.setEncoding('utf8');
    socket.on('data', handleRequest);
    socket.on('error', util.inspect);
    socket.on('close', util.inspect);
    socket.on('connect', util.inspect);
});

function parse(req) {
    var separator = req.indexOf(" ");
    var channel = req.substring(0, separator);
    var msg = req.substring(separator);
    return [channel, msg];
}

function handleRequest(req) {
    var parsed = parse(req);
    var channel = parsed[0],
        msg = parsed[1];

    request({
        url: 'https://slack.com/api/chat.postMessage',
        qs: {
            token: SLACK_TOKEN,
            channel,
            text: msg,
            username: USERNAME
        }},
        (err, resp, body) => {
            // Use --debug to see the results
        });
}

server.listen(PORT, () => {
    var addr = server.address();
    console.log("Server listening at %j", addr);
});

function help() {
    console.log("instant [--debug] [--port=[10007]] [--slack-token=<token>] [--username=<username>]");
    console.log("   If slack token is not specified, it must be present as the environment");
    console.log("   variable SLACK_TOKEN");
}
