import { registerCommand } from './utils/vscode'
import CONST from './core/const'
import * as vscode from 'vscode'
import { openFileByPath } from './utils'
import recoverJson from './lib/recoverJson'

export default function (context: vscode.ExtensionContext) {
  // 注册转换 i18n 文件命令
  context.subscriptions.push(
    registerCommand(CONST.command.recoverFile, (uri) => {
      if (uri && uri.path) {
        openFileByPath(uri.path).then((editor) => {
          recoverJson({ editor, context })
        })
      } else {
        recoverJson({ context })
      }
    })
  )
}
