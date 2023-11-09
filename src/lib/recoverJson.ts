import * as vscode from 'vscode'
import { getEditor, getCustomSetting } from '../utils/index'
import { Config, VueI18nInstance } from './i18nFile'
import { errorlog, successlog } from '../utils/utils'
import { msg } from '../utils/vscode'

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
  let currentEditor = getEditor(editor);

	if (!currentEditor) return;
  const filePath = currentEditor.document.fileName

  const options = getCustomSetting(filePath, configFile)
  VueI18nInstance.mergeConfig(options)
  // 获取语言包对象
  const data = getI18nObj()
  path.extname(filePath).toLowerCase() === '.vue'
        ? recoverVueFile(filePath, data)
        :  recoverJsFile(filePath, data)
}

/**
 * 获取i18n语言包
 * @returns 
 */
function getI18nObj() {
  const config = VueI18nInstance.getConfig()
  // @ts-ignore
  const i18nDir = path.join(config.projectDirname, config.outdir)
  const i18nFile = path.join(i18nDir, `${config.filename}.json`)
  
  if (fs.existsSync(i18nFile)) {
    const data = fs.readFileSync(i18nFile)
    const i18nObj = !!data.toString() ? JSON.parse(data.toString()) : {}
    return i18nObj
  } else {
    msg.error(`无法找到文件：${config.filename}.json`)
  }
}

/**
 * 替换 vue 中的 template
 * @param content 文本
 * @param langObj 文件路径
 * @returns
 */
function replaceVueTemplate(content: string, langObj: any) {
  return content.replace(/<template(.|\n|\r)*template>/gim, (templateText: string) => {
    // ({{\s?\$t\(.*\)\s?}})|(\$t\(.*\)) 匹配 {{ $t('xxx') }} 或 :title="$t('xxx')"
    return templateText.replace(
      /({{\s*\$t\(.+\)\s*}})|(:\S+=\"\$t\(\S+\)\")/g,
      (targetText: string) => {
        targetText = targetText.trim()
        let result = ''
        // @ts-ignore
        const currentKey = targetText.match(/'.*'/)[0].replace(/'/g, "")
        const cnText = langObj[currentKey]
        if (/^:/.test(targetText)) {
          // 如果是以 : 开头，说明是属性里的翻译文本
          result = targetText.replace(/\$t\(.*\)/g, cnText).slice(1)
        } else if ((/\[.*\]/.test(targetText)) && (/\{.*\}/.test(cnText))) {
          // 带有[]变量（标签内有可能会有变量）,例如{{ $t('xxx', [ i+1 ]) }}
          // 并且翻译的中文带有 { i+1 }
          const before = cnText.split('{')[0]
          const after = cnText.split('}')[1]
          const val = targetText.split('[')[1].split(']')[0]
          result = before + '{{' + val + '}}' + after
        } else {
          result = cnText
        }
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
function replaceVueScript(content: string, langObj: any) {
  return content.replace(/<script(.|\n|\r)*script>/gim, (templateText: string) => {
    // 匹配 this.$t('xxx') 或 this.$t("xxx") 或 this.$t(`xxx`)
    // 或者 this => that
    return templateText.replace(
      /th(is|at)\.\$t\((['"`])((?!\2).)*\2\)/g,
      (targetText: string) => {
        targetText = targetText.trim()
        let result = ''
        // @ts-ignore
        const currentKey = targetText.match(/(['"`])((?!\1).*)\1/g)[0].replace(/['"`]/g, "")
        const cnText = langObj[currentKey]
        result = `'` + cnText + `'`
        return result
      }
    )
  })
}

/**
 * 恢复 vue 文件
 * @param file 为当前文件绝对路径
 */
function recoverVueFile(file: string, langObj: any) {
  // 读取文件
  let content = fs.readFileSync(file, 'utf8')
  // template 替换
  content = replaceVueTemplate(content, langObj)

  // 替换script中的部分
  content = replaceVueScript(content, langObj)

  successlog(`${file} 成功写入`)

  fs.writeFileSync(file, content, 'utf-8')

}

/**
 * 重写 js / ts 文件
 * @param file
 */
function recoverJsFile(file: string, langObj: any) {
  let content = fs.readFileSync(file, 'utf8')

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
  // 删除文件头部 import i18n from './locales/index.js';
  content = content.replace(/(import[\s\t]+i18n[\s\t]+from.+['"].+['"];?\n)|((let|var|const)[\s\t]+i18n[\s\t]+\=[\s\t]+require\(['"].+['"]\)[\s\t]*;?)\n/m, (match: string) => {
    return ''
  })

  content = content.replace(/i18n\.t\(([`'"])((?!\1).)*\1\)/gim, (matchString: string) => {
    // @ts-ignore
    const currentKey = matchString.match(/i18n\.t\(([`'"])((?!\1).*)\1\)/)[2]
    if (currentKey) {
      const cnText = langObj[currentKey]
      if (cnText) {
        return `'` + cnText + `'`
      }
      msg.error(`语言包无法找到key=${currentKey}`)
    } else {
      msg.error(`‘${matchString}’ 无法匹配出key值`)
    }
    return matchString
  })


  //换回注释部分
  content = content.replace(/\/\*comment_\d+\*\//gim, (match: string) => {
    return comments[match]
  })

  successlog(`${file} 成功写入`)

  fs.writeFileSync(file, content, 'utf-8')
}
