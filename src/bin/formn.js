#!/usr/bin/env node
"use strict";
exports.__esModule = true;
var yargs = require("yargs");
var path = require("path");
var baseDir = process.cwd() + "/";
var settingsFile = baseDir + "connections.json";
var argv = yargs
    .strict()
    .usage('Usage: $0 <command>')
    .demandCommand(1, 1)
    .command(['generate', 'g'], 'Generate entity models.', function (yargs) {
    return yargs
        .demandCommand(1, 1)
        .positional('entity-dir', {
        describe: 'Directory in which entity models shall be saved.',
        type: 'string'
    })
        .alias('c', 'connections-file')
        .nargs('c', 1)["default"]('c', settingsFile)
        .describe('c', 'Connections JSON file defining data sources.');
})
    .argv;
var Test = /** @class */ (function () {
    function Test() {
    }
    Test.prototype.print = function (name) {
        console.log(name);
    };
    return Test;
}());
var t = new Test();
// This is the command (generate, etc.).
var command = argv._[0];
console.log(argv);
if (command === 'generate' || command === 'g') {
    var entDir = argv._[1];
    if (path.isAbsolute(argv.c))
        settingsFile = path.resolve(argv.c);
    else
        settingsFile = path.resolve(baseDir + argv.c);
    console.log("Generate entities and write to " + entDir + ".");
    console.log("Connections file " + settingsFile + ".");
}
