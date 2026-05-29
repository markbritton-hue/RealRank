export function computeWeighin(fishArray, deadFishCount) {
  const validFish = fishArray.filter(w => w != null && w > 0);
  const total = validFish.reduce((sum, w) => sum + w, 0);
  const penalty = (deadFishCount || 0) * 0.25;
  const totalWeight = Math.max(0, Math.round((total - penalty) * 100) / 100);
  const bigFish = validFish.length > 0 ? Math.max(...validFish) : 0;
  return { totalWeight, bigFish };
}

export function formatWeight(lbs) {
  if (!lbs && lbs !== 0) return '—';
  return lbs.toFixed(2) + ' lbs';
}

export function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

// Build ranked array from sorted weighin list. Returns same array with added `rank` string.
// Expects array sorted by totalWeight DESC already.
export function assignRanks(sorted) {
  let rank = 1;
  let prev = null;
  let prevRank = 1;
  return sorted.map((entry, i) => {
    if (i === 0) {
      prev = entry.totalWeight;
      prevRank = 1;
      return { ...entry, rank: '1' };
    }
    if (entry.totalWeight === prev) {
      return { ...entry, rank: 'T-' + prevRank };
    }
    rank = i + 1;
    prev = entry.totalWeight;
    prevRank = rank;
    return { ...entry, rank: String(rank) };
  });
}

// Build season leaderboard from raw data.
// teams: array of team docs
// weighins: array of all weighin docs
// tournaments: array of tournament docs
// mode: 'weight' | 'points'
export function buildSeasonLeaderboard(teams, weighins, tournaments, mode = 'weight') {
  const closedTournaments = tournaments.filter(t => t.status === 'closed');
  const allTournaments = tournaments;

  const teamMap = {};
  teams.forEach(t => { teamMap[t.id] = t; });

  // Group weighins by tournamentId
  const byTournament = {};
  weighins.forEach(w => {
    if (!byTournament[w.tournamentId]) byTournament[w.tournamentId] = [];
    byTournament[w.tournamentId].push(w);
  });

  // For points mode: assign per-tournament points
  const teamPoints = {};
  teams.forEach(t => {
    teamPoints[t.id] = {
      team: t,
      totalWeight: 0,
      totalPoints: 0,
      wins: 0,
      bigFishWins: 0,
      tournamentsEntered: 0,
    };
  });

  allTournaments.forEach(tournament => {
    const tWeighins = (byTournament[tournament.id] || []).sort((a, b) => b.totalWeight - a.totalWeight);
    const n = tWeighins.length;

    // Find big fish for this tournament
    const maxBigFish = tWeighins.reduce((max, w) => Math.max(max, w.bigFish || 0), 0);

    tWeighins.forEach((w, idx) => {
      if (!teamPoints[w.teamId]) return;
      teamPoints[w.teamId].totalWeight += w.totalWeight || 0;
      teamPoints[w.teamId].tournamentsEntered += 1;

      // Points: handle ties (share points)
      let pts = n - idx;
      // Check for tie with previous
      if (idx > 0 && tWeighins[idx - 1].totalWeight === w.totalWeight) {
        // Share points with tied teams — simplified: give same points as the first tied entry
        pts = n - tWeighins.findIndex(x => x.totalWeight === w.totalWeight);
      }
      teamPoints[w.teamId].totalPoints += pts;

      if (idx === 0 || (tWeighins[0].totalWeight === w.totalWeight)) {
        // Win or tie for 1st
        if (tWeighins[0].totalWeight === w.totalWeight) teamPoints[w.teamId].wins += 1;
      }

      if (maxBigFish > 0 && w.bigFish === maxBigFish) {
        teamPoints[w.teamId].bigFishWins += 1;
      }
    });
  });

  const list = Object.values(teamPoints);
  const sortKey = mode === 'points' ? 'totalPoints' : 'totalWeight';
  list.sort((a, b) => {
    if (b[sortKey] !== a[sortKey]) return b[sortKey] - a[sortKey];
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.bigFishWins - a.bigFishWins;
  });

  // Assign ranks
  let rank = 1;
  let prevVal = null;
  let prevRankLabel = '1';
  return list.map((entry, i) => {
    const val = entry[sortKey];
    let rankLabel;
    if (i === 0) {
      rankLabel = '1';
    } else if (val === prevVal) {
      rankLabel = 'T-' + prevRankLabel.replace('T-', '');
    } else {
      rankLabel = String(i + 1);
      prevRankLabel = rankLabel;
    }
    prevVal = val;
    return { ...entry, rank: rankLabel };
  });
}
