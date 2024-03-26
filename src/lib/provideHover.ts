import * as vscode from 'vscode'
import { hover } from '../utils/vscode'
import CONST from '../core/const'
import { getCustomSetting, getHoverMsg } from '../utils/index'
import { dollarTRegexp } from '../utils/regexp'

const path = require('path')

/**
 * 提示
 * @param document
 * @param position
 * @returns
 */
export function provideHover(
  document: vscode.TextDocument,
  position: vscode.Position
  // token: vscode.CancellationToken
): vscode.ProviderResult<vscode.Hover> {
  // const lineNum = position.line // 行数
  // const lineText = document.lineAt(lineNum).text; // 行文本

  const { fsPath } = document.uri
  const { outdir, projectDirname } = getCustomSetting(fsPath, CONST.CustomSettingFileName)
  if (outdir && projectDirname) {
    const matchPosition = document.getWordRangeAtPosition(position, dollarTRegexp)
    if (matchPosition) {
      const i18nKey = document.getText(matchPosition)
      const msg = getHoverMsg(path.join(projectDirname, outdir), i18nKey)
      return new hover(msg)
    }
  }
}
