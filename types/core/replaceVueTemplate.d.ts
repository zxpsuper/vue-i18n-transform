import type VueI18n from './i18nFile';
import type { Message } from './transform';
/**
 * 替换 vue 中的 template
 * @param content 文本
 * @param file 文件路径
 * @returns
 */
export default function replaceVueTemplate(content: string, file: string, VueI18nInstance: VueI18n, msg: Message): string;
