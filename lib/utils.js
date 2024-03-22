"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeIndexFile = exports.warnlog = exports.successlog = exports.errorlog = void 0;
var chalk = require('chalk');
var path = require('path');
var fs = require('fs-extra');
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
/**写入 i18n index 文件  */
function writeIndexFile(i18nDir, config) {
    var exist = fs.existsSync(i18nDir);
    if (!exist) {
        errorlog("\u6587\u4EF6\u5939".concat(i18nDir, "\u4E0D\u5B58\u5728"));
        successlog("\u81EA\u52A8\u4E3A\u4F60\u521B\u5EFA\u6587\u4EF6\u5939".concat(i18nDir));
        fs.mkdirSync(i18nDir);
    }
    var file = path.join(i18nDir, "index.js");
    if (fs.existsSync(file))
        return;
    fs.writeFileSync(file, "import VueI18n from 'vue-i18n'\nimport Vue from 'vue'\nimport zh from './".concat(config.filename, ".json'\n\n") +
        "Vue.use(VueI18n)\n\nexport default new VueI18n({\n\tlocale: 'zh',\n\tmessages: {\n\t\tzh \n\t}\n})\n", 'utf8');
}
exports.writeIndexFile = writeIndexFile;
