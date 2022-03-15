"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeIndexFile = exports.replaceJavaScript = exports.replaceVueScript = exports.replaceVueTemplate = exports.warnlog = exports.successlog = exports.errorlog = void 0;
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
/**
 * 替换 vue 中的 template 中文
 * @param content 文本
 * @param file 文件路径
 * @returns
 */
function replaceVueTemplate(_a) {
    var content = _a.content, file = _a.file, getKey = _a.getKey, replaceSuccess = _a.replaceSuccess;
    return content.replace(/<template(.|\n|\r)*template>/gim, function (match) {
        return match.replace(/((\w+-){0,}\w+=['"]|>|'|")([^'"<>]*[\u4e00-\u9fa5]+[^'"<>]*)(['"<])/gim, function (_, prev, __, match, after) {
            // 针对一些资源中含有中文名时，不做替换
            if (prev.match(/src=['"]/))
                return _;
            match = match.trim();
            var result = '';
            var currentKey;
            if (match.match(/{{[^{}]+}}/)) {
                // 包含变量的中文字符串
                var matchIndex_1 = 0;
                var matchArr_1 = [];
                match = match.replace(/{{([^{}]+)}}/gim, function (_, match) {
                    matchArr_1.push(match);
                    return "{".concat(matchIndex_1++, "}");
                });
                currentKey = getKey(match, file);
                if (!matchArr_1.length) {
                    // 普通替换，不存在变量
                    result = "".concat(prev, "{{$t('").concat(currentKey, "')}}").concat(after);
                }
                else {
                    // 替换成着中国形式 $t('name', [name]])
                    result = "".concat(prev, "{{$t('").concat(currentKey, "', [").concat(matchArr_1.toString(), "])}}").concat(after);
                }
            }
            else {
                currentKey = getKey(match, file);
                if (prev.match(/^(\w+-){0,}\w+='$/)) {
                    //对于属性中普通文本的替换
                    result = ":".concat(prev, "$t(\"").concat(currentKey, "\")").concat(after);
                }
                else if (prev.match(/^(\w+-){0,}\w+="$/)) {
                    //对于属性中普通文本的替换
                    result = ":".concat(prev, "$t('").concat(currentKey, "')").concat(after);
                }
                else if ((prev === '"' && after === '"') ||
                    (prev === "'" && after === "'")) {
                    //对于属性中参数形式中的替换
                    result = "$t(".concat(prev).concat(currentKey).concat(after, ")");
                }
                else if (prev === '>' && after === '<') {
                    //对于tag标签中的普通文本替换
                    result = "".concat(prev, "{{$t('").concat(currentKey, "')}}").concat(after);
                }
                else {
                    // 这里会额外创建一个多余的 message key
                    result = prev + match + after;
                    warnlog("".concat(file, " \u5B58\u5728\u65E0\u6CD5\u81EA\u52A8\u66FF\u6362\u7684\u6587\u672C\uFF08").concat(result, "\uFF09\uFF0C\u8BF7\u624B\u52A8\u5904\u7406"));
                }
            }
            replaceSuccess({ currentKey: currentKey, match: match });
            return result;
        });
    });
}
exports.replaceVueTemplate = replaceVueTemplate;
/**
 * 替换 vue 中的 script 中文
 * @param content 文本
 * @param file 文件路径
 * @returns
 */
function replaceVueScript(_a) {
    var content = _a.content, file = _a.file, getKey = _a.getKey, replaceSuccess = _a.replaceSuccess;
    return content.replace(/<script(.|\n|\r)*script>/gim, function (match) {
        // 替换注释部分
        // 为何要替换呢？就是注释里可能也存在着 '中文' "中文" `中文` 等情况
        // 所以要先替换了之后再换回来
        var comments = {};
        var commentsIndex = 0;
        match = match.replace(
        // /(\/\*(.|\n|\r)*\*\/)|(\/\/.*)/gim,
        /(\/\*(?:(?!\*\/).|[\n\r])*\*\/)|(\/\/.*)/gim, function (match, p1, p2, p3, offset, str) {
            // offset 为偏移量
            // 排除掉url协议部分
            if (offset > 0 && str[offset - 1] === ':')
                return match;
            var commentsKey = "/*comment_".concat(commentsIndex++, "*/");
            comments[commentsKey] = match;
            return commentsKey;
        });
        // 替换含有中文的 require, 作用和注释一样，共用一个 comments
        match = match.replace(/require\(.*[\u4e00-\u9fa5]+.*\)/gim, function (match) {
            var commentsKey = "/*comment_".concat(commentsIndex++, "*/");
            comments[commentsKey] = match;
            return commentsKey;
        });
        // map里的中文键值不应该被替换
        // 所以先替换含有中文键值,后面再换回来，作用和注释一样，共用一个 comments
        match = match.replace(/['"][\u4e00-\u9fa5]+['"]:/gim, function (match) {
            var commentsKey = "/*comment_".concat(commentsIndex++, "*/");
            comments[commentsKey] = match;
            return commentsKey;
        });
        match = match.replace(
        // (?!\1) 指 非 ['"`]
        /(['"`])(((?!\1).)*[\u4e00-\u9fa5]+((?!\1).)*)\1/gim, function (_, prev, match) {
            match = match.trim();
            var currentKey;
            var result = '';
            if (prev !== '`') {
                //对于普通字符串的替换
                currentKey = getKey(match, file);
                result = "this.$t('".concat(currentKey, "')");
            }
            else {
                //对于 `` 拼接字符串的替换
                var matchIndex_2 = 0;
                var matchArr_2 = [];
                // 针对 `${name}`
                match = match.replace(/(\${)([^{}]+)(})/gim, function (_, prev, match) {
                    matchArr_2.push(match);
                    return "{".concat(matchIndex_2++, "}");
                });
                currentKey = getKey(match, file);
                if (!matchArr_2.length) {
                    result = "this.$t('".concat(currentKey, "')");
                }
                else {
                    result = "this.$t('".concat(currentKey, "', [").concat(matchArr_2.toString(), "])");
                }
            }
            replaceSuccess({ currentKey: currentKey, match: match });
            return result;
        });
        // 换回注释 和 require
        return match.replace(/\/\*comment_\d+\*\//gim, function (match) {
            return comments[match];
        });
    });
}
exports.replaceVueScript = replaceVueScript;
/**
 * 替换 js/ts 中的中文
 * @param param0
 * @returns
 */
function replaceJavaScript(_a) {
    var content = _a.content, file = _a.file, getKey = _a.getKey, replaceSuccess = _a.replaceSuccess;
    //替换注释部分
    var comments = {};
    var commentsIndex = 0;
    content = content.replace(
    // /(\/\*([^\*\/]*|.|\n|\r)*\*\/)|(\/\/.*)/gim,
    /(\/\*(?:(?!\*\/).|[\n\r])*\*\/)|(\/\/.*)/gim, function (match, _p1, _p2, _p3, offset, str) {
        //排除掉url协议部分
        if (offset > 0 && str[offset - 1] === ':')
            return match;
        var commentsKey = "/*comment_".concat(commentsIndex++, "*/");
        comments[commentsKey] = match;
        return commentsKey;
    });
    content = content.replace(/(['"`])(((?!\1).)*[\u4e00-\u9fa5]+((?!\1).)*)\1/gim, function (_, prev, match) {
        match = match.trim();
        var currentKey;
        var result = '';
        if (prev !== '`') {
            //对于普通字符串的替换
            currentKey = getKey(match, file);
            result = "i18n.t('".concat(currentKey, "')");
        }
        else {
            //对于 `` 拼接字符串的替换
            var matchIndex_3 = 0;
            var matchArr_3 = [];
            match = match.replace(/(\${)([^{}]+)(})/gim, function (_, prev, match) {
                matchArr_3.push(match);
                return "{".concat(matchIndex_3++, "}");
            });
            currentKey = getKey(match, file);
            if (!matchArr_3.length) {
                result = "i18n.t('".concat(currentKey, "')");
            }
            else {
                result = "i18n.t('".concat(currentKey, "', [").concat(matchArr_3.toString(), "])");
            }
        }
        replaceSuccess({ currentKey: currentKey, match: match });
        return result;
    });
    //换回注释部分
    content = content.replace(/\/\*comment_\d+\*\//gim, function (match) {
        return comments[match];
    });
    return content;
}
exports.replaceJavaScript = replaceJavaScript;
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
