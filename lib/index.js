#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var i18nFile_1 = require("./i18nFile");
var path = require('path');
var fs = require('fs-extra');
// replace 的用法 https://www.cnblogs.com/idiv/p/8442046.html
var configFile = 'vue-i18n-transform.config.js';
/**初始化文件 */
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
function writeI18nFile() {
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
    content = (0, utils_1.replaceVueTemplate)({
        content: content,
        file: file,
        getKey: i18nFile_1.VueI18nInstance.getCurrentKey.bind(i18nFile_1.VueI18nInstance),
        replaceSuccess: function (_a) {
            var currentKey = _a.currentKey, match = _a.match;
            i18nFile_1.VueI18nInstance.setMessageItem(currentKey, match);
            i18nFile_1.VueI18nInstance.setMessagesHashItem(match, currentKey);
        }
    });
    // 替换script中的部分
    content = (0, utils_1.replaceVueScript)({
        content: content,
        file: file,
        getKey: i18nFile_1.VueI18nInstance.getCurrentKey.bind(i18nFile_1.VueI18nInstance),
        replaceSuccess: function (_a) {
            var currentKey = _a.currentKey, match = _a.match;
            i18nFile_1.VueI18nInstance.setMessageItem(currentKey, match);
            i18nFile_1.VueI18nInstance.setMessagesHashItem(match, currentKey);
        }
    });
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
    // 判断是否已经引入了 i18n， 若没有引入，则在文件头部引入
    var i18nMatch = content.match(/(import[\s\t]+i18n[\s\t]+from.+['"].+['"];?)|((let|var|const)[\s\t]+i18n[\s\t]+\=[\s\t]+require\(['"].+['"]\)[\s\t]*;?)/m);
    if (!i18nMatch) {
        var i18n = path
            .relative(path.dirname(file), i18nFile_1.VueI18nInstance.getConfig().outdir)
            .replace(/\\/g, '/');
        content = "import i18n from '".concat(i18n[0] === '.' ? i18n + '/index.js' : './' + i18n + '/index.js', "';\n").concat(content);
    }
    content = (0, utils_1.replaceJavaScript)({
        content: content,
        file: file,
        getKey: i18nFile_1.VueI18nInstance.getCurrentKey.bind(i18nFile_1.VueI18nInstance),
        replaceSuccess: function (_a) {
            var currentKey = _a.currentKey, match = _a.match;
            i18nFile_1.VueI18nInstance.setMessageItem(currentKey, match);
            i18nFile_1.VueI18nInstance.setMessagesHashItem(match, currentKey);
        }
    });
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
    /**配置文件完整路径 */
    var configPath = path.join(process.cwd(), configFile);
    // 如果存在配置文件
    if (fs.existsSync(configPath)) {
        config = require(configPath);
        if (typeof config === 'object' && config.toString() === '[object Object]') {
            i18nFile_1.VueI18nInstance.mergeConfig(config, process.cwd());
            config = i18nFile_1.VueI18nInstance.getConfig();
        }
        else {
            return (0, utils_1.errorlog)(configFile + ' 配置文件格式错误');
        }
    }
    if (config === undefined) {
        return (0, utils_1.errorlog)(configFile + ' 配置文件格式错误');
    }
    initFile();
    // 文件的绝对路径
    var files = [];
    if (config.single === false) {
        files = i18nFile_1.VueI18nInstance.getAllFiles(path.join(process.cwd(), config.entry));
    }
    else {
        files = [path.join(process.cwd(), config.entry)];
    }
    var i18nFile = path.join(process.cwd(), config === null || config === void 0 ? void 0 : config.outdir, "".concat(config.filename, ".js"));
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
    writeI18nFile();
}
generate();
