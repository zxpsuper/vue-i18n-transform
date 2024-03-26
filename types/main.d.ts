import { errorlog, successlog, warnlog } from './utils';
import VueI18n, { Config, VueI18nInstance } from './core/i18nFile';
import replaceVueTemplate from './core/replaceVueTemplate';
import replaceJavaScript from './core/replaceJavaScript';
import { replaceJavaScriptFile, replaceVueScript } from './core/transform';
import recoverJavaScript from './core/recoverJavaScript';
import { recoverJavaScriptFile, recoverVueScript } from './core/recover';
export { replaceVueTemplate, replaceJavaScriptFile, replaceVueScript, replaceJavaScript, recoverJavaScript, recoverJavaScriptFile, recoverVueScript, errorlog, successlog, warnlog, VueI18n, Config, VueI18nInstance, };
