import * as ts from 'typescript';
import * as vscode from 'vscode';

import { ObjectKeys, TypedOmit } from './TypeMap';
import { config } from './workspaceConfig';

type TextWithRange = {
  text: string;
  range: vscode.Range;
}
type TestEachTemplateLiteralInfo = {
  indent: string;
  templateLiteral: TextWithRange;
  eachFuncFirstParam: TextWithRange;
  eachFuncSecondParamFuncArgs: TextWithRange;
}
type TestEachTemplateLiteralInfoList = TestEachTemplateLiteralInfo[]
type FormattedTestEachTemplateLiteralInfoList = TypedOmit<TestEachTemplateLiteralInfo, 'indent'>[];

export async function formatTestEach(): Promise<void> {

  const editor = vscode.window.activeTextEditor;
  const isJSorTS = editor && ['typescript', 'javascript'].includes(editor.document.languageId);
  if(!editor || !isJSorTS) {

    // do nothing
    config.outputChannel.appendLine('no editor or not JavaScript or not TypeScript.');
    return;
  }

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
  const formattedInfoList = getFormattedTemplateLiteralList(testEachTemplateLiteralInfoList);

  // if all test.each template literals are already matched, do nothing.
  if(formattedInfoList.length === 0) {
    config.outputChannel.appendLine('All test.each is already matched');
    return;
  }

  // replace with formatted template literal
  await editor.edit(editBuilder => {
    for(const formatted of formattedInfoList) {
      for(const testEachInfo of ObjectKeys(formatted)) {
        editBuilder.replace(formatted[testEachInfo].range, formatted[testEachInfo].text);
      }
    }
  });
  config.outputChannel.appendLine('formatted!');
}

export function getTestEachTemplateLiteralInfoList(sourceFile: ts.SourceFile): TestEachTemplateLiteralInfoList {
  const testEachTemplateLiteralInfoList: TestEachTemplateLiteralInfoList = [];

  // walk ts node tree to find test each template literal
  ts.forEachChild(sourceFile, function visit(node) {
    const isEachTemplateLiteralCallExpression =
      ts.isCallExpression(node) &&
      ts.isTaggedTemplateExpression(node.expression) &&
      ts.isPropertyAccessExpression(node.expression.tag) &&
      node.expression.tag.name.escapedText === 'each';

    if(isEachTemplateLiteralCallExpression) {
      const eachFuncFirstParam = node.arguments[0];
      if(!(ts.isStringLiteral(eachFuncFirstParam) || ts.isTemplateExpression(eachFuncFirstParam))) {
        throw new Error('Each func first param must be a string or a template literal.');
      }
      const eachFuncSecondParam = node.arguments[1];
      const isEachFuncSecondParamFunc = (
        ts.isArrowFunction(eachFuncSecondParam) ||
        ts.isFunctionDeclaration(eachFuncSecondParam) ||
        ts.isFunctionExpression(eachFuncSecondParam)) &&
        eachFuncSecondParam.parameters.length === 1;
      if(!isEachFuncSecondParamFunc) {
        throw new Error('Each func second param must be a function and must have one argument.');
      }

      const indentSize = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).character;
      const templateLiteral = node.expression.template;

      const getTextAndRangeCurried = getTextAndRange(sourceFile);

      // add test each template literal
      testEachTemplateLiteralInfoList.push({
        indent                     : ' '.repeat(indentSize),
        templateLiteral            : getTextAndRangeCurried(templateLiteral),
        eachFuncFirstParam         : getTextAndRangeCurried(eachFuncFirstParam),
        eachFuncSecondParamFuncArgs: getTextAndRangeCurried(eachFuncSecondParam.parameters[0])
      });
    } else {
      ts.forEachChild(node, visit);
    }
  });

  return testEachTemplateLiteralInfoList;
}

const getTextAndRange = (sourceFile: ts.SourceFile) => (node: ts.Node): TextWithRange => {
  const templateLiteralStart = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  const templateLiteralEnd = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
  const vscPosStart = new vscode.Position(templateLiteralStart.line, templateLiteralStart.character);
  const vscPosEnd = new vscode.Position(templateLiteralEnd.line, templateLiteralEnd.character);
  const range = new vscode.Range(vscPosStart, vscPosEnd);

  return {
    text : node.getText(sourceFile),
    range: range
  };
};

export function getFormattedTemplateLiteralList(
  testEachTemplateLiteralInfoList: TestEachTemplateLiteralInfoList
): FormattedTestEachTemplateLiteralInfoList {
  const formattedList: FormattedTestEachTemplateLiteralInfoList = [];

  for(const testEachTemplateLiteralInfo of testEachTemplateLiteralInfoList) {
    const { indent, templateLiteral, eachFuncFirstParam, eachFuncSecondParamFuncArgs } = testEachTemplateLiteralInfo;
    
    const formattedTemplateLiteralText = formatTemplateLiteralText(indent, templateLiteral.text);

    // TODO: 関数化
    if(templateLiteral.text === formattedTemplateLiteralText) {
      continue;
    }

    formattedList.push({
      templateLiteral            : { text: formattedTemplateLiteralText, range: templateLiteral.range },
      eachFuncFirstParam         : eachFuncFirstParam,
      eachFuncSecondParamFuncArgs: eachFuncSecondParamFuncArgs
    });
  }

  return formattedList;
}

/**
 * Count the number of characters in a Japanese string as 2
 */
function countLenOfStrContainingJa(str: string): number {
  const patternJa = /[^\u0020-\u007F]/g;
  const countJa = str.match(patternJa)?.length ?? 0;
  const calculatedLenJa = Math.floor(countJa * (1 / (config.characterWidth) - 1));
  return str.length + calculatedLenJa;
}

function formatTemplateLiteralText(indent: string, templateLiteralText: string): string {

  // make table for each cells
  const table = templateLiteralText
    .split('\n') // to rows
    .map(line => line.split('|')); // to columns

  // get max column width of each row
  const maxColumnWidths = table.reduce((acc, row) => {
    row.forEach((cell, i) => {
      acc[i] = Math.max(acc[i] || 0, countLenOfStrContainingJa(cell.trim()));
    });
    return acc;
  }, [] as number[]);

  // format
  const formattedTemplateLiteralText = table.reduce((acc, row, currRowIndex): string => {
    row.forEach((cell, i) => {
      const cellWidth = countLenOfStrContainingJa(cell.trim());
      const padding = ' '.repeat(maxColumnWidths[i] - cellWidth);
      acc += cell.trim() + padding + ' | ';
    });
    const maxRowIndex = table.length - 1;
    const newLine = currRowIndex !== maxRowIndex ? '\n' : '';
    const rowCutLastSeparator = acc.slice(0, - ' | '.length);

    return rowCutLastSeparator + newLine + indent;
  }, '').trim();

  return formattedTemplateLiteralText;
}
