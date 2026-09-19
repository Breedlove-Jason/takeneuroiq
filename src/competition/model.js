export function tier(rating = 1000) {
  if (rating >= 1800) return {
    name: 'Grandmaster',
    color: 'text-fuchsia-300',
    next: null
  };
  if (rating >= 1500) return {
    name: 'Diamond',
    color: 'text-cyan-300',
    next: 1800
  };
  if (rating >= 1250) return {
    name: 'Gold',
    color: 'text-amber-300',
    next: 1500
  };
  if (rating >= 1050) return {
    name: 'Silver',
    color: 'text-slate-200',
    next: 1250
  };
  return {
    name: 'Challenger',
    color: 'text-violet-300',
    next: 1050
  };
}
export function achievements(s = {}) {
  return [{
    name: 'First Contact',
    detail: 'Complete a competitive match',
    earned: s.games >= 1
  }, {
    name: 'Victory Lap',
    detail: 'Win your first duel',
    earned: s.wins >= 1
  }, {
    name: 'Flawless',
    detail: 'Answer every question correctly',
    earned: s.perfect >= 1
  }, {
    name: 'On a Roll',
    detail: 'Finish the daily challenge 3 days running',
    earned: s.daily_streak >= 3
  }, {
    name: 'Arena Regular',
    detail: 'Complete 10 competitive matches',
    earned: s.games >= 10
  }, {
    name: 'Centurion',
    detail: 'Earn 100 correct answers',
    earned: s.correct >= 100
  }];
}
export const emptyStats = {
  rating: 1000,
  xp: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  games: 0,
  correct: 0,
  answered: 0,
  perfect: 0,
  daily_streak: 0
};
export const modes = {
  ranked: 'Ranked duel',
  friend: 'Friend challenge',
  daily: 'Daily challenge'
};
