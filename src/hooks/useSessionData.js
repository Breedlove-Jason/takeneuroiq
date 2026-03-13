import { useEffect, useMemo, useState } from 'react';
import {
  getSessions,
  getLeaderboardSessions,
  clearSessions,
} from '../game/sessionTracker';

export function useSessionData() {
  const [sessions, setSessions] = useState(() => [...getSessions()]);

  useEffect(() => {
    const handleSessionsUpdated = () => {
      setSessions([...getSessions()]);
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
    setSessions([...getSessions()]);
  };

  return {
    sessions,
    leaderboardData,
    resetSessions,
    refreshSessions,
  };
}
