import * as vscode from 'vscode'
import CONST from './const'
import {
  showErrorMessage,
  MarkdownString,
  Range,
  Position,
  file,
  open,
  window
} from './vscode'
import { VueI18nInstance } from '../lib/i18nFile'

const parse = require('json-to-ast')
const path = require('path')
const fs = require('fs')
const validator = require('validator')
const flatten = require("flat");

/**打开文件默认配置 */
const defaultOption = {
  selection: new Range(new Position(0, 0), new Position(0, 0)),
  preview: false
}
/**
 * 获取用户设置 vue-i18n-transform.config.js / vue-i18n-transform.config.json
 * @param fsPath
 * @param customConfigFileName
 * @param forceIgnoreCustomSetting
 * @returns
 */
export function getCustomSetting(
  fsPath: string,
  customConfigFileName: string,
  forceIgnoreCustomSetting = false
): any {
  const dirName = path.dirname(fsPath)

  if (fs.existsSync(path.join(dirName, CONST.pkgFileName))) {
    const customPath = path.join(dirName, customConfigFileName + '.js')
    const customJSONPath = path.join(dirName, customConfigFileName + '.json')
    const fileExist = fs.existsSync(customPath) || fs.existsSync(customJSONPath)

    const data =
      fileExist && !forceIgnoreCustomSetting ? fs.readFileSync(customPath) : ''

    if (data === '') return VueI18nInstance.getConfig()
    let customSetting = validator.isJSON(data.toString())
      ? JSON.parse(data.toString())
      : eval(data.toString())
    if (
      fileExist &&
      !forceIgnoreCustomSetting &&
      fs.existsSync(customJSONPath) &&
      !validator.isJSON(data.toString())
    ) {
      showErrorMessage('json 配置文件格式错误')
      return {}
    } else {
      return {
        projectDirname: dirName,
        ...customSetting
      }
    }
  } else {
    return getCustomSetting(
      dirName,
      customConfigFileName,
      forceIgnoreCustomSetting
    )
  }
}

/**
 * 获取悬浮提示文本
 * @param dirname i18n输出文件夹
 * @param key i18n key
 * @returns 
 */
export function getHoverMsg(dirname: string, key: string) {
  if (fs.existsSync(dirname)) {
    const localesArr: string[] = fs.readdirSync(dirname)
    let msgArr: string[] = []
    localesArr.forEach((item) => {
      if (/\.json$/g.test(item)) {
        const itemPath = path.join(dirname, item)
        const data = fs.readFileSync(itemPath)
        const langName = path.basename(item, '.json')
        const i18nObj = !!data.toString() ? JSON.parse(data.toString()) : {}
        // 展开
        const localeObj = flatten(i18nObj)

        // 打开文件
        const name = `[\`${langName}\`](command:${CONST.command.openFile
          }?${encodeURIComponent(
            JSON.stringify({
              fPath: itemPath
            })
          )} "Open '${item}'")`

        // 打开文件及当前key行数
        const link = localeObj[key]
          ? `[${localeObj[key]}](command:${CONST.command.openFile
          }?${encodeURIComponent(
            JSON.stringify({
              fPath: itemPath,
              key
            })
          )} "Show In '${item}'")`
          : 'undefined'

        const current = `* _${name}_&nbsp;&nbsp;${link}\n`

        msgArr.push(current)
      }
    })
    const message = msgArr.join('')
    const markdown = new MarkdownString(message)
    markdown.isTrusted = true

    return markdown
  }

  return ''
}

/**
 * 根据路径打开文件
 * @param fPath
 * @param option
 * @returns
 */
export function openFileByPath(fPath: string, option?: any) {
  return open(file(fPath), option || defaultOption)
}

/**根据一级 key 找寻 ast 对象*/
const find = (ast: any, key: string) =>
  ast.children && ast.children.find((m: any) => m.key && m.key.value === key) // return match

/**
 * 根据 key 获取其 ast 对象，可以获取到行数据
 * @param str 
 * @param keys 
 * @param wholeMatch 
 * @returns 
 */
export function jsonAST(str: string, keys: string[], wholeMatch = false): any {
  const ast = parse(str)
  if (wholeMatch) {
    // 针对 一级 key 返回对应的对象
    return find(ast, keys[0]);
  }
  // 多级 key 则遍历寻找到该 key
  let result = ast
  keys.forEach((v) => {
    const item = find(result, v)
    if (item) {
      switch (item.type) {
        case 'Object':
          result = item
          break
        case 'Property':
          result = item.value
          break
        default:
          break
      }
    }
  })
  return result
}

/**
 * 获取当前编辑
 * @param editor 
 * @returns 
 */
export const getEditor = (editor: vscode.TextEditor | undefined) => {
  let currentEditor = editor || window.activeTextEditor;
  const stopFlag =
    !currentEditor || !CONST.langArray.includes(currentEditor.document.languageId);
  if (stopFlag) return false;
  return currentEditor;
};