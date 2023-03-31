import * as ts from 'typescript';
import * as vscode from 'vscode';

import { config } from './workspaceConfig';

type TestEachTemplateLiteralInfo = {
  indent: string;
  templateLiteral: ts.TemplateLiteral;
  eachFuncFirstParam: ts.StringLiteral | ts.TemplateExpression;
  eachFuncSecondParamFuncArgs: ts.NodeArray<ts.ParameterDeclaration>
}

type TestEachTemplateLiteralInfoList = TestEachTemplateLiteralInfo[]

type FormattedDataList = {
  isMatch: boolean;
  text: string;
  range: vscode.Range;
}[]

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
      const isEachFuncSecondParamFuncArgsParameter =
        ts.isArrowFunction(eachFuncSecondParam) ||
        ts.isFunctionDeclaration(eachFuncSecondParam) ||
        ts.isFunctionExpression(eachFuncSecondParam);
      if(!isEachFuncSecondParamFuncArgsParameter) {
        throw new Error('Each func second param must be a parameter');
      }

      const indentSize = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).character;

      // add test each template literal
      testEachTemplateLiteralInfoList.push({
        indent                     : ' '.repeat(indentSize),
        templateLiteral            : node.expression.template,
        eachFuncFirstParam         : eachFuncFirstParam,
        eachFuncSecondParamFuncArgs: eachFuncSecondParam.parameters
      });
    } else {
      ts.forEachChild(node, visit);
    }
  });

  return testEachTemplateLiteralInfoList;
}

export function getFormattedTemplateLiteralList(
  sourceFile: ts.SourceFile,
  testEachTemplateLiteralInfoList: TestEachTemplateLiteralInfoList
): FormattedDataList {
  const formattedList: FormattedDataList = [];
  for(const testEachTemplateLiteralInfo of testEachTemplateLiteralInfoList) {
    const { indent, templateLiteral } = testEachTemplateLiteralInfo;
    const templateLiteralText = templateLiteral.getText(sourceFile);

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
      const newLine = currRowIndex !== table.length - 1 ? '\n' : '';
      const rowCutLastSeparator = acc.slice(0, - ' | '.length);

      return rowCutLastSeparator + newLine + indent;
    }, '').trim();

    const posStart = sourceFile.getLineAndCharacterOfPosition(templateLiteral.getStart(sourceFile));
    const posEnd = sourceFile.getLineAndCharacterOfPosition(templateLiteral.getEnd());
    const vscPosStart = new vscode.Position(posStart.line, posStart.character);
    const vscPosEnd = new vscode.Position(posEnd.line, posEnd.character);
    const range = new vscode.Range(vscPosStart, vscPosEnd);

    formattedList.push({
      isMatch: templateLiteralText === formattedTemplateLiteralText,
      text   : formattedTemplateLiteralText,
      range  : range
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
