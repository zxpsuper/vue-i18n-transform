import { registerHoverProvider } from './utils/vscode';
import { provideHover } from './lib/provideHover';
import * as vscode from 'vscode';

export default function (context: vscode.ExtensionContext) {
  context.subscriptions.push(
    registerHoverProvider(
      [
        { scheme: 'file', language: 'vue' },
        { scheme: 'file', language: 'javascript' }
      ],
      {
        provideHover: provideHover
      }
    )
  );
}
