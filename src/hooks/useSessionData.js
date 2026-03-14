import { useEffect, useMemo, useState } from 'react';
import {
  getSessions,
  getLeaderboardSessions,
  clearSessions,
} from '../game/sessionTracker';

function normalizeSession(session) {
  const puzzlesAttempted = session.puzzlesAttempted ?? session.puzzlesSeen ?? 0;
  const puzzlesCorrect = session.puzzlesCorrect ?? session.correctAnswers ?? 0;

  return {
    ...session,
    puzzlesAttempted,
    puzzlesCorrect,
  };
}

export function useSessionData() {
  const [sessions, setSessions] = useState(() =>
    getSessions().map(normalizeSession),
  );

  useEffect(() => {
    const handleSessionsUpdated = () => {
      setSessions(getSessions().map(normalizeSession));
    };

    window.addEventListener(
      'takeneuroiq:sessions-updated',
      handleSessionsUpdated,
    );

    return () => {
      window.removeEventListener(
        'takeneuroiq:sessions-updated',
        handleSessionsUpdated,
      );
    };
  }, []);

  const leaderboardData = useMemo(() => {
    return getLeaderboardSessions(sessions);
  }, [sessions]);

  const resetSessions = () => {
    clearSessions();
    setSessions([]);
  };

  const refreshSessions = () => {
    setSessions(getSessions().map(normalizeSession));
  };

  return {
    sessions,
    leaderboardData,
    resetSessions,
    refreshSessions,
  };
}
