import { useMemo, useState } from 'react';
import {
  getSessions,
  getLeaderboardSessions,
  clearSessions,
} from '../game/sessionTracker';

export function useSessionData() {
  const [sessions, setSessions] = useState(() => [...getSessions()]);

  const leaderboardData = useMemo(() => {
    return getLeaderboardSessions();
  }, []);

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
