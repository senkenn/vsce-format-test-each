import * as vscode from 'vscode';

type WorkspaceConfig = {
  characterWidth: number;
  formatOnSave: boolean;
}
type Config = WorkspaceConfig & {
  outputChannel: vscode.OutputChannel;
}

export let config: Config;

function getWorkspaceConfig(): WorkspaceConfig {
  const config = vscode.workspace.getConfiguration('formatTestEach');

  const characterWidth = config.get('characterWidth');
  if(typeof characterWidth !== 'number') {
    throw new Error(`characterWidth must be a number, but got ${typeof characterWidth}`);
  }

  const formatOnSave = config.get('formatOnSave');
  if(typeof formatOnSave !== 'boolean') {
    throw new Error(`formatOnSave must be a number, but got ${typeof formatOnSave}`);
  }

  return { characterWidth, formatOnSave };
}

/**
 * Set config to global variables.
 */
export function initAndSetEventOfGlobalConfig(): void {
  const workspaceConfig = getWorkspaceConfig();
  const outputChannel =  vscode.window.createOutputChannel('Format Test Each');
  config = { ...workspaceConfig, outputChannel };
  
  vscode.workspace.onDidChangeConfiguration(() => {
    const workspaceConfig = getWorkspaceConfig();
    config.characterWidth = workspaceConfig.characterWidth;
    config.formatOnSave = workspaceConfig.formatOnSave;
  });
}
