import type { FirstRoundMatch, Pool, Prediction } from "./types";

/** Everything the scoring helpers need — works for Pool or PublicPool. */
type Scoreable = Pick<Pool, "firstRound" | "actual">;

// Flag emoji for common nations — falls back to a neutral marker.
export const FLAGS: Record<string, string> = {
  France: "🇫🇷",
  Morocco: "🇲🇦",
  Spain: "🇪🇸",
  Belgium: "🇧🇪",
  Norway: "🇳🇴",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Argentina: "🇦🇷",
  Switzerland: "🇨🇭",
  Brazil: "🇧🇷",
  Portugal: "🇵🇹",
  Germany: "🇩🇪",
  Netherlands: "🇳🇱",
  Croatia: "🇭🇷",
  Italy: "🇮🇹",
  Uruguay: "🇺🇾",
  Colombia: "🇨🇴",
  Mexico: "🇲🇽",
  "United States": "🇺🇸",
  USA: "🇺🇸",
  Canada: "🇨🇦",
  Japan: "🇯🇵",
  "South Korea": "🇰🇷",
  Senegal: "🇸🇳",
  Ghana: "🇬🇭",
  Denmark: "🇩🇰",
  Poland: "🇵🇱",
  Serbia: "🇷🇸",
  Ecuador: "🇪🇨",
  Australia: "🇦🇺",
  Wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  Nigeria: "🇳🇬",
  Cameroon: "🇨🇲",
  "Ivory Coast": "🇨🇮",
  Peru: "🇵🇪",
  Chile: "🇨🇱",
  Sweden: "🇸🇪",
  Austria: "🇦🇹",
  Turkey: "🇹🇷",
  Egypt: "🇪🇬",
  Qatar: "🇶🇦",
  "Saudi Arabia": "🇸🇦",
  Iran: "🇮🇷",
};

export function flagFor(team: string): string {
  return FLAGS[team] ?? "🏳️";
}

/** The example bracket from the prompt — used to seed the create form. */
export const DEFAULT_FIRST_ROUND: FirstRoundMatch[] = [
  { teamA: "France", teamB: "Morocco" },
  { teamA: "Spain", teamB: "Belgium" },
  { teamA: "Norway", teamB: "England" },
  { teamA: "Argentina", teamB: "Switzerland" },
];

export function matchKey(round: number, index: number): string {
  return `${round}-${index}`;
}

/** Number of rounds for a bracket with `firstRoundMatches` opening matches. */
export function roundCount(firstRoundMatches: number): number {
  return Math.max(1, Math.round(Math.log2(firstRoundMatches)) + 1);
}

export function matchesInRound(firstRoundMatches: number, round: number): number {
  return Math.max(1, firstRoundMatches / 2 ** round);
}

/** Human label for a round given the total number of rounds. */
export function roundName(totalRounds: number, round: number): string {
  const fromEnd = totalRounds - 1 - round; // 0 = final
  if (fromEnd === 0) return "Final";
  if (fromEnd === 1) return "Semi-finals";
  if (fromEnd === 2) return "Quarter-finals";
  if (fromEnd === 3) return "Round of 16";
  if (fromEnd === 4) return "Round of 32";
  return `Round ${round + 1}`;
}

/**
 * The two teams facing off in match (round, index) for a given set of picks.
 * Round 0 comes from the fixed first-round matchups; later rounds come from the
 * predicted winners of the two feeding matches. `null` = not decided yet.
 */
export function teamsFor(
  firstRound: FirstRoundMatch[],
  picks: Record<string, string>,
  round: number,
  index: number,
): [string | null, string | null] {
  if (round === 0) {
    const m = firstRound[index];
    return [m?.teamA ?? null, m?.teamB ?? null];
  }
  return [
    picks[matchKey(round - 1, index * 2)] ?? null,
    picks[matchKey(round - 1, index * 2 + 1)] ?? null,
  ];
}

/** Every match position in the bracket, round by round. */
export function allMatches(
  firstRoundMatches: number,
): { round: number; index: number }[] {
  const rounds = roundCount(firstRoundMatches);
  const out: { round: number; index: number }[] = [];
  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < matchesInRound(firstRoundMatches, r); i++) {
      out.push({ round: r, index: i });
    }
  }
  return out;
}

/** Teams that a pick-set has advancing out of a given round. */
function advancers(
  picks: Record<string, string>,
  firstRoundMatches: number,
  round: number,
): Set<string> {
  const s = new Set<string>();
  for (let i = 0; i < matchesInRound(firstRoundMatches, round); i++) {
    const w = picks[matchKey(round, i)];
    if (w) s.add(w);
  }
  return s;
}

export interface ScoreResult {
  points: number;
  correct: number;
  /** correct advancers per round, index = round */
  perRound: number[];
  championCorrect: boolean;
  /** whether any actual results have been entered */
  scored: boolean;
}

/**
 * Score a prediction against the organiser's actual results. Later rounds are
 * worth more (round r is worth r+1 points per correct advancer), so calling the
 * champion right is the biggest prize.
 */
export function scorePrediction(pool: Scoreable, prediction: Prediction): ScoreResult {
  const n = pool.firstRound.length;
  const rounds = roundCount(n);
  const perRound: number[] = [];
  let points = 0;
  let correct = 0;
  let scored = false;

  for (let r = 0; r < rounds; r++) {
    const actualAdv = advancers(pool.actual, n, r);
    if (actualAdv.size > 0) scored = true;
    const userAdv = advancers(prediction.picks, n, r);
    let hit = 0;
    userAdv.forEach((t) => {
      if (actualAdv.has(t)) hit++;
    });
    perRound[r] = hit;
    correct += hit;
    points += hit * (r + 1);
  }

  const championKey = matchKey(rounds - 1, 0);
  const championCorrect =
    !!pool.actual[championKey] &&
    prediction.picks[championKey] === pool.actual[championKey];

  return { points, correct, perRound, championCorrect, scored };
}

/** Is a single pick correct? (team actually advanced from that round.) */
export function isPickCorrect(
  pool: Scoreable,
  round: number,
  team: string,
): boolean {
  return advancers(pool.actual, pool.firstRound.length, round).has(team);
}

/** Has the organiser entered any actual result for this round yet? */
export function roundResolved(pool: Scoreable, round: number): boolean {
  return advancers(pool.actual, pool.firstRound.length, round).size > 0;
}

/** Is `team` already knocked out according to the actual results? */
export function isEliminated(pool: Scoreable, team: string): boolean {
  const n = pool.firstRound.length;
  const rounds = roundCount(n);
  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < matchesInRound(n, r); i++) {
      const winner = pool.actual[matchKey(r, i)];
      if (!winner) continue;
      const [a, b] = teamsFor(pool.firstRound, pool.actual, r, i);
      if ((a === team || b === team) && winner !== team) return true;
    }
  }
  return false;
}

export type PredictionStatus =
  | "unscored" // no results entered yet
  | "onTrack" // every resolved pick still correct
  | "behind" // at least one pick has lost, but the champion is still alive
  | "eliminated"; // the predicted champion is already knocked out

/**
 * How a prediction is faring against the actual results so far:
 * - `eliminated` — their champion pick is already out (worst case)
 * - `behind` — a pick has already lost, but their champion survives
 * - `onTrack` — nothing they picked has lost yet
 */
export function predictionStatus(
  pool: Scoreable,
  prediction: Prediction,
): PredictionStatus {
  const n = pool.firstRound.length;
  const rounds = roundCount(n);

  let anyResults = false;
  for (let r = 0; r < rounds; r++) {
    if (advancers(pool.actual, n, r).size > 0) {
      anyResults = true;
      break;
    }
  }
  if (!anyResults) return "unscored";

  const champion = championOf(pool.firstRound, prediction.picks);
  if (champion && isEliminated(pool, champion)) return "eliminated";

  // Only judge matches that actually have a result. A pick is "behind" if the
  // player named a winner for a resolved match and that team didn't win it.
  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < matchesInRound(n, r); i++) {
      const key = matchKey(r, i);
      const actualWinner = pool.actual[key];
      if (!actualWinner) continue;
      const userPick = prediction.picks[key];
      if (userPick && userPick !== actualWinner) return "behind";
    }
  }
  return "onTrack";
}

/**
 * Set a winner for match (round,index) in a pick-set and prune any downstream
 * picks that reference a team which is no longer in that later match.
 */
export function applyPick(
  firstRound: FirstRoundMatch[],
  picks: Record<string, string>,
  round: number,
  index: number,
  team: string,
): Record<string, string> {
  const next = { ...picks, [matchKey(round, index)]: team };
  const rounds = roundCount(firstRound.length);
  for (let r = round + 1; r < rounds; r++) {
    for (let i = 0; i < matchesInRound(firstRound.length, r); i++) {
      const [a, b] = teamsFor(firstRound, next, r, i);
      const k = matchKey(r, i);
      if (next[k] && next[k] !== a && next[k] !== b) delete next[k];
    }
  }
  return next;
}

export function championOf(
  firstRound: FirstRoundMatch[],
  picks: Record<string, string>,
): string | null {
  const rounds = roundCount(firstRound.length);
  return picks[matchKey(rounds - 1, 0)] ?? null;
}

/** Validate/normalise a first-round list: power of two, both teams named. */
export function isPowerOfTwo(n: number): boolean {
  return n >= 1 && (n & (n - 1)) === 0;
}
