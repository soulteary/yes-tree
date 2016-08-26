#!/usr/bin/env node
'use strict';

process.on('uncaughtException', function(err) {
  console.error('Error caught in uncaughtException event:', err);
});

let argv = process.argv.slice(2);
if (argv.length === 0) {
  //todo show help
  process.exit(999);
}

const path = require('path');

let target = argv[0];
let baseDir = process.env.PWD;
let firstChar = target.slice(0, 1);

switch (firstChar) {
  case '/':
    baseDir = path.dirname(target);
    target = path.basename(target);
    break;
  case '~':
    // todo check
    console.log('~', target);
    break;
  default:
    break;
}
console.log(`${firstChar}`);
require('../lib')(baseDir, target);
