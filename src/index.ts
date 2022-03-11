import { errorlog, successlog, warnlog } from './utils'
import VueI18n, { Config } from './i18nFile'
const path = require('path')
const fs = require('fs-extra')
// replace 的用法 https://www.cnblogs.com/idiv/p/8442046.html

const VueI18nInstance = new VueI18n()
const configFile = 'vue-i18n-transform.config.js'

function generate() {
  /**项目配置 */
  let config: Config | undefined
  /**配置文件完整路径 */
  const configPath = path.join(process.cwd(), configFile)
  // 如果存在配置文件
  if (fs.existsSync(configPath)) {
    config = require(configPath)
    if (typeof config === 'object' && config.toString() === '[object Object]') {
      VueI18nInstance.mergeConfig(config)
      config = VueI18nInstance.getConfig()
    } else {
      return errorlog(configFile + ' 配置文件格式错误')
    }
  }

  if (config === undefined) {
    return errorlog(configFile + ' 配置文件格式错误')
  }

  initFile()
  // 文件的相对路径
  let files: string[] = []
  if (config.single === false) {
    files = VueI18nInstance.getAllFiles(config.entry)
  } else {
    files = [path.join(process.cwd(), config.entry)]
  }

  const i18nFile = path.join(config?.outdir, `${config.filename}.js`)

  files.forEach((item) => {
    if (item !== i18nFile) {
      // 判断是 vue 文件还是 js/ts 文件
      path.extname(item).toLowerCase() === '.vue'
        ? generateVueFile(item)
        : ['.js', '.ts'].includes(path.extname(item).toLowerCase())
        ? generateJsFile(item)
        : generateOtherFile(item)
    }
  })

  writeI18nFile()
}

/**写入 i18n index 文件  */
function writeIndexFile(i18nDir: string, config: Config) {
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

/**初始化文件 */
function initFile() {
  const config = VueI18nInstance.getConfig()
  const i18nDir = path.join(process.cwd(), config.outdir)
  const i18nFile = path.join(i18nDir, `${config.filename}.json`)
  writeIndexFile(i18nDir, config)
  if (
    fs.existsSync(i18nFile) &&
    require(i18nFile).toString() === '[object Object]'
  ) {
    try {
      VueI18nInstance.setMessage(require(i18nFile))
    } catch (e: any) {
      return errorlog(e.message || 'setMessage error')
    }
  } else {
    VueI18nInstance.setMessage({})
  }
  VueI18nInstance.initIndex()
}

/**写入 i18n json 文件 */
function writeI18nFile() {
  const config = VueI18nInstance.getConfig()
  const message = VueI18nInstance.getMessage()
  const outdir = path.join(process.cwd(), config.outdir || '')
  const filepath = path.join(outdir, config.filename + '.json')
  fs.writeFileSync(filepath, JSON.stringify(message, null, '\t'), 'utf8')
}

/**
 * 替换 vue 中的 template
 * @param content 文本
 * @param file 文件路径
 * @returns
 */
function replaceVueTemplate(content: string, file: string) {
  return content.replace(/<template(.|\n|\r)*template>/gim, (match: string) => {
    return match.replace(
      /((\w+-){0,}\w+=['"]|>|'|")([^'"<>]*[\u4e00-\u9fa5]+[^'"<>]*)(['"<])/gim,
      (_, prev: string, __, match: string, after: string) => {
        // 针对一些资源中含有中文名时，不做替换
        if (prev.match(/src=['"]/)) return _
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
          currentKey = VueI18nInstance.getCurrentKey(match, file)
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
          }
        }
        VueI18nInstance.setMessageItem(currentKey, match)
        VueI18nInstance.setMessagesHashItem(match, currentKey)
        return result
      }
    )
  })
}

/**
 * 替换 vue 中的 script
 * @param content 文本
 * @param file 文件路径
 * @returns
 */
function replaceVueScript(content: string, file: string) {
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
          currentKey = VueI18nInstance.getCurrentKey(match, file)
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
          currentKey = VueI18nInstance.getCurrentKey(match, file)
          if (!matchArr.length) {
            result = `this.$t('${currentKey}')`
          } else {
            result = `this.$t('${currentKey}', [${matchArr.toString()}])`
          }
        }
        VueI18nInstance.setMessageItem(currentKey, match)
        VueI18nInstance.setMessagesHashItem(match, currentKey)
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
 * 重写 vue 文件
 * @param file 为当前文件相对路径
 */
function generateVueFile(file: string) {
  // 读取文件
  let content = fs.readFileSync(file, 'utf8')

  // template 替换
  content = replaceVueTemplate(content, file)

  // 替换script中的部分
  content = replaceVueScript(content, file)

  successlog(`${file} 成功写入`)

  fs.writeFileSync(file, content, 'utf-8')
}

/**
 * 重写 js / ts 文件
 * @param file
 */
function generateJsFile(file: string) {
  let content = fs.readFileSync(file, 'utf8')
  //判断是否已经引入了 i18n， 若没有引入，则在文件头部引入
  let i18nMatch = content.match(
    /(import[\s\t]+i18n[\s\t]+from.+['"].+['"];?)|((let|var|const)[\s\t]+i18n[\s\t]+\=[\s\t]+require\(['"].+['"]\)[\s\t]*;?)/m
  )

  if (!i18nMatch) {
    const i18n = path
      .relative(path.dirname(file), VueI18nInstance.getConfig().outdir)
      .replace(/\\/g, '/')

    content = `import i18n from '${
      i18n[0] === '.' ? i18n + '/index.js' : './' + i18n + '/index.js'
    }';\n${content}`
  }

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
      VueI18nInstance.setMessagesHashItem(match, currentKey)
      return result
    }
  )

  //换回注释部分
  content = content.replace(/\/\*comment_\d+\*\//gim, (match: string) => {
    return comments[match]
  })

  successlog(`${file} 成功写入`)

  fs.writeFileSync(file, content, 'utf-8')
}

function generateOtherFile(file: string) {
  errorlog(`文件 ${file} 不支持转化`)
}

generate()
