const sessions = []

export function recordSession(session) {
  sessions.push(session)
}

export function getSessions() {
  return sessions
}
