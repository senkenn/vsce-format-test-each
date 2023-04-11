// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as vscode from 'vscode';

import { formatTestEach } from './formatTestEach';
import { config, initAndSetEventOfGlobalConfig } from './workspaceConfig';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {

  initAndSetEventOfGlobalConfig();

  // Command
  const disposable = vscode.commands.registerCommand('vsce-format-test-each.format', formatTestEach);
  context.subscriptions.push(disposable);

  // on save event
  vscode.workspace.onWillSaveTextDocument(() => {
    if(config.formatOnSave) {
      vscode.commands.executeCommand('vsce-format-test-each.format');
    }
  });
  config.outputChannel.show();
}

// This method is called when your extension is deactivated
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate(): void { }
