/**匹配 $t替换的字符串 */
export const dollarTRegexp = /(?<=(\$t|i18n\.t)\(["'])[^'"]+/gm;