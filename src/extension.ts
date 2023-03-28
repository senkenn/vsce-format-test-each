// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as ts from 'typescript';
import * as vscode from 'vscode';

import {
  getFormattedTemplateLiteralList, getTestEachTemplateLiteralInfoList, setGlobalVariableFromConfig
} from './formatTestEach';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {

  const disposable = vscode.commands.registerCommand('vsce-format-test-each.format', async () => {

    const editor = vscode.window.activeTextEditor;
    const isJSorTS = editor && ['typescript', 'javascript'].includes(editor.document.languageId);
    if(!editor || !isJSorTS) {

      // do nothing
      return;
    }

    setGlobalVariableFromConfig();

    // get file text and create sourceFile object with TS compiler API.
    const document = editor.document;
    const sourceText = document.getText();
    const sourceFile = ts.createSourceFile(
      '', // File name is to be blank.
      sourceText,
      {
        languageVersion: ts.ScriptTarget['Latest'] // TS compiler version is latest.
      }
    );

    // get "test.each" and format
    const testEachTemplateLiteralInfoList = getTestEachTemplateLiteralInfoList(sourceFile);
    const formattedList = getFormattedTemplateLiteralList(sourceFile, testEachTemplateLiteralInfoList);

    // replace with formatted template literal
    await editor.edit(editBuilder => {
      for(const formatted of formattedList) {
        editBuilder.replace(formatted.range, formatted.text);
      }
    });
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate(): void { }
