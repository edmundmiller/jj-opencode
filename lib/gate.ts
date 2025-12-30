import { getState } from './state.js'
import { GATE_BLOCK_MESSAGE, NOT_JJ_REPO_MESSAGE } from './messages.js'

const READ_ONLY_TOOLS = new Set([
  'read',
  'glob',
  'grep',
  'lsp_hover',
  'lsp_goto_definition',
  'lsp_find_references',
  'lsp_document_symbols',
  'lsp_workspace_symbols',
  'lsp_diagnostics',
  'lsp_servers',
  'lsp_prepare_rename',
  'lsp_code_actions',
  'ast_grep_search',
  'webfetch',
  'context7_resolve-library-id',
  'context7_query-docs',
  'grep_app_searchGitHub',
  'websearch_exa_web_search_exa',
  'supermemory',
  'todoread',
  'look_at',
  'task',
  'background_task',
  'background_output',
  'background_cancel',
  'call_omo_agent',
  'interactive_bash',
  'jj',
  'jj_status',
  'jj_push',
  'jj_git_init',
  'skill',
  'slashcommand',
])

const MODIFYING_TOOLS = new Set([
  'write',
  'edit',
  'lsp_rename',
  'lsp_code_action_resolve',
  'ast_grep_replace',
  'todowrite',
])

export function isReadOnlyTool(toolName: string): boolean {
  return READ_ONLY_TOOLS.has(toolName)
}

export function isModifyingTool(toolName: string): boolean {
  return MODIFYING_TOOLS.has(toolName)
}

export function checkGate(sessionId: string, toolName: string): { allowed: boolean; message?: string } {
  if (isReadOnlyTool(toolName)) {
    return { allowed: true }
  }

  const state = getState(sessionId)

  if (!state) {
    return { allowed: false, message: GATE_BLOCK_MESSAGE }
  }

  if (!state.isJJRepo) {
    return { allowed: false, message: NOT_JJ_REPO_MESSAGE }
  }

  if (!state.gateUnlocked) {
    return { allowed: false, message: GATE_BLOCK_MESSAGE }
  }

  return { allowed: true }
}

export function isGatedTool(toolName: string): boolean {
  return !isReadOnlyTool(toolName)
}
