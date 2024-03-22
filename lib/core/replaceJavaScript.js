"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// (?!\1) 指 非 ['"`]
var jsChineseRegExp = /(['"`])(((?!\1).)*[\u4e00-\u9fa5]+((?!\1).)*)\1/gim;
function replaceJavaScript(content, file, VueI18nInstance, msg) {
    //替换注释部分
    var comments = {};
    var commentsIndex = 0;
    content = content.replace(
    // /(\/\*([^\*\/]*|.|\n|\r)*\*\/)|(\/\/.*)/gim,
    /(\/\*(?:(?!\*\/).|[\n\r])*\*\/)|(\/\/.*)/gim, function (match, _p1, _p2, offset, str) {
        //排除掉url协议部分,貌似不排除也不影响
        if (offset > 0 && str[offset - 1] === ':') {
            return match;
        }
        var commentsKey = "/*comment_".concat(commentsIndex++, "*/");
        comments[commentsKey] = match;
        return commentsKey;
    });
    // 替换掉原本就有的i18n.t('****')
    content = content.replace(/i18n\.t\(((?!\)).)*\)/gim, function (match) {
        var commentsKey = "/*comment_".concat(commentsIndex++, "*/");
        comments[commentsKey] = match;
        return commentsKey;
    });
    // 替换掉console.log()
    content = content.replace(/console\.log\([^\)]+\)/gim, function (match) {
        var commentsKey = "/*comment_".concat(commentsIndex++, "*/");
        comments[commentsKey] = match;
        return commentsKey;
    });
    // map里的中文键值不应该被替换
    // 所以先替换含有中文键值,后面再换回来，作用和注释一样，共用一个 comments
    content = content.replace(/['"][^'"]*[\u4e00-\u9fa5]+[^'"]*['"]\s*:/gim, function (match) {
        var commentsKey = "/*comment_".concat(commentsIndex++, "*/");
        comments[commentsKey] = match;
        return commentsKey;
    });
    // 替换（可能含有中文的 require）, 作用和注释一样，共用一个 comments
    content = content.replace(/require\(((?!\)).)*\)/gim, function (match) {
        var commentsKey = "/*comment_".concat(commentsIndex++, "*/");
        comments[commentsKey] = match;
        return commentsKey;
    });
    content = content.replace(jsChineseRegExp, function (_, prev, match, __, ___, offset) {
        match = match.trim();
        var currentKey;
        var result = '';
        if (prev !== '`') {
            //对于普通字符串的替换
            currentKey = VueI18nInstance.getCurrentKey(match, file);
            result = "i18n.t('".concat(currentKey, "')");
        }
        else {
            //对于 `` 拼接字符串的替换
            var matchIndex_1 = 0;
            var matchArr_1 = [];
            match = match.replace(/(\${)([^{}]+)(})/gim, function (_, prev, match) {
                matchArr_1.push(match);
                return "{".concat(matchIndex_1++, "}");
            });
            currentKey = VueI18nInstance.getCurrentKey(match, file);
            if (!matchArr_1.length) {
                result = "i18n.t('".concat(currentKey, "')");
            }
            else {
                result = "i18n.t('".concat(currentKey, "', [").concat(matchArr_1.toString(), "])");
            }
        }
        VueI18nInstance.setMessageItem(currentKey, match);
        return result;
    });
    //换回注释部分
    content = content.replace(/\/\*comment_\d+\*\//gim, function (match) {
        return comments[match];
    });
    return content;
}
exports.default = replaceJavaScript;
