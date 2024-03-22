
import type VueI18n from './i18nFile'
import type { Message } from './transform'

// (?!\1) 指 非 ['"`]
const jsChineseRegExp = /(['"`])(((?!\1).)*[\u4e00-\u9fa5]+((?!\1).)*)\1/gim

export default function replaceJavaScript(content: string, file: string, VueI18nInstance: VueI18n, msg: Message) {
  //替换注释部分
  let comments: Record<string, string> = {}
  let commentsIndex = 0
  content = content.replace(
    // /(\/\*([^\*\/]*|.|\n|\r)*\*\/)|(\/\/.*)/gim,
    /(\/\*(?:(?!\*\/).|[\n\r])*\*\/)|(\/\/.*)/gim,
    (
      match: string,
      _p1: any,
      _p2: any,
      offset: number,
      str: string
    ) => {
      //排除掉url协议部分,貌似不排除也不影响
      if (offset > 0 && str[offset - 1] === ':') {
        return match
      }
      let commentsKey = `/*comment_${commentsIndex++}*/`
      comments[commentsKey] = match
      return commentsKey
    }
  )

  // 替换掉原本就有的i18n.t('****')
  content = content.replace(
    /i18n\.t\(((?!\)).)*\)/gim,
    (match: string) => {
      let commentsKey = `/*comment_${commentsIndex++}*/`
      comments[commentsKey] = match
      return commentsKey
    }
  )

  // 替换掉console.log()
  content = content.replace(
    /console\.log\([^\)]+\)/gim,
    (match: string) => {
      let commentsKey = `/*comment_${commentsIndex++}*/`
      comments[commentsKey] = match
      return commentsKey
    }
  )

  // map里的中文键值不应该被替换
  // 所以先替换含有中文键值,后面再换回来，作用和注释一样，共用一个 comments
  content = content.replace(/['"][^'"]*[\u4e00-\u9fa5]+[^'"]*['"]\s*:/gim, (match: string) => {
    let commentsKey = `/*comment_${commentsIndex++}*/`
    comments[commentsKey] = match
    return commentsKey
  })

  // 替换（可能含有中文的 require）, 作用和注释一样，共用一个 comments
  content = content.replace(
    /require\(((?!\)).)*\)/gim,
    (match: string) => {
      let commentsKey = `/*comment_${commentsIndex++}*/`
      comments[commentsKey] = match
      return commentsKey
    }
  )

  content = content.replace(
    jsChineseRegExp,
    (_: any, prev: string, match: string, __: any, ___: any, offset: number) => {
      match = match.trim()
      let currentKey
      let result = ''
      if (prev !== '`') {
        //对于普通字符串的替换
        currentKey = VueI18nInstance.getCurrentKey(match, file)
        result = `i18n.t('${currentKey}')`
      } else {
        //对于 `` 拼接字符串的替换
        let matchIndex = 0
        let matchArr: string[] = []
        match = match.replace(/(\${)([^{}]+)(})/gim, (_, prev, match) => {
          matchArr.push(match)
          return `{${matchIndex++}}`
        })
        currentKey = VueI18nInstance.getCurrentKey(match, file)
        if (!matchArr.length) {
          result = `i18n.t('${currentKey}')`
        } else {
          result = `i18n.t('${currentKey}', [${matchArr.toString()}])`
        }
      }
      VueI18nInstance.setMessageItem(currentKey, match)
      return result
    }
  )

  //换回注释部分
  content = content.replace(/\/\*comment_\d+\*\//gim, (match: string) => {
    return comments[match]
  })
  return content
}