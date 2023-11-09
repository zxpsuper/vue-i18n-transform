import * as vscode from 'vscode';
import hoverI18n from './hoverI18n';
import openI18n from './openI18n';
import transformI18n from './transformI18n';
import recoverI18n from './recoverI18n';

export function activate(context: vscode.ExtensionContext) {
	
	console.log('Congratulations, your extension "vue-i18n-transform" is now active!');

	hoverI18n(context); // 文本显示

	openI18n(context); // i18n 文件打开

	transformI18n(context) // i18n 转换

	recoverI18n(context) // i18n 恢复

}

export function deactivate() {}
