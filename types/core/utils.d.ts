import type { Message } from './transform';
import type VueI18n from './i18nFile';
/**
 * 获取用户设置 vue-i18n-transform.config.js / vue-i18n-transform.config.json
 * @param fsPath
 * @param customConfigFileName
 * @param forceIgnoreCustomSetting
 * @returns
 */
export declare function getCustomSetting(fsPath: string, customConfigFileName: string, VueI18nInstance: VueI18n, msg?: Message, forceIgnoreCustomSetting?: boolean): any;
