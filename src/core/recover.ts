import type VueI18n from './i18nFile'
import recoverJavaScript from './recoverJavaScript'

const i18nImportRegExp =
  /(import[\s\t]+i18n[\s\t]+from.+['"].+['"];?\n+)|((let|var|const)[\s\t]+i18n[\s\t]+\=[\s\t]+require\(['"].+['"]\)[\s\t]*;?)\n+/m

/**
 * 还原js文件
 * @param content
 * @param VueI18nInstance
 * @returns
 */
export function recoverJavaScriptFile(
  content: string,
  VueI18nInstance: VueI18n
) {
  content = content.replace(i18nImportRegExp, () => {
    return ''
  })
  return recoverJavaScript(content, VueI18nInstance)
}

/**
 * 还原vue中的js
 * @param content
 * @param VueI18nInstance
 * @returns
 */
export function recoverVueScript(content: string, VueI18nInstance: VueI18n) {
  return content.replace(
    /(<script[^>]*>)((?:.|\n|\r)*)(<\/script>)/gim,
    (_: string, prev, match, next) => {
      // 删除文件头部 import i18n from './locales/index.js';
      match = match.replace(i18nImportRegExp, () => {
        return ''
      })
      match = recoverJavaScript(match, VueI18nInstance)
      return prev + match + next
    }
  )
}
