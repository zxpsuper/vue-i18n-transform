#!/usr/bin/env node
import { errorlog, successlog, replaceJavaScript, replaceVueScript, replaceVueTemplate, writeIndexFile } from './utils'
import { Config, VueI18nInstance } from './i18nFile'

const path = require('path')
const fs = require('fs-extra')
// replace 的用法 https://www.cnblogs.com/idiv/p/8442046.html

const configFile = 'vue-i18n-transform.config.js'


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
 * 重写 vue 文件
 * @param file 为当前文件相对路径
 */
function generateVueFile(file: string) {

  // 读取文件
  let content = fs.readFileSync(file, 'utf8')

  // template 替换
  content = replaceVueTemplate({
    content,
    file,
    getKey: VueI18nInstance.getCurrentKey.bind(VueI18nInstance),
    replaceSuccess: ({ currentKey, match }) => {
      VueI18nInstance.setMessageItem(currentKey, match)
      VueI18nInstance.setMessagesHashItem(match, currentKey)
    }
  })

  // 替换script中的部分
  content = replaceVueScript({
    content,
    file,
    getKey: VueI18nInstance.getCurrentKey.bind(VueI18nInstance),
    replaceSuccess: ({ currentKey, match }) => {
      VueI18nInstance.setMessageItem(currentKey, match)
      VueI18nInstance.setMessagesHashItem(match, currentKey)
    }
  })

  successlog(`${file} 成功写入`)

  fs.writeFileSync(file, content, 'utf-8')
}

/**
 * 重写 js / ts 文件
 * @param file
 */
function generateJsFile(file: string) {
  let content = fs.readFileSync(file, 'utf8')

  if (!content) {
    errorlog(file + ' no exist!!')
    return 
  }

  // 判断是否已经引入了 i18n， 若没有引入，则在文件头部引入
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
  
  content = replaceJavaScript({
    content,
    file,
    getKey: VueI18nInstance.getCurrentKey.bind(VueI18nInstance),
    replaceSuccess: ({ currentKey, match }) => {
      VueI18nInstance.setMessageItem(currentKey, match)
      VueI18nInstance.setMessagesHashItem(match, currentKey)
    }
  })

  successlog(`${file} 成功写入`)

  fs.writeFileSync(file, content, 'utf-8')
}

/**
 * 重写其他文件，目前不支持
 * @param file 
 */
function generateOtherFile(file: string) {
  errorlog(`文件 ${file} 不支持转化`)
}

/**转化文件 */
function generate() {
  /**项目配置 */
  let config: Config | undefined
  /**配置文件完整路径 */
  const configPath = path.join(process.cwd(), configFile)
  // 如果存在配置文件
  if (fs.existsSync(configPath)) {
    config = require(configPath)
    if (typeof config === 'object' && config.toString() === '[object Object]') {
      VueI18nInstance.mergeConfig(config, process.cwd())
      config = VueI18nInstance.getConfig()
    } else {
      return errorlog(configFile + ' 配置文件格式错误')
    }
  }

  if (config === undefined) {
    return errorlog(configFile + ' 配置文件格式错误')
  }

  initFile()
  // 文件的绝对路径
  let files: string[] = []
  if (config.single === false) {
    files = VueI18nInstance.getAllFiles(path.join(process.cwd(), config.entry))
  } else {
    files = [path.join(process.cwd(), config.entry)]
  }

  const i18nFile = path.join(
    process.cwd(),
    config?.outdir,
    `${config.filename}.js`
  )

  files.forEach((file) => {
    if (file !== i18nFile) {
      // 判断是 vue 文件还是 js/ts 文件
      path.extname(file).toLowerCase() === '.vue'
        ? generateVueFile(file)
        : ['.js', '.ts'].includes(path.extname(file).toLowerCase())
        ? generateJsFile(file)
        : generateOtherFile(file)
    }
  })

  writeI18nFile()
}

generate()
