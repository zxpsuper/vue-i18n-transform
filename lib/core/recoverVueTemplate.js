"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 还原 vue 中的 template
 * @param content 文本
 * @param langObj 文件路径
 * @returns
 */
function recoverVueTemplate(content, VueI18nInstance) {
    return content.replace(/<template(.|\n|\r)*template>/gim, function (templateText) {
        // 匹配 {{ $t('xxx') }} 或 :title="$t('xxx')"
        return templateText.replace(/{{\s*\$t\([^\)]+\)\s*}}|:(?:\w+-)*\w+="\$t\([^\)]+\)([^"]*)"/g, function (targetText, p1) {
            var _a;
            var matchArr = targetText.match(/\$t\((['"`])([^\1]+)\1/);
            if (matchArr) {
                var result = '';
                var currentKey = matchArr[2];
                var hashMap = VueI18nInstance.getMessage();
                var cnText = hashMap[currentKey];
                if (/^:/.test(targetText)) {
                    // 如果是以 : 开头，说明是属性里的翻译文本
                    if (!p1) {
                        // 没有p1说明只有中文没有其他变量，可以去除冒号：
                        result = targetText.replace(/\$t\([^\)]+\)/g, cnText).slice(1);
                    }
                    else {
                        // 有p1说明还有其他东西，不能去除冒号：
                        result = targetText.replace(/\$t\([^\)]+\)/g, "'".concat(cnText, "'"));
                    }
                }
                else if (/\[.*\]/.test(targetText) && /\{.*\}/.test(cnText)) {
                    // 带有[]变量（标签内有可能会有变量）,例如{{ $t('xxx', [ i+1 ]) }}
                    // [name, age] 字符串转数组
                    var varString = targetText.match(/(?<=\[)[^\]]+(?=\])/g) || [];
                    var varArray_1 = [];
                    if (varString && varString.length > 0) {
                        varArray_1 = ((_a = varString[0]) === null || _a === void 0 ? void 0 : _a.replace(/\s+/, '').split(',')) || [];
                    }
                    result = cnText.replace(/{(\d+)}/g, function (_, index) {
                        return varArray_1[index] ? "{{".concat(varArray_1[index], "}}") : '';
                    });
                }
                else {
                    result = cnText;
                }
                return result;
            }
            else {
                return targetText;
            }
        });
    });
}
exports.default = recoverVueTemplate;
