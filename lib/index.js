"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var i18nFile_1 = require("./i18nFile");
var path = require('path');
var fs = require('fs-extra');
// replace 的用法 https://www.cnblogs.com/idiv/p/8442046.html
var VueI18nInstance = new i18nFile_1.default();
var configFile = 'vue-i18n-transform.config.js';
function generate() {
    /**项目配置 */
    var config;
    /**配置文件完整路径 */
    var configPath = path.join(process.cwd(), configFile);
    // 如果存在配置文件
    if (fs.existsSync(configPath)) {
        config = require(configPath);
        if (typeof config === 'object' && config.toString() === '[object Object]') {
            VueI18nInstance.mergeConfig(config);
            config = VueI18nInstance.getConfig();
        }
        else {
            return (0, utils_1.errorlog)(configFile + ' 配置文件格式错误');
        }
    }
    if (config === undefined) {
        return (0, utils_1.errorlog)(configFile + ' 配置文件格式错误');
    }
    initFile();
    // 文件的相对路径
    var files = [];
    if (config.single === false) {
        files = VueI18nInstance.getAllFiles(config.entry);
    }
    else {
        files = [path.join(process.cwd(), config.entry)];
    }
    var i18nFile = path.join(config === null || config === void 0 ? void 0 : config.outdir, "".concat(config.filename, ".js"));
    files.forEach(function (item) {
        if (item !== i18nFile) {
            // 判断是 vue 文件还是 js/ts 文件
            path.extname(item).toLowerCase() === '.vue'
                ? generateVueFile(item)
                : ['.js', '.ts'].includes(path.extname(item).toLowerCase())
                    ? generateJsFile(item)
                    : generateOtherFile(item);
        }
    });
    writeI18nFile();
}
/**写入 i18n index 文件  */
function writeIndexFile(i18nDir, config) {
    var exist = fs.existsSync(i18nDir);
    if (!exist) {
        (0, utils_1.errorlog)("\u6587\u4EF6\u5939".concat(i18nDir, "\u4E0D\u5B58\u5728"));
        (0, utils_1.successlog)("\u81EA\u52A8\u4E3A\u4F60\u521B\u5EFA\u6587\u4EF6\u5939".concat(i18nDir));
        fs.mkdirSync(i18nDir);
    }
    var file = path.join(i18nDir, "index.js");
    if (fs.existsSync(file))
        return;
    fs.writeFileSync(file, "import VueI18n from 'vue-i18n'\nimport Vue from 'vue'\nimport zh from './".concat(config.filename, ".json'\n\n") +
        "Vue.use(VueI18n)\n\nexport default new VueI18n({\n\tlocale: 'zh',\n\tmessages: {\n\t\tzh \n\t}\n})\n", 'utf8');
}
/**初始化文件 */
function initFile() {
    var config = VueI18nInstance.getConfig();
    var i18nDir = path.join(process.cwd(), config.outdir);
    var i18nFile = path.join(i18nDir, "".concat(config.filename, ".json"));
    writeIndexFile(i18nDir, config);
    if (fs.existsSync(i18nFile) &&
        require(i18nFile).toString() === '[object Object]') {
        try {
            VueI18nInstance.setMessage(require(i18nFile));
        }
        catch (e) {
            return (0, utils_1.errorlog)(e.message || 'setMessage error');
        }
    }
    else {
        VueI18nInstance.setMessage({});
    }
    VueI18nInstance.initIndex();
}
/**写入 i18n json 文件 */
function writeI18nFile() {
    var config = VueI18nInstance.getConfig();
    var message = VueI18nInstance.getMessage();
    var outdir = path.join(process.cwd(), config.outdir || '');
    var filepath = path.join(outdir, config.filename + '.json');
    fs.writeFileSync(filepath, JSON.stringify(message, null, '\t'), 'utf8');
}
/**
 * 替换 vue 中的 template
 * @param content 文本
 * @param file 文件路径
 * @returns
 */
function replaceVueTemplate(content, file) {
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
                currentKey = VueI18nInstance.getCurrentKey(match, file);
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
                currentKey = VueI18nInstance.getCurrentKey(match, file);
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
                    (0, utils_1.warnlog)("".concat(file, " \u5B58\u5728\u65E0\u6CD5\u81EA\u52A8\u66FF\u6362\u7684\u6587\u672C\uFF08").concat(result, "\uFF09\uFF0C\u8BF7\u624B\u52A8\u5904\u7406"));
                }
            }
            VueI18nInstance.setMessageItem(currentKey, match);
            VueI18nInstance.setMessagesHashItem(match, currentKey);
            return result;
        });
    });
}
/**
 * 替换 vue 中的 script
 * @param content 文本
 * @param file 文件路径
 * @returns
 */
function replaceVueScript(content, file) {
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
                currentKey = VueI18nInstance.getCurrentKey(match, file);
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
                currentKey = VueI18nInstance.getCurrentKey(match, file);
                if (!matchArr_2.length) {
                    result = "this.$t('".concat(currentKey, "')");
                }
                else {
                    result = "this.$t('".concat(currentKey, "', [").concat(matchArr_2.toString(), "])");
                }
            }
            VueI18nInstance.setMessageItem(currentKey, match);
            VueI18nInstance.setMessagesHashItem(match, currentKey);
            return result;
        });
        // 换回注释 和 require
        return match.replace(/\/\*comment_\d+\*\//gim, function (match) {
            return comments[match];
        });
    });
}
/**
 * 重写 vue 文件
 * @param file 为当前文件相对路径
 */
function generateVueFile(file) {
    // 读取文件
    var content = fs.readFileSync(file, 'utf8');
    // template 替换
    content = replaceVueTemplate(content, file);
    // 替换script中的部分
    content = replaceVueScript(content, file);
    (0, utils_1.successlog)("".concat(file, " \u6210\u529F\u5199\u5165"));
    fs.writeFileSync(file, content, 'utf-8');
}
/**
 * 重写 js / ts 文件
 * @param file
 */
function generateJsFile(file) {
    var content = fs.readFileSync(file, 'utf8');
    //判断是否已经引入了 i18n， 若没有引入，则在文件头部引入
    var i18nMatch = content.match(/(import[\s\t]+i18n[\s\t]+from.+['"].+['"];?)|((let|var|const)[\s\t]+i18n[\s\t]+\=[\s\t]+require\(['"].+['"]\)[\s\t]*;?)/m);
    if (!i18nMatch) {
        var i18n = path
            .relative(path.dirname(file), VueI18nInstance.getConfig().outdir)
            .replace(/\\/g, '/');
        content = "import i18n from '".concat(i18n[0] === '.' ? i18n + '/index.js' : './' + i18n + '/index.js', "';\n").concat(content);
    }
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
            currentKey = VueI18nInstance.getCurrentKey(match, file);
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
            currentKey = VueI18nInstance.getCurrentKey(match, file);
            if (!matchArr_3.length) {
                result = "i18n.t('".concat(currentKey, "')");
            }
            else {
                result = "i18n.t('".concat(currentKey, "', [").concat(matchArr_3.toString(), "])");
            }
        }
        VueI18nInstance.setMessageItem(currentKey, match);
        VueI18nInstance.setMessagesHashItem(match, currentKey);
        return result;
    });
    //换回注释部分
    content = content.replace(/\/\*comment_\d+\*\//gim, function (match) {
        return comments[match];
    });
    (0, utils_1.successlog)("".concat(file, " \u6210\u529F\u5199\u5165"));
    fs.writeFileSync(file, content, 'utf-8');
}
function generateOtherFile(file) {
    (0, utils_1.errorlog)("\u6587\u4EF6 ".concat(file, " \u4E0D\u652F\u6301\u8F6C\u5316"));
}
generate();
