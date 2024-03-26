import type VueI18n from './i18nFile'
/**
 * 还原 vue 中的 template
 * @param content 文本
 * @param langObj 文件路径
 * @returns
 */
export default function recoverVueTemplate(content: string, VueI18nInstance: VueI18n) {
  return content.replace(/<template(.|\n|\r)*template>/gim, (templateText: string) => {
    // 匹配 {{ $t('xxx') }} 或 :title="$t('xxx')"
    return templateText.replace(
      /{{\s*\$t\([^\)]+\)\s*}}|:(?:\w+-)*\w+="\$t\([^\)]+\)([^"]*)"/g,
      (targetText: string, p1) => {
        const matchArr = targetText.match(/\$t\((['"`])([^\1]+)\1/)
        if (matchArr) {
          let result = ''
          const [,, currentKey] = matchArr
          const hashMap = VueI18nInstance.getMessage()
          const cnText = hashMap[currentKey]
          if (/^:/.test(targetText)) {
            // 如果是以 : 开头，说明是属性里的翻译文本
            if (!p1) {
              // 没有p1说明只有中文没有其他变量，可以去除冒号：
              result = targetText.replace(/\$t\([^\)]+\)/g, cnText).slice(1)
            } else {
              // 有p1说明还有其他东西，不能去除冒号：
              result = targetText.replace(/\$t\([^\)]+\)/g, `'${cnText}'`)
            }
          } else if (/\[.*\]/.test(targetText) && /\{.*\}/.test(cnText)) {
            // 带有[]变量（标签内有可能会有变量）,例如{{ $t('xxx', [ i+1 ]) }}
            // [name, age] 字符串转数组
            let varString = targetText.match(/(?<=\[)[^\]]+(?=\])/g) || []
            let varArray: string[] = []
            if (varString && varString.length > 0) {
              varArray = varString[0]?.replace(/\s+/, '').split(',') || []
            }
            result = cnText.replace(/{(\d+)}/g, (_, index) => {
              return varArray[index] ? `{{${varArray[index]}}}` : ''
            })
          } else {
            result = cnText
          }
          return result
        } else {
          return targetText
        }
      }
    )
  })
}