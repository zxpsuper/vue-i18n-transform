"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceVueTemplate = exports.replaceJavaScriptFile = exports.replaceVueScript = void 0;
var replaceJavaScript_1 = require("./replaceJavaScript");
var replaceVueTemplate_1 = require("./replaceVueTemplate");
exports.replaceVueTemplate = replaceVueTemplate_1.default;
var path = require('path');
var i18nMatchRegExp = /(import[\s\t]+i18n[\s\t]+from.+['"].+['"];?)|((let|var|const)[\s\t]+i18n[\s\t]+\=[\s\t]+require\(['"].+['"]\)[\s\t]*;?)/m;
/**
 * 替换 vue 中的 script
 * @param content 文本
 * @param file 文件路径
 * @returns
 */
function replaceVueScript(content, file, VueI18nInstance, msg) {
    return content.replace(/(<script[^>]*>)((?:.|\n|\r)*)(<\/script>)/gim, function (_, prev, match, next, offset, string) {
        var options = VueI18nInstance.getConfig();
        //判断是否已经引入了 i18n， 若没有引入，则在文件头部引入
        var i18nMatch = content.match(i18nMatchRegExp);
        if (!i18nMatch) {
            var i18n = path
                .relative(path.dirname(file), path.join(options.projectDirname, options.outdir))
                .replace(/\\/g, '/');
            prev = prev + "\nimport i18n from '".concat(i18n[0] === '.' ? i18n + '/index' : './' + i18n + '/index', "'\n");
        }
        match = (0, replaceJavaScript_1.default)(match, file, VueI18nInstance, msg);
        return prev + match + next;
    });
}
exports.replaceVueScript = replaceVueScript;
/**
 * 替换js文件
 * @param content
 * @param file
 * @param VueI18nInstance
 * @param msg
 * @returns
 */
function replaceJavaScriptFile(content, file, VueI18nInstance, msg) {
    var options = VueI18nInstance.getConfig();
    //判断是否已经引入了 i18n， 若没有引入，则在文件头部引入
    var i18nMatch = content.match(i18nMatchRegExp);
    if (!i18nMatch) {
        var i18n = path
            .relative(path.dirname(file), path.join(options.projectDirname, options.outdir))
            .replace(/\\/g, '/');
        content = "import i18n from '".concat(i18n[0] === '.' ? i18n + '/index' : './' + i18n + '/index', "'\n").concat(content);
    }
    content = (0, replaceJavaScript_1.default)(content, file, VueI18nInstance, msg);
    return content;
}
exports.replaceJavaScriptFile = replaceJavaScriptFile;
