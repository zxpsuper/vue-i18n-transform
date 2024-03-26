import * as vscode from 'vscode'
import { getEditor, getCustomSetting } from '../utils/index'
import { Config, VueI18nInstance } from '../core/i18nFile'
import { errorlog, successlog } from '../utils/utils'
import { msg } from '../utils/vscode'
import replaceVueTemplate from '../core/replaceVueTemplate'
import { replaceJavaScriptFile, replaceVueScript } from '../core/transform'
import CONST from '../core/const'
const fs = require('fs-extra')
const path = require('path')
const configFile = CONST.CustomSettingFileName

export default function ({
  editor,
  context
}: {
  editor?: vscode.TextEditor
  context: vscode.ExtensionContext
}) {
  let currentEditor = getEditor(editor)

  if (!currentEditor) {
    return
  }
  const filePath = currentEditor.document.fileName

  const options = getCustomSetting(filePath, configFile)
  VueI18nInstance.mergeConfig(options)
  // 初始化文件
  initFile()
  path.extname(filePath).toLowerCase() === '.vue'
    ? generateVueFile(filePath)
    : generateJsFile(filePath)

  writeI18nFile()
}

/**写入 i18n json 文件 */
function writeI18nFile() {
  const config = VueI18nInstance.getConfig()
  const message = VueI18nInstance.getMessage()
  // @ts-ignore
  const outdir = path.join(config.projectDirname, config.outdir || '')
  const filepath = path.join(outdir, config.filename + '.json')
  // filepath 为完整 path
  fs.writeFileSync(filepath, JSON.stringify(message, null, '\t'), 'utf8')
}

/**初始化文件 */
function initFile() {
  const config = VueI18nInstance.getConfig()
  // @ts-ignore
  const i18nDir = path.join(config.projectDirname, config.outdir)
  const i18nFile = path.join(i18nDir, `${config.filename}.json`)
  writeIndexFile(i18nDir, config)

  if (fs.existsSync(i18nFile)) {
    const data = fs.readFileSync(i18nFile)
    const i18nObj = !!data.toString() ? JSON.parse(data.toString()) : {}
    try {
      VueI18nInstance.deleteMessages()
      VueI18nInstance.setMessage(i18nObj)
    } catch (e: any) {
      return errorlog(e.message || 'setMessage error')
    }
  } else {
    VueI18nInstance.setMessage({})
  }
  VueI18nInstance.initIndex()
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
  if (fs.existsSync(file)) {
    return
  }
  fs.writeFileSync(
    file,
    `import VueI18n from 'vue-i18n'\nimport Vue from 'vue'\nimport zh from './${config.filename}.json'\n\n` +
      `Vue.use(VueI18n)\n\nexport default new VueI18n({\n\tlocale: 'zh',\n\tmessages: {\n\t\tzh \n\t}\n})\n`,
    'utf8'
  )
}

/**
 * 重写 vue 文件
 * @param file 为当前文件绝对路径
 */
function generateVueFile(file: string) {
  // 读取文件
  let content = fs.readFileSync(file, 'utf8')
  // template 替换
  content = replaceVueTemplate(
    content,
    file,
    VueI18nInstance,
    msg
  )
  // 替换script中的部分
  content = replaceVueScript(
    content,
    file,
    VueI18nInstance,
    msg
  )
  successlog(`${file} 成功写入`)
  fs.writeFileSync(file, content, 'utf-8')
}

/**
 * 重写 js / ts 文件
 * @param file
 */
function generateJsFile(file: string) {
  let content = fs.readFileSync(file, 'utf8')
  content = replaceJavaScriptFile(
    content,
    file,
    VueI18nInstance,
    msg
  )
  successlog(`${file} 成功写入`)
  fs.writeFileSync(file, content, 'utf-8')
}
