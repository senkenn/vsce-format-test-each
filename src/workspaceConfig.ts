import * as vscode from 'vscode';

type Config = {
  characterWidth: number;
  formatOnSave: boolean;
}

export let config: Config;

function getConfig(): Config {
  const config = vscode.workspace.getConfiguration('formatTestEach');

  const characterWidth = config.get('characterWidth');
  if(typeof characterWidth !== 'number' ) {
    throw new Error(`characterWidth must be a number, but got ${typeof characterWidth}`);
  }
  
  const formatOnSave = config.get('formatOnSave');
  if(typeof formatOnSave !== 'boolean') {
    throw new Error(`formatOnSave must be a number, but got ${typeof formatOnSave}`);
  }

  return { characterWidth, formatOnSave};
}

export function setConfigToGlobalVariable(): void {
  config = getConfig();

  vscode.workspace.onDidChangeConfiguration(() => {
    config = getConfig();
  });
}
