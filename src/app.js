var request = require('request-promise');
var _ = require('lodash');
var winston = require('winston');

module.exports = (slackToken, username) => {

    async function handleRequest(channel, msg) {
        return await request({
            url: 'https://slack.com/api/chat.postMessage',
            qs: {
                token: slackToken,
                channel,
                text: msg,
                username
            }});
    }

    var express = require('express');
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

    return app;

};
