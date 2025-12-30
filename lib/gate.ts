import { GATE_BLOCK_MESSAGE_PLANNING, GATE_BLOCK_MESSAGE_EXECUTION, NOT_JJ_REPO_MESSAGE } from './messages.js'
import * as jj from './jj.js'

type Shell = any

const EXECUTION_TOOLS = new Set([
  'write',
  'edit',
  'lsp_rename',
  'lsp_code_action_resolve',
  'ast_grep_replace',
])

export function isExecutionTool(toolName: string): boolean {
  return EXECUTION_TOOLS.has(toolName)
}

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
  'jj_undo',
  'jj_describe',
  'jj_abandon',
  'jj_workspace',
  'jj_workspaces',
  'jj_cleanup',
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

export interface GateCheckResult {
  allowed: boolean
  message?: string
  isExecution?: boolean
}

/**
 * Check if the gate allows the tool to run.
 * Queries JJ state directly - gate is unlocked if current change has a description OR modifications.
 */
export async function checkGate($: Shell, toolName: string): Promise<GateCheckResult> {
  if (isReadOnlyTool(toolName)) {
    return { allowed: true }
  }

  const isExecution = isExecutionTool(toolName)

  const isRepo = await jj.isJJRepo($)
  if (!isRepo) {
    return { allowed: false, message: NOT_JJ_REPO_MESSAGE, isExecution }
  }

  const description = await jj.getCurrentDescription($)
  const hasModifications = await jj.hasUncommittedChanges($)
  const gateUnlocked = description.length > 0 || hasModifications

  if (!gateUnlocked) {
    const message = isExecution ? GATE_BLOCK_MESSAGE_EXECUTION : GATE_BLOCK_MESSAGE_PLANNING
    return { allowed: false, message, isExecution }
  }

  return { allowed: true }
}

export function isGatedTool(toolName: string): boolean {
  return !isReadOnlyTool(toolName)
}
