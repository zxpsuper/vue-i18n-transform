import * as vscode from 'vscode'
import { msg, Selection, executeCommand } from '../utils/vscode'
import { jsonAST } from '../utils/index' 
const validator = require('validator')

/**
 * 跳行
 * @param line 
 */
const jump = (line: number) => {
	executeCommand("cursorMove", {
		to: "right",
		by: "line",
		value: 0,
		select: true
	}).then(
		() => {
      executeCommand("revealLine", {
        at: "top",
        lineNumber: line
      })
    }
	);
};

/**
 * 文档滚动到指定的 i18n key 位置
 * @param editor 
 * @param i18nKeys 
 * @returns 
 */
export default function (editor: vscode.TextEditor, i18nKeys: string) {
	const text = editor.document.getText();
	if (!validator.isJSON(text)) {
		msg.error(`'${editor.document.fileName}'  is not a right json !`);
		return;
	}
  const keys = i18nKeys.split(".");
	if (!keys.length) return;
	const ast = jsonAST(text, keys, !!text.match(new RegExp(i18nKeys)));
	if (ast && ast.loc) {
		const { start, end } = ast.loc;
		editor.selection = new Selection(
			editor.document.positionAt(start.offset + 1),
			editor.document.positionAt(end.offset - 2)
		);
		jump(start.line - 5);
	}
}
