import * as vscode from 'vscode'
import { getEditor } from '../utils/index'

const fs = require('fs')
const path = require('path')

export default function ({
  editor,
  context
}: {
  editor?: vscode.TextEditor
  context: vscode.ExtensionContext
}) {
  let currentEditor = getEditor(editor);
  console.log(currentEditor)
	if (!currentEditor) return;
  const filePath = currentEditor.document.fileName
  path.extname(filePath).toLowerCase() === '.vue'
        ? generateVueFile(filePath)
        :  generateJsFile(filePath)
  return {}
}


function generateVueFile(file: string) {
  // 读取文件
  let content = fs.readFileSync(file, 'utf8')
  console.log(content)
  // template 替换
  content = replaceVueTemplate(content, file)

  // 替换script中的部分
  content = replaceVueScript(content, file)

  successlog(`${file} 成功写入`)

  fs.writeFileSync(file, content, 'utf-8')
}

function generateJsFile(file: string) {
  let content = fs.readFileSync(file, 'utf8')
  //判断是否已经引入了 i18n， 若没有引入，则在文件头部引入
  let i18nMatch = content.match(
    /(import[\s\t]+i18n[\s\t]+from.+['"].+['"];?)|((let|var|const)[\s\t]+i18n[\s\t]+\=[\s\t]+require\(['"].+['"]\)[\s\t]*;?)/m
  )
    return
  // if (!i18nMatch) {
  //   const i18n = path
  //     .relative(path.dirname(file), VueI18nInstance.getConfig().outdir)
  //     .replace(/\\/g, '/')

  //   content = `import i18n from '${
  //     i18n[0] === '.' ? i18n + '/index.js' : './' + i18n + '/index.js'
  //   }';\n${content}`
  // }

  // //替换注释部分
  // let comments: Record<string, string> = {}
  // let commentsIndex = 0
  // content = content.replace(
  //   // /(\/\*([^\*\/]*|.|\n|\r)*\*\/)|(\/\/.*)/gim,
  //   /(\/\*(?:(?!\*\/).|[\n\r])*\*\/)|(\/\/.*)/gim,
  //   (
  //     match: string,
  //     _p1: any,
  //     _p2: any,
  //     _p3: any,
  //     offset: number,
  //     str: string[]
  //   ) => {
  //     //排除掉url协议部分
  //     if (offset > 0 && str[offset - 1] === ':') return match
  //     let commentsKey = `/*comment_${commentsIndex++}*/`
  //     comments[commentsKey] = match
  //     return commentsKey
  //   }
  // )
  // content = content.replace(
  //   /(['"`])(((?!\1).)*[\u4e00-\u9fa5]+((?!\1).)*)\1/gim,
  //   (_: any, prev: string, match: string) => {
  //     match = match.trim()
  //     let currentKey
  //     let result = ''
  //     if (prev !== '`') {
  //       //对于普通字符串的替换
  //       currentKey = VueI18nInstance.getCurrentKey(match, file)
  //       result = `i18n.t('${currentKey}')`
  //     } else {
  //       //对于 `` 拼接字符串的替换
  //       let matchIndex = 0
  //       let matchArr: string[] = []
  //       match = match.replace(/(\${)([^{}]+)(})/gim, (_, prev, match) => {
  //         matchArr.push(match)
  //         return `{${matchIndex++}}`
  //       })
  //       currentKey = VueI18nInstance.getCurrentKey(match, file)
  //       if (!matchArr.length) {
  //         result = `i18n.t('${currentKey}')`
  //       } else {
  //         result = `i18n.t('${currentKey}', [${matchArr.toString()}])`
  //       }
  //     }
  //     VueI18nInstance.setMessageItem(currentKey, match)
  //     VueI18nInstance.setMessagesHashItem(match, currentKey)
  //     return result
  //   }
  // )

  // //换回注释部分
  // content = content.replace(/\/\*comment_\d+\*\//gim, (match: string) => {
  //   return comments[match]
  // })

  // successlog(`${file} 成功写入`)

  // fs.writeFileSync(file, content, 'utf-8')
}