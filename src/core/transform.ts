import type VueI18n from './i18nFile'
import replaceJavaScript from './replaceJavaScript'
import replaceVueTemplate from './replaceVueTemplate'
const path = require('path')

const i18nMatchRegExp = /(import[\s\t]+i18n[\s\t]+from.+['"].+['"];?)|((let|var|const)[\s\t]+i18n[\s\t]+\=[\s\t]+require\(['"].+['"]\)[\s\t]*;?)/m

export type Message = {
  warn?: (message: string) => void
  error?: (message: string) => void
}

/**
 * 替换 vue 中的 script
 * @param content 文本
 * @param file 文件路径
 * @returns
 */
export function replaceVueScript(content: string, file: string, VueI18nInstance: VueI18n, msg: Message) {
  return content.replace(/(<script[^>]*>)((?:.|\n|\r)*)(<\/script>)/gim, (_: string, prev, match, next, offset, string) => {

    const options = VueI18nInstance.getConfig()
    //判断是否已经引入了 i18n， 若没有引入，则在文件头部引入
    let i18nMatch = content.match(i18nMatchRegExp)

    if (!i18nMatch) {
      const i18n = path
        .relative(path.dirname(file), path.join(options.projectDirname, options.outdir))
        .replace(/\\/g, '/')

        prev = prev + `\nimport i18n from '${i18n[0] === '.' ? i18n + '/index' : './' + i18n + '/index'
        }'\n`
    }

    match = replaceJavaScript(match, file, VueI18nInstance, msg)
    return prev + match + next
  })
}

/**
 * 替换js文件
 * @param content 
 * @param file 
 * @param VueI18nInstance 
 * @param msg 
 * @returns 
 */
export function replaceJavaScriptFile(content: string, file: string, VueI18nInstance: VueI18n, msg: Message) {
  const options = VueI18nInstance.getConfig()
  //判断是否已经引入了 i18n， 若没有引入，则在文件头部引入
  let i18nMatch = content.match(i18nMatchRegExp)

  if (!i18nMatch) {
    const i18n = path
      .relative(path.dirname(file), path.join(options.projectDirname, options.outdir))
      .replace(/\\/g, '/')

    content = `import i18n from '${i18n[0] === '.' ? i18n + '/index' : './' + i18n + '/index'
      }'\n${content}`
  }
  content = replaceJavaScript(content, file, VueI18nInstance, msg)
  return content
}

export { replaceVueTemplate }