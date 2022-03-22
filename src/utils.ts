import { Config } from './i18nFile'
const chalk = require('chalk')
const path = require('path')
const fs = require('fs-extra')

type ReplaceProps = {
  content: string
  file: string
  getKey: (match: string, file: string) => string
  replaceSuccess?: (data: { currentKey: string; match: string }) => void
  replaceFail?: (data: { currentKey: string; match: string }) => void
}

export function errorlog(message: string) {
  console.error(chalk.red('✖ ' + message))
}

export function successlog(message: string) {
  console.error(chalk.green('✔ ' + message))
}

export function warnlog(message: string) {
  console.error(chalk.yellow('⚠ ' + message))
}

/**
 * 替换 vue 中的 template 中文
 * @param content 文本
 * @param file 文件路径
 * @returns
 */
export function replaceVueTemplate({
  content,
  file,
  getKey,
  replaceSuccess,
  replaceFail
}: ReplaceProps) {
  return content.replace(/<template(.|\n|\r)*template>/gim, (match: string) => {
    return match.replace(
      /((\w+-){0,}\w+=['"]|>|'|")([^'"<>]*[\u4e00-\u9fa5]+[^'"<>]*)(['"<])/gim,
      (_, prev: string, __, match: string, after: string) => {
        // 针对一些资源中含有中文名时，不做替换
        if (prev.match(/src=['"]/)) return _
        match = match.trim()
        let result = ''
        let replaceStringFail = false // 替换失败
        let currentKey
        if (match.match(/{{[^{}]+}}/)) {
          // 包含变量的中文字符串
          let matchIndex = 0
          let matchArr: string[] = []
          match = match.replace(/{{([^{}]+)}}/gim, (_, match: string) => {
            matchArr.push(match)
            return `{${matchIndex++}}`
          })
          currentKey = getKey(match, file)
          if (!matchArr.length) {
            // 普通替换，不存在变量
            result = `${prev}{{$t('${currentKey}')}}${after}`
          } else {
            // 替换成着中国形式 $t('name', [name]])
            result = `${prev}{{$t('${currentKey}', [${matchArr.toString()}])}}${after}`
          }
        } else {
          currentKey = getKey(match, file)
          if (prev.match(/^(\w+-){0,}\w+='$/)) {
            //对于属性中普通文本的替换
            result = `:${prev}$t("${currentKey}")${after}`
          } else if (prev.match(/^(\w+-){0,}\w+="$/)) {
            //对于属性中普通文本的替换
            result = `:${prev}$t('${currentKey}')${after}`
          } else if (
            (prev === '"' && after === '"') ||
            (prev === "'" && after === "'")
          ) {
            //对于属性中参数形式中的替换
            result = `$t(${prev}${currentKey}${after})`
          } else if (prev === '>' && after === '<') {
            //对于tag标签中的普通文本替换
            result = `${prev}{{$t('${currentKey}')}}${after}`
          } else {
            // 这里会额外创建一个多余的 message key
            result = prev + match + after
            warnlog(`${file} 存在无法自动替换的文本（${result}），请手动处理`)
            replaceFail && replaceFail({ currentKey, match })
            replaceStringFail = true
          }
        }
        replaceStringFail === false && replaceSuccess && replaceSuccess({ currentKey, match })
        return result
      }
    )
  })
}

/**
 * 替换 vue 中的 script 中文
 * @param content 文本
 * @param file 文件路径
 * @returns
 */
export function replaceVueScript({
  content,
  file,
  getKey,
  replaceSuccess
}: ReplaceProps) {
  return content.replace(/<script(.|\n|\r)*script>/gim, (match: string) => {
    // 替换注释部分
    // 为何要替换呢？就是注释里可能也存在着 '中文' "中文" `中文` 等情况
    // 所以要先替换了之后再换回来
    let comments: Record<string, string> = {}
    let commentsIndex = 0
    match = match.replace(
      // /(\/\*(.|\n|\r)*\*\/)|(\/\/.*)/gim,
      /(\/\*(?:(?!\*\/).|[\n\r])*\*\/)|(\/\/.*)/gim,
      (match, p1, p2, p3, offset, str) => {
        // offset 为偏移量
        // 排除掉url协议部分
        if (offset > 0 && str[offset - 1] === ':') return match
        let commentsKey = `/*comment_${commentsIndex++}*/`
        comments[commentsKey] = match
        return commentsKey
      }
    )

    // 替换含有中文的 require, 作用和注释一样，共用一个 comments
    match = match.replace(
      /require\(.*[\u4e00-\u9fa5]+.*\)/gim,
      (match: string) => {
        let commentsKey = `/*comment_${commentsIndex++}*/`
        comments[commentsKey] = match
        return commentsKey
      }
    )

    // map里的中文键值不应该被替换
    // 所以先替换含有中文键值,后面再换回来，作用和注释一样，共用一个 comments
    match = match.replace(/['"][\u4e00-\u9fa5]+['"]:/gim, (match: string) => {
      let commentsKey = `/*comment_${commentsIndex++}*/`
      comments[commentsKey] = match
      return commentsKey
    })

    match = match.replace(
      // (?!\1) 指 非 ['"`]
      /(['"`])(((?!\1).)*[\u4e00-\u9fa5]+((?!\1).)*)\1/gim,
      (_, prev, match) => {
        match = match.trim()
        let currentKey
        let result = ''
        if (prev !== '`') {
          //对于普通字符串的替换
          currentKey = getKey(match, file)
          result = `this.$t('${currentKey}')`
        } else {
          //对于 `` 拼接字符串的替换
          let matchIndex = 0
          let matchArr: string[] = []
          // 针对 `${name}`
          match = match.replace(
            /(\${)([^{}]+)(})/gim,
            (_: string, prev: string, match: string) => {
              matchArr.push(match)
              return `{${matchIndex++}}`
            }
          )
          currentKey = getKey(match, file)
          if (!matchArr.length) {
            result = `this.$t('${currentKey}')`
          } else {
            result = `this.$t('${currentKey}', [${matchArr.toString()}])`
          }
        }
        replaceSuccess && replaceSuccess({ currentKey, match })
        return result
      }
    )
    // 换回注释 和 require
    return match.replace(/\/\*comment_\d+\*\//gim, (match) => {
      return comments[match]
    })
  })
}

/**
 * 替换 js/ts 中的中文
 * @param param0
 * @returns
 */
export function replaceJavaScript({
  content,
  file,
  getKey,
  replaceSuccess
}: ReplaceProps) {
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
      _p3: any,
      offset: number,
      str: string[]
    ) => {
      //排除掉url协议部分
      if (offset > 0 && str[offset - 1] === ':') return match
      let commentsKey = `/*comment_${commentsIndex++}*/`
      comments[commentsKey] = match
      return commentsKey
    }
  )
  content = content.replace(
    /(['"`])(((?!\1).)*[\u4e00-\u9fa5]+((?!\1).)*)\1/gim,
    (_: any, prev: string, match: string) => {
      match = match.trim()
      let currentKey
      let result = ''
      if (prev !== '`') {
        //对于普通字符串的替换
        currentKey = getKey(match, file)
        result = `i18n.t('${currentKey}')`
      } else {
        //对于 `` 拼接字符串的替换
        let matchIndex = 0
        let matchArr: string[] = []
        match = match.replace(/(\${)([^{}]+)(})/gim, (_, prev, match) => {
          matchArr.push(match)
          return `{${matchIndex++}}`
        })
        currentKey = getKey(match, file)
        if (!matchArr.length) {
          result = `i18n.t('${currentKey}')`
        } else {
          result = `i18n.t('${currentKey}', [${matchArr.toString()}])`
        }
      }
      replaceSuccess && replaceSuccess({ currentKey, match })
      return result
    }
  )

  //换回注释部分
  content = content.replace(/\/\*comment_\d+\*\//gim, (match: string) => {
    return comments[match]
  })
  return content
}

/**写入 i18n index 文件  */
export function writeIndexFile(i18nDir: string, config: Config) {
  const exist = fs.existsSync(i18nDir)
  if (!exist) {
    errorlog(`文件夹${i18nDir}不存在`)
    successlog(`自动为你创建文件夹${i18nDir}`)
    fs.mkdirSync(i18nDir)
  }
  const file = path.join(i18nDir, `index.js`)
  if (fs.existsSync(file)) return
  fs.writeFileSync(
    file,
    `import VueI18n from 'vue-i18n'\nimport Vue from 'vue'\nimport zh from './${config.filename}.json'\n\n` +
      `Vue.use(VueI18n)\n\nexport default new VueI18n({\n\tlocale: 'zh',\n\tmessages: {\n\t\tzh \n\t}\n})\n`,
    'utf8'
  )
}