import * as vscode from 'vscode';

/**悬浮提示 */
export const registerHoverProvider = vscode.languages.registerHoverProvider;
export const hover = vscode.Hover;

export const showErrorMessage = vscode.window.showErrorMessage

export const MarkdownString = vscode.MarkdownString

/**注册命令 */
export const registerCommand = vscode.commands.registerCommand 

/** vscode 窗口 */
export const window = vscode.window

/**范围 */
export const Range = vscode.Range

export const Position = vscode.Position

/**打开文件 */
export const open = vscode.window.showTextDocument
/**获取文件 */
export const file = vscode.Uri.file 

/**消息通知 */
export const msg ={
  info: vscode.window.showInformationMessage, //消息通知
  warn: vscode.window.showWarningMessage, //警告通知
  error: vscode.window.showErrorMessage, //错误通知
}

export const Selection = vscode.Selection

/**注册命令 */
export const executeCommand = vscode.commands.executeCommand
