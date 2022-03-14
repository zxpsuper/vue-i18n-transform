import { registerCommand } from './utils/vscode'
import CONST from './utils/const'
import * as vscode from 'vscode'
import { openFileByPath } from './utils'
import transformJson from './lib/transformJson'

export default function (context: vscode.ExtensionContext) {
  // 注册转换 i18n 文件命令
  context.subscriptions.push(
    registerCommand(CONST.command.transformFile, (uri) => {
      if (uri && uri.path) {
        openFileByPath(uri.path).then((editor) => {
          transformJson({ editor, context })
        })
      } else {
        transformJson({ context })
      }
    })
  )
}
