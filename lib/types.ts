// Domain types for the WC 2026 knockout prediction groups.

/** A first-round matchup entered by the group creator. */
export interface FirstRoundMatch {
  teamA: string;
  teamB: string;
  /** ISO kick-off time (optional). */
  date?: string;
}

/**
 * One person's bracket prediction. `picks` maps a match key
 * (`"<round>-<index>"`) to the team they think wins that match. The final
 * match's pick is the predicted champion.
 */
export interface Prediction {
  id: string;
  name: string;
  picks: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

/** A shareable prediction group. */
export interface Pool {
  id: string;
  title: string;
  organiser?: string;
  /** power-of-two list of opening matchups; later rounds are derived. */
  firstRound: FirstRoundMatch[];
  /** actual winners set by the organiser, keyed like `picks`. */
  actual: Record<string, string>;
  predictions: Prediction[];
  /** secret held by the creator; lets them edit results. Never sent to others. */
  adminKey: string;
  createdAt: string;
  updatedAt: string;
}

/** Pool as returned to normal viewers (no admin secret). */
export type PublicPool = Omit<Pool, "adminKey">;

export interface CreatePoolInput {
  title?: string;
  organiser?: string;
  firstRound: FirstRoundMatch[];
}
