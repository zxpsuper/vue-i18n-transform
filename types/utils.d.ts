import { Config } from './i18nFile';
declare type ReplaceProps = {
    content: string;
    file: string;
    getKey: (match: string, file: string) => string;
    replaceSuccess: (data: {
        currentKey: string;
        match: string;
    }) => void;
};
export declare function errorlog(message: string): void;
export declare function successlog(message: string): void;
export declare function warnlog(message: string): void;
/**
 * 替换 vue 中的 template 中文
 * @param content 文本
 * @param file 文件路径
 * @returns
 */
export declare function replaceVueTemplate({ content, file, getKey, replaceSuccess }: ReplaceProps): string;
/**
 * 替换 vue 中的 script 中文
 * @param content 文本
 * @param file 文件路径
 * @returns
 */
export declare function replaceVueScript({ content, file, getKey, replaceSuccess }: ReplaceProps): string;
/**
 * 替换 js/ts 中的中文
 * @param param0
 * @returns
 */
export declare function replaceJavaScript({ content, file, getKey, replaceSuccess }: ReplaceProps): string;
/**写入 i18n index 文件  */
export declare function writeIndexFile(i18nDir: string, config: Config): void;
export {};
