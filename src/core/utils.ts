import CONST from './const'
import type { Message } from './transform'
import type VueI18n from './i18nFile'

const path = require('path')
const fs = require('fs')
const validator = require('validator')

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
  VueI18nInstance: VueI18n,
  msg?: Message,
  forceIgnoreCustomSetting = false
): any {
  const dirName = path.dirname(fsPath)
  const root = path.parse(dirName).root
  if (root === dirName) {
    return VueI18nInstance.getConfig()
  } else if (fs.existsSync(path.join(dirName, CONST.pkgFileName))) {
    const customPath = path.join(dirName, customConfigFileName + '.js')
    const customJSONPath = path.join(dirName, customConfigFileName + '.json')
    const fileExist = fs.existsSync(customPath) || fs.existsSync(customJSONPath)

    const data = fileExist && !forceIgnoreCustomSetting ? fs.readFileSync(customPath) : ''

    if (data === '') {
      return VueI18nInstance.getConfig()
    }
    let customSetting = validator.isJSON(data.toString())
      ? JSON.parse(data.toString())
      : eval(data.toString())
    if (
      fileExist &&
      !forceIgnoreCustomSetting &&
      fs.existsSync(customJSONPath) &&
      !validator.isJSON(data.toString())
    ) {
      msg?.error && msg.error('json 配置文件格式错误')
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
      VueI18nInstance,
      msg,
      forceIgnoreCustomSetting
    )
  }
}
