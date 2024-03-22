import {
  errorlog,
  successlog,
  warnlog,
} from './utils'

import VueI18n, { Config, VueI18nInstance } from './core/i18nFile'
import replaceVueTemplate from './core/replaceVueTemplate'
import replaceJavaScript from './core/replaceJavaScript'
import { replaceJavaScriptFile, replaceVueScript } from './core/transform'

export {
  replaceVueTemplate,
  replaceJavaScriptFile,
  replaceVueScript,
  replaceJavaScript,
  errorlog,
  successlog,
  warnlog,
  VueI18n,
  Config,
  VueI18nInstance,
}