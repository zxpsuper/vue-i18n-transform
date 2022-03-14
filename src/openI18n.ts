import { registerCommand, window, Range, Position } from './utils/vscode';
import CONST from './utils/const'
import * as vscode from 'vscode';
import { openFileByPath } from './utils'
import scrollTo from './lib/scrollTo'


export default function (context: vscode.ExtensionContext) {
	// 注册打开 i18n 文件命令
  context.subscriptions.push(
		registerCommand(CONST.command.openFile, (args = {}) => {
			const { fPath, key } = args;
			const currentEditor = window.activeTextEditor;
			if (!currentEditor) return;
			const viewColumn = currentEditor.viewColumn || 0 + 1;
			openFileByPath(fPath, {
				selection: new Range(new Position(0, 0), new Position(0, 0)),
				preview: false,
				viewColumn,
			}).then(editor => {
				// 打开文件后滚动到目标位置
				key && scrollTo(editor, key);
			});
		})
	);
}