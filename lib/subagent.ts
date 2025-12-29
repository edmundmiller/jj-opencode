export async function getParentSessionId(client: any, sessionId: string): Promise<string | null> {
  try {
    const result = await client.session.get({ path: { id: sessionId } })
    return result.data?.parentID || null
  } catch {
    return null
  }
}

export async function isSubagentSession(client: any, sessionId: string): Promise<boolean> {
  const parentId = await getParentSessionId(client, sessionId)
  return parentId !== null
}
