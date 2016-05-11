#!/usr/bin/env node

var path = require('path');
var Service = require('node-windows').Service;
var argv = require('commander');

function getService(env) {
    return new Service({
        name:'Instant notification',
        description: 'Instant notification submission service',
        script: path.join(__dirname, 'instant.js'),
        env
    });
}

argv.command('install')
    .description('install Windows service')
    .option('-t, --slack-token <token>', 
            'freeze the environment variable SLACK_TOKEN as seen by the' + 
            'service. Note: reinstall the service to update this value')
    .action((options) => {
        var svc = getService([
            { name: 'SLACK_TOKEN', value: options.slackToken }
        ]);
        svc.on('install',function(){
            console.log('Installation complete. Starting...');
            svc.start();
            console.log('Started.');
        });

        svc.install();
    });

argv.command('uninstall')
    .description('uninstall Windows service')
    .action(() => {
        var svc = getService();
        svc.on('uninstall',function(){
            console.log('Uninstall complete.');
            console.log('The service exists: ',svc.exists);
        });

        svc.uninstall();
    });

argv.parse(require('process').argv);
