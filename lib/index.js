#!/usr/bin/env node
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.message = void 0;
var utils_1 = require("./utils");
var i18nFile_1 = require("./core/i18nFile");
var const_1 = require("./core/const");
var transform_1 = require("./core/transform");
var replaceVueTemplate_1 = require("./core/replaceVueTemplate");
var path = require('path');
var fs = require('fs-extra');
// replace 的用法 https://www.cnblogs.com/idiv/p/8442046.html
var configFile = const_1.default.CustomSettingFileName + '.js';
exports.message = {
    error: utils_1.errorlog,
    successlog: utils_1.successlog
};
/**初始化文件,写入index.js文件 */
function initFile() {
    var config = i18nFile_1.VueI18nInstance.getConfig();
    var i18nDir = path.join(process.cwd(), config.outdir);
    var i18nFile = path.join(i18nDir, "".concat(config.filename, ".json"));
    (0, utils_1.writeIndexFile)(i18nDir, config);
    if (fs.existsSync(i18nFile) &&
        require(i18nFile).toString() === '[object Object]') {
        try {
            i18nFile_1.VueI18nInstance.setMessage(require(i18nFile));
        }
        catch (e) {
            return (0, utils_1.errorlog)(e.message || 'setMessage error');
        }
    }
    else {
        i18nFile_1.VueI18nInstance.setMessage({});
    }
    i18nFile_1.VueI18nInstance.initIndex();
}
/**写入 i18n json 文件 */
function writeI18nJSONFile() {
    var config = i18nFile_1.VueI18nInstance.getConfig();
    var message = i18nFile_1.VueI18nInstance.getMessage();
    var outdir = path.join(process.cwd(), config.outdir || '');
    var filepath = path.join(outdir, config.filename + '.json');
    fs.writeFileSync(filepath, JSON.stringify(message, null, '\t'), 'utf8');
}
/**
 * 重写 vue 文件
 * @param file 为当前文件相对路径
 */
function generateVueFile(file) {
    // 读取文件
    var content = fs.readFileSync(file, 'utf8');
    // template 替换
    content = (0, replaceVueTemplate_1.default)(content, file, i18nFile_1.VueI18nInstance, exports.message);
    // 替换script中的部分
    content = (0, transform_1.replaceVueScript)(content, file, i18nFile_1.VueI18nInstance, exports.message);
    (0, utils_1.successlog)("".concat(file, " \u6210\u529F\u5199\u5165"));
    fs.writeFileSync(file, content, 'utf-8');
}
/**
 * 重写 js / ts 文件
 * @param file
 */
function generateJsFile(file) {
    var content = fs.readFileSync(file, 'utf8');
    if (!content) {
        (0, utils_1.errorlog)(file + ' no exist!!');
        return;
    }
    content = (0, transform_1.replaceJavaScriptFile)(content, file, i18nFile_1.VueI18nInstance, exports.message);
    (0, utils_1.successlog)("".concat(file, " \u6210\u529F\u5199\u5165"));
    fs.writeFileSync(file, content, 'utf-8');
}
/**
 * 重写其他文件，目前不支持
 * @param file
 */
function generateOtherFile(file) {
    (0, utils_1.errorlog)("\u6587\u4EF6 ".concat(file, " \u4E0D\u652F\u6301\u8F6C\u5316"));
}
/**转化文件 */
function generate() {
    /**项目配置 */
    var config;
    /**配置文件完整路径 */ // 'E:\\github\\vue-i18n-transform\\vue-i18n-transform.config.js'
    var configPath = path.join(process.cwd(), configFile);
    // 如果存在配置文件
    if (fs.existsSync(configPath)) {
        config = require(configPath);
        if (typeof config === 'object' && config.toString() === '[object Object]') {
            i18nFile_1.VueI18nInstance.mergeConfig(__assign(__assign({}, config), { projectDirname: process.cwd() }));
            config = i18nFile_1.VueI18nInstance.getConfig();
        }
        else {
            return (0, utils_1.errorlog)(configFile + ' 配置文件格式错误');
        }
    }
    if (!config) {
        return (0, utils_1.errorlog)(configFile + ' 配置文件格式错误');
    }
    initFile();
    // 文件的绝对路径
    var files = [];
    if ((config === null || config === void 0 ? void 0 : config.single) === false) {
        files = i18nFile_1.VueI18nInstance.getAllFiles(path.join(process.cwd(), config.entry));
    }
    else {
        files = [path.join(process.cwd(), config.entry)];
    }
    var i18nFile = path.join(process.cwd(), config.outdir, "".concat(config.filename, ".json"));
    files.forEach(function (file) {
        if (file !== i18nFile) {
            // 判断是 vue 文件还是 js/ts 文件
            path.extname(file).toLowerCase() === '.vue'
                ? generateVueFile(file)
                : ['.js', '.ts'].includes(path.extname(file).toLowerCase())
                    ? generateJsFile(file)
                    : generateOtherFile(file);
        }
    });
    writeI18nJSONFile();
}
generate();
