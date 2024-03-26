import type VueI18n from './i18nFile'

export default function recoverJavaScript(
  content: string,
  VueI18nInstance: VueI18n
) {
  return content.replace(
    /(?:th(?:is|at)\.\$|i18n\.)t\((['"`])((?!\1).)*\1([^\)]+)?\)/g,
    (targetText: string) => {
      targetText = targetText.trim()
      let result = targetText
      const currentKeyList = targetText.match(/(['"`])((?!\1).*)\1/g)
      if (currentKeyList && currentKeyList.length > 0) {
        const currentKey = currentKeyList[0].replace(/['"`]/g, '')
        const hashMap = VueI18nInstance.getMessage()
        let cnText = hashMap[currentKey]
        if (/\[.*\]/.test(targetText) && /\{.*\}/.test(cnText)) {
          // 带有[]变量（标签内有可能会有变量）,例如{{ $t('xxx', [ i+1 ]) }}
          // [name, age] 字符串转数组
          let varString = targetText.match(/(?<=\[)[^\]]+(?=\])/g) || []
          let varArray: string[] = []
          if (varString && varString.length > 0) {
            varArray = varString[0]?.replace(/\s+/, '').split(',') || []
          }
          cnText = cnText.replace(/{(\d+)}/g, (_, index) => {
            return varArray[index] ? `\${${varArray[index]}}` : ''
          })
          result = '`' + cnText + '`'
        } else {
          result = `'` + cnText + `'`
        }
      }
      return result
    }
  )
}
