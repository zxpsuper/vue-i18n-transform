"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function recoverJavaScript(content, VueI18nInstance) {
    return content.replace(/(?:th(?:is|at)\.\$|i18n\.)t\((['"`])((?!\1).)*\1([^\)]+)?\)/g, function (targetText) {
        var _a;
        targetText = targetText.trim();
        var result = targetText;
        var currentKeyList = targetText.match(/(['"`])((?!\1).*)\1/g);
        if (currentKeyList && currentKeyList.length > 0) {
            var currentKey = currentKeyList[0].replace(/['"`]/g, '');
            var hashMap = VueI18nInstance.getMessage();
            var cnText = hashMap[currentKey];
            if (/\[.*\]/.test(targetText) && /\{.*\}/.test(cnText)) {
                // 带有[]变量（标签内有可能会有变量）,例如{{ $t('xxx', [ i+1 ]) }}
                // [name, age] 字符串转数组
                var varString = targetText.match(/(?<=\[)[^\]]+(?=\])/g) || [];
                var varArray_1 = [];
                if (varString && varString.length > 0) {
                    varArray_1 = ((_a = varString[0]) === null || _a === void 0 ? void 0 : _a.replace(/\s+/, '').split(',')) || [];
                }
                cnText = cnText.replace(/{(\d+)}/g, function (_, index) {
                    return varArray_1[index] ? "${".concat(varArray_1[index], "}") : '';
                });
                result = '`' + cnText + '`';
            }
            else {
                result = "'" + cnText + "'";
            }
        }
        return result;
    });
}
exports.default = recoverJavaScript;
