import * as vscode from 'vscode'
import { getEditor, getCustomSetting } from '../utils/index'
import { VueI18nInstance } from '../core/i18nFile'
import { successlog } from '../utils/utils'
import { msg } from '../utils/vscode'
import recoverVueTemplate from '../core/recoverVueTemplate'
import { recoverJavaScriptFile, recoverVueScript } from '../core/recover'

const fs = require('fs-extra')
const path = require('path')
const configFile = 'vue-i18n-transform.config'

export default function ({
  editor,
  context
}: {
  editor?: vscode.TextEditor
  context: vscode.ExtensionContext
}) {
  try {
    let currentEditor = getEditor(editor)

    if (!currentEditor) {
      return
    }
    const filePath = currentEditor.document.fileName
    const options = getCustomSetting(filePath, configFile)
    VueI18nInstance.mergeConfig(options)
    path.extname(filePath).toLowerCase() === '.vue'
      ? recoverVueFile(filePath)
      : recoverJsFile(filePath)
  } catch (err: any) {
    msg.error(err.message || 'recover error!')
  }
}

/**
 * 恢复 vue 文件
 * @param file 为当前文件绝对路径
 */
function recoverVueFile(file: string) {
  // 读取文件
  let content = fs.readFileSync(file, 'utf8')
  // template 替换
  content = recoverVueTemplate(content, VueI18nInstance)

  // 替换script中的部分
  content = recoverVueScript(content, VueI18nInstance)

  successlog(`${file} 成功写入`)

  fs.writeFileSync(file, content, 'utf-8')
}

/**
 * 重写 js / ts 文件
 * @param file
 */
function recoverJsFile(file: string) {
  let content = fs.readFileSync(file, 'utf8')

  content = recoverJavaScriptFile(content, VueI18nInstance)

  successlog(`${file} 成功写入`)

  fs.writeFileSync(file, content, 'utf-8')
}
