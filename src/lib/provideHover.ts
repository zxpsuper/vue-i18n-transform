import * as vscode from 'vscode'
import { hover } from '../utils/vscode'
import CONST from '../utils/const'
import { getCustomSetting, getHoverMsg } from '../utils/index'
import {dollarTRegexp} from '../utils/regexp'

const path = require('path')
export function provideHover(
  document: vscode.TextDocument,
  position: vscode.Position,
  token: vscode.CancellationToken
): vscode.ProviderResult<vscode.Hover> {
  const lineNum = position.line
  // const lineText = document.lineAt(lineNum).text;
  const { fsPath } = document.uri
  const  { outdir, projectDirname } = getCustomSetting(fsPath, CONST.CustomSettingFileName)
  if (outdir && projectDirname) {
    const matchPosition = document.getWordRangeAtPosition(
			position,
			dollarTRegexp
		);
    if (matchPosition) {
			const i18nKey = document.getText(matchPosition);
			const msg = getHoverMsg(path.join(projectDirname, outdir), i18nKey);
			return new hover(msg);
		}
  }
  return new hover(['你好'])
}
