"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recoverVueScript = exports.recoverJavaScriptFile = void 0;
var recoverJavaScript_1 = require("./recoverJavaScript");
var i18nImportRegExp = /(import[\s\t]+i18n[\s\t]+from.+['"].+['"];?\n+)|((let|var|const)[\s\t]+i18n[\s\t]+\=[\s\t]+require\(['"].+['"]\)[\s\t]*;?)\n+/m;
/**
 * 还原js文件
 * @param content
 * @param VueI18nInstance
 * @returns
 */
function recoverJavaScriptFile(content, VueI18nInstance) {
    content = content.replace(i18nImportRegExp, function () {
        return '';
    });
    return (0, recoverJavaScript_1.default)(content, VueI18nInstance);
}
exports.recoverJavaScriptFile = recoverJavaScriptFile;
/**
 * 还原vue中的js
 * @param content
 * @param VueI18nInstance
 * @returns
 */
function recoverVueScript(content, VueI18nInstance) {
    return content.replace(/(<script[^>]*>)((?:.|\n|\r)*)(<\/script>)/gim, function (_, prev, match, next) {
        // 删除文件头部 import i18n from './locales/index.js';
        match = match.replace(i18nImportRegExp, function () {
            return '';
        });
        match = (0, recoverJavaScript_1.default)(match, VueI18nInstance);
        return prev + match + next;
    });
}
exports.recoverVueScript = recoverVueScript;
