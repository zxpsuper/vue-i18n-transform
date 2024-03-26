import type VueI18n from './i18nFile';
/**
 * 还原 vue 中的 template
 * @param content 文本
 * @param langObj 文件路径
 * @returns
 */
export default function recoverVueTemplate(content: string, VueI18nInstance: VueI18n): string;
