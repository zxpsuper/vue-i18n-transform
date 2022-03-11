import CONST from './const'
import { showErrorMessage } from './vscode'
const path = require('path')
const fs = require('fs')
const validator = require('validator')


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
      fileExist && !forceIgnoreCustomSetting
        ? fs.readFileSync(customPath)
        : ''
    if (data === '') return {}
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
    return getCustomSetting(dirName, customConfigFileName, forceIgnoreCustomSetting)
  }
}

export function getHoverMsg(dirname: string, key:string) {
  console.log(dirname, key)
  if (fs.existsSync(dirname)) {
    const data = fs.readFileSync(dirname)
    const map = validator.isJSON(data.toString()) ? JSON.parse(data.toString()) : {}
    return map[key]
  }
}