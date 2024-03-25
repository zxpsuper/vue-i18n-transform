import type VueI18n from './i18nFile'
/**
 * 还原 vue 中的 template
 * @param content 文本
 * @param langObj 文件路径
 * @returns
 */
export default function recoverVueTemplate(content: string, VueI18nInstance: VueI18n) {
  return content.replace(/<template(.|\n|\r)*template>/gim, (templateText: string) => {
    // ({{\s?\$t\(.*\)\s?}})|(\$t\(.*\)) 匹配 {{ $t('xxx') }} 或 :title="$t('xxx')"
    return templateText.replace(
      /({{\s*\$t\(.+\)\s*}})|(:\S+=\"\$t\(\S+\)\")/g,
      (targetText: string) => {
        targetText = targetText.trim()
        let result = ''
        // @ts-ignore
        const currentKey = targetText.match(/(')((?!\1).*)\1/g)[0].replace(/['"`]/g, '')
        const hashMap = VueI18nInstance.getHashMessage()
        const cnText = hashMap[currentKey]
        if (/^:/.test(targetText)) {
          // 如果是以 : 开头，说明是属性里的翻译文本
          result = targetText.replace(/\$t\(.*\)/g, cnText).slice(1)
        } else if (/\[.*\]/.test(targetText) && /\{.*\}/.test(cnText)) {
          // 带有[]变量（标签内有可能会有变量）,例如{{ $t('xxx', [ i+1 ]) }}
          // 并且翻译的中文带有 { i+1 }
          const before = cnText.split('{')[0]
          const after = cnText.split('}')[1]
          const val = targetText.split('[')[1].split(']')[0]
          result = before + '{{' + val + '}}' + after
        } else {
          result = cnText
        }
        return result
      }
    )
  })
}