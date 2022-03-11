"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warnlog = exports.successlog = exports.errorlog = void 0;
var chalk = require('chalk');
function errorlog(message) {
    console.error(chalk.red('✖ ' + message));
}
exports.errorlog = errorlog;
function successlog(message) {
    console.error(chalk.green('✔ ' + message));
}
exports.successlog = successlog;
function warnlog(message) {
    console.error(chalk.yellow('⚠ ' + message));
}
exports.warnlog = warnlog;
