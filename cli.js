#!/usr/bin/env node
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;

const logo = `
 ██████  ██    ██ ████████ ██ ██      ███████ 
██    ██ ██    ██    ██    ██ ██         ███  
██    ██ ██    ██    ██    ██ ██        ███   
██ ▄▄ ██ ██    ██    ██    ██ ██       ███    
 ██████   ██████     ██    ██ ███████ ███████ 
    ▀▀                                                                                      
`;
const fgGreen = '\x1b[32m';
console.log(fgGreen, logo);

function qutilz() {
      module.exports = require('./test-gen.js');
}

function report() {
  module.exports = require('./reporter.js');
}

function run() {
  if (argv.specs) {
    qutilz();
    return;
  }
  if (argv.report) {
    report();
    return;
  }
  console.log('Please try specifying the --spescs flag: npx quitilz --specs');
}

run();
