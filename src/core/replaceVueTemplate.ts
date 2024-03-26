import type VueI18n from './i18nFile'
import type { Message } from './transform'

/**
 * 单纯替换tag content 中文文本并设置值
 * @param match
 * @param file
 * @param VueI18nInstance
 * @returns
 */
function replaceCNText(match: string, file: string, VueI18nInstance: VueI18n): string {
  const currentKey = VueI18nInstance.getCurrentKey(match, file)
  VueI18nInstance.setMessageItem(currentKey, match)
  return `{{$t('${currentKey}')}}`
}
/**
 * 替换 vue 中的 template
 * @param content 文本
 * @param file 文件路径
 * @returns
 */
export default function replaceVueTemplate(
  content: string,
  file: string,
  VueI18nInstance: VueI18n,
  msg: Message
): string {
  return content.replace(/<template(.|\n|\r)*template>/gim, (match: string) => {
    // 替换注释部分
    // 为何要替换呢？就是注释里可能也存在着 '中文' "中文" `中文` 等情况
    // 所以要先替换了之后再换回来
    let comments: Record<string, string> = {}
    let commentsIndex = 0
    match = match.replace(/<!--(?:(?!-->).|[\n\r])*-->/gim, (match, offset, str) => {
      // offset 为偏移量
      // 排除掉url协议部分
      if (offset > 0 && str[offset - 1] === ':') {
        return match
      }
      let commentsKey = `/*comment_${commentsIndex++}*/`
      comments[commentsKey] = match
      return commentsKey
    })

    // 替换(可能含有中文的） require, 作用和注释一样，共用一个 comments
    match = match.replace(/require\(((?!\)).)*\)/gim, (match: string) => {
      let commentsKey = `/*comment_${commentsIndex++}*/`
      comments[commentsKey] = match
      return commentsKey
    })

    // 替换掉原本就有的$t('****')
    match = match.replace(/\$t\(((?!\)).)*\)/gim, (match: string) => {
      let commentsKey = `/*comment_${commentsIndex++}*/`
      comments[commentsKey] = match
      return commentsKey
    })

    match = match.replace(
      /((\w+-){0,}\w+=['"]|>|'|")([^'"<>]*[\u4e00-\u9fa5]+[^'"<>]*)(['"<])/gim,
      (_, prev: string, __, match: string, after: string, offset: number) => {
        // 针对一些资源中含有中文名时，不做替换
        if (prev.match(/src=['"]/)) {
          return _
        }
        match = match.trim()
        let result = ''
        let currentKey

        if (match.match(/{{[^{}]+}}/)) {
          // 包含变量的中文字符串
          let matchIndex = 0
          let matchArr: string[] = []
          match = match.replace(/{{([^{}]+)}}/gim, (_, match: string) => {
            matchArr.push(match)
            return `{${matchIndex++}}`
          })
          currentKey = VueI18nInstance.getCurrentKey(match, file)
          if (!matchArr.length) {
            // 普通替换，不存在变量
            result = `${prev}{{$t('${currentKey}')}}${after}`
          } else {
            // 替换成着中国形式 $t('name', [name]])
            result = `${prev}{{$t('${currentKey}', [${matchArr.toString()}])}}${after}`
          }
        } else {
          if (match.match(/\/\*comment_\d+\*\//)) {
            match = match.replace(/[\u4e00-\u9fa5]+/gim, (m) => {
              return replaceCNText(m, file, VueI18nInstance)
            })
            result = prev + match + after
          } else {
            currentKey = VueI18nInstance.getCurrentKey(match, file)
            if (prev.match(/^(\w+-){0,}\w+='$/)) {
              //对于属性中普通文本的替换，不合理的单引号包裹属性值
              result = `:${prev}$t("${currentKey}")${after}`
            } else if (prev.match(/^(\w+-){0,}\w+="$/)) {
              //对于属性中普通文本的替换
              result = `:${prev}$t('${currentKey}')${after}`
            } else if ((prev === '"' && after === '"') || (prev === "'" && after === "'")) {
              //对于属性中参数形式中的替换
              result = `$t(${prev}${currentKey}${after})`
            } else if (prev === '>' && after === '<') {
              //对于tag标签中的普通文本替换
              result = `${prev}{{$t('${currentKey}')}}${after}`
            } else {
              // 无法处理，还原 result
              result = prev + match + after
              msg?.warn && msg.warn(`${file} 存在无法自动替换的文本（${result}），请手动处理`)
            }
          }
        }
        if (result !== prev + match + after && currentKey) {
          // result有变动的话，设置message
          VueI18nInstance.setMessageItem(currentKey, match)
        }
        return result
      }
    )

    // 换回注释 和 require
    return match.replace(/\/\*comment_\d+\*\//gim, (match) => {
      return comments[match]
    })
  })
}
