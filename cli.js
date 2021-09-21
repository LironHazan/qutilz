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
  if (process.env.NODE_ENV === 'production') {
    module.exports = require('./dist/qutilz.cjs.production.min.js');
  } else {
    module.exports = require('./dist/qutilz.cjs.development.js');
  }
}

function run() {
  if (argv.specs) {
    qutilz();
    return;
  }
  console.log('Please try specifying the --spescs flag: npx quitilz --specs');
}

run();
