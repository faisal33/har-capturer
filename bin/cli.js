#!/usr/bin/env node

var fs = require('fs');
var colors = require('colors');
var program = require('commander');
var chc = require('../');

program
    .usage('[options] URL...')
    .option('-t, --host <host>', 'Remote Debugging Protocol host')
    .option('-p, --port <port>', 'Remote Debugging Protocol port')
    .option('-o, --output <file>', 'dump to file instead of stdout')
    .option('-c, --content', 'also capture the requests body')
    .option('-a, --agent <agent>', 'user agent override')
    .option('-d, --delay <ms>', 'time to wait after the load event')
    .option('-g, --give-up <s>', 'time to wait before giving up')
    .option('-f, --force', 'continue even without benchmarking extension')
    .option('-r, --reloads <count>','number of reloads of the url')
    .option('-v, --verbose', 'enable verbose output on stderr')
    .parse(process.argv);

if (program.args.length === 0) {
    program.outputHelp();
    process.exit(1);
}

var output = program.output;
var reloads = program.reloads;
var urls = program.args;
for(var i=1; i<reloads; i++){
 program.args.push(urls[0]);
}

var c = chc.load(urls, {
    'host': program.host,
    'port': program.port,
    'fetchContent': program.content,
    'userAgent': program.agent,
    'onLoadDelay': program.delay,
    'giveUpTime': program.giveUp,
    'force': program.force
},reloads);

if (program.verbose) {
    chc.setVerbose();
}

c.on('pageEnd', function (url) {
    var status = 'DONE';
    if (process.stderr.isTTY) status = status.green;
    //console.error(status + ' ' + url);
});
c.on('pageError', function (url) {
    var status = 'FAIL';
    if (process.stderr.isTTY) status = status.red;
    console.log(status + '' + url.entries.length);
});
c.on('end', function (har) {
    var json = JSON.stringify(har, null, 4);
    var average = 0;
    for(var i=0; i<har.TimeTaken.length; i++){
            average += har.TimeTaken[i].timeDifference;
    }
    average = average/har.TimeTaken.length;
    if (program.output) {
        fs.writeFileSync(output, json);
    } else {
        console.log(json);
        console.log("\n");
        console.log("Average Time Difference between Initial Load and First Ad Request: " +average+ " ms");
        console.log("\n");
    }
});
c.on('error', function (err) {
    console.error('Cannot connect to Chrome');
    console.error(err.toString());
    process.exit(1);
});
