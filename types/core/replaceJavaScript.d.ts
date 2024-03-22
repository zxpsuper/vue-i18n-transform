import type VueI18n from './i18nFile';
import type { Message } from './transform';
export default function replaceJavaScript(content: string, file: string, VueI18nInstance: VueI18n, msg: Message): string;
