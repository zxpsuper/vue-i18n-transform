import type VueI18n from './i18nFile';
import replaceVueTemplate from './replaceVueTemplate';
export type Message = {
    warn?: (message: string) => void;
    error?: (message: string) => void;
};
/**
 * 替换 vue 中的 script
 * @param content 文本
 * @param file 文件路径
 * @returns
 */
export declare function replaceVueScript(content: string, file: string, VueI18nInstance: VueI18n, msg: Message): string;
/**
 * 替换js文件
 * @param content
 * @param file
 * @param VueI18nInstance
 * @param msg
 * @returns
 */
export declare function replaceJavaScriptFile(content: string, file: string, VueI18nInstance: VueI18n, msg: Message): string;
export { replaceVueTemplate };
