"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 单纯替换tag content 中文文本并设置值
 * @param match
 * @param file
 * @param VueI18nInstance
 * @returns
 */
function replaceCNText(match, file, VueI18nInstance) {
    var currentKey = VueI18nInstance.getCurrentKey(match, file);
    VueI18nInstance.setMessageItem(currentKey, match);
    return "{{$t('".concat(currentKey, "')}}");
}
/**
 * 替换 vue 中的 template
 * @param content 文本
 * @param file 文件路径
 * @returns
 */
function replaceVueTemplate(content, file, VueI18nInstance, msg) {
    return content.replace(/<template(.|\n|\r)*template>/gim, function (match) {
        // 替换注释部分
        // 为何要替换呢？就是注释里可能也存在着 '中文' "中文" `中文` 等情况
        // 所以要先替换了之后再换回来
        var comments = {};
        var commentsIndex = 0;
        match = match.replace(/<!--(?:(?!-->).|[\n\r])*-->/gim, function (match, offset, str) {
            // offset 为偏移量
            // 排除掉url协议部分
            if (offset > 0 && str[offset - 1] === ':')
                return match;
            var commentsKey = "/*comment_".concat(commentsIndex++, "*/");
            comments[commentsKey] = match;
            return commentsKey;
        });
        // 替换(可能含有中文的） require, 作用和注释一样，共用一个 comments
        match = match.replace(/require\(((?!\)).)*\)/gim, function (match) {
            var commentsKey = "/*comment_".concat(commentsIndex++, "*/");
            comments[commentsKey] = match;
            return commentsKey;
        });
        // 替换掉原本就有的$t('****')
        match = match.replace(/\$t\(((?!\)).)*\)/gim, function (match) {
            var commentsKey = "/*comment_".concat(commentsIndex++, "*/");
            comments[commentsKey] = match;
            return commentsKey;
        });
        match = match.replace(/((\w+-){0,}\w+=['"]|>|'|")([^'"<>]*[\u4e00-\u9fa5]+[^'"<>]*)(['"<])/gim, function (_, prev, __, match, after, offset) {
            // 针对一些资源中含有中文名时，不做替换
            if (prev.match(/src=['"]/)) {
                return _;
            }
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
                currentKey = VueI18nInstance.getCurrentKey(match, file);
                if (!matchArr_1.length) {
                    // 普通替换，不存在变量
                    result = "".concat(prev, "{{$t(\"").concat(currentKey, "\")}}").concat(after);
                }
                else {
                    // 替换成着中国形式 $t('name', [name]])
                    result = "".concat(prev, "{{$t(\"").concat(currentKey, "\", [").concat(matchArr_1.toString(), "])}}").concat(after);
                }
            }
            else {
                if (match.match(/\/\*comment_\d+\*\//)) {
                    match = match.replace(/[\u4e00-\u9fa5]+/gim, function (m) {
                        return replaceCNText(m, file, VueI18nInstance);
                    });
                    result = prev + match + after;
                }
                else {
                    currentKey = VueI18nInstance.getCurrentKey(match, file);
                    if (prev.match(/^(\w+-){0,}\w+='$/)) {
                        //对于属性中普通文本的替换，不合理的单引号包裹属性值
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
                        // 无法处理，还原 result
                        result = prev + match + after;
                        (msg === null || msg === void 0 ? void 0 : msg.warn) && msg.warn("".concat(file, " \u5B58\u5728\u65E0\u6CD5\u81EA\u52A8\u66FF\u6362\u7684\u6587\u672C\uFF08").concat(result, "\uFF09\uFF0C\u8BF7\u624B\u52A8\u5904\u7406"));
                    }
                }
            }
            if (result !== (prev + match + after) && currentKey) {
                // result有变动的话，设置message
                VueI18nInstance.setMessageItem(currentKey, match);
            }
            return result;
        });
        // 换回注释 和 require
        return match.replace(/\/\*comment_\d+\*\//gim, function (match) {
            return comments[match];
        });
    });
}
exports.default = replaceVueTemplate;
