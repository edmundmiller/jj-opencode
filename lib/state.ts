/**
 * Session state management for jj-opencode plugin
 */

export interface SessionState {
  gateUnlocked: boolean
  changeId: string | null
  changeDescription: string
  parentSessionId?: string
  isJJRepo: boolean
  modifiedFiles: string[]
  bookmark: string | null
  workspace: string
  workspacePath: string
}

const sessionState = new Map<string, SessionState>()

export function createState(sessionId: string, initial: Partial<SessionState> = {}): SessionState {
  const state: SessionState = {
    gateUnlocked: false,
    changeId: null,
    changeDescription: '',
    isJJRepo: true,
    modifiedFiles: [],
    bookmark: null,
    workspace: 'default',
    workspacePath: '',
    ...initial,
  }
  sessionState.set(sessionId, state)
  return state
}

export function getState(sessionId: string): SessionState | undefined {
  return sessionState.get(sessionId)
}

export function setState(sessionId: string, updates: Partial<SessionState>): SessionState {
  const existing = sessionState.get(sessionId)
  if (!existing) {
    return createState(sessionId, updates)
  }
  const updated = { ...existing, ...updates }
  sessionState.set(sessionId, updated)
  return updated
}

export function deleteState(sessionId: string): void {
  sessionState.delete(sessionId)
}

export function inheritParentState(sessionId: string, parentId: string): SessionState | undefined {
  const parentState = sessionState.get(parentId)
  if (!parentState) {
    return undefined
  }
  
  const childState: SessionState = {
    ...parentState,
    parentSessionId: parentId,
    modifiedFiles: [], // Fresh list for child
  }
  sessionState.set(sessionId, childState)
  return childState
}

export function hasState(sessionId: string): boolean {
  return sessionState.has(sessionId)
}

export function getAllSessions(): string[] {
  return Array.from(sessionState.keys())
}
