import type VueI18n from './i18nFile';
/**
 * 还原js文件
 * @param content
 * @param VueI18nInstance
 * @returns
 */
export declare function recoverJavaScriptFile(content: string, VueI18nInstance: VueI18n): string;
/**
 * 还原vue中的js
 * @param content
 * @param VueI18nInstance
 * @returns
 */
export declare function recoverVueScript(content: string, VueI18nInstance: VueI18n): string;
