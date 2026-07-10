"use client";

import {
  flagFor,
  isPickCorrect,
  matchesInRound,
  matchKey,
  roundName,
  roundResolved,
  teamsFor,
} from "@/lib/bracket";
import type { FirstRoundMatch } from "@/lib/types";

export type BracketPicks = Record<string, string>;

/** Minimal shape the result overlay needs — a Pool, PublicPool, or global scorePool. */
export type BracketResult = {
  firstRound: FirstRoundMatch[];
  actual: Record<string, string>;
};

export default function Bracket({
  firstRound,
  picks,
  rounds,
  mounted,
  onPick,
  result,
  accent,
  hint,
}: {
  firstRound: FirstRoundMatch[];
  picks: BracketPicks;
  rounds: number;
  mounted: boolean;
  onPick?: (round: number, index: number, team: string) => void;
  result?: BracketResult;
  accent?: boolean;
  hint?: boolean;
}) {
  const n = firstRound.length;
  return (
    <div className="bracket-scroll">
      <div
        className={`bracket${accent ? " accent" : ""}`}
        style={{ minHeight: n * 78 }}
      >
        {Array.from({ length: rounds }, (_, r) => (
          <div className="bracket-col" key={r}>
            <div className="bracket-col-head">{roundName(rounds, r)}</div>
            <div className="bracket-col-body">
              {Array.from({ length: matchesInRound(n, r) }, (_, i) => (
                <MatchCard
                  key={i}
                  firstRound={firstRound}
                  picks={picks}
                  round={r}
                  index={i}
                  mounted={mounted}
                  onPick={onPick}
                  result={result}
                  hint={hint}
                />
              ))}
            </div>
          </div>
        ))}
        <div className="bracket-col champion-col">
          <div className="bracket-col-head">Champion</div>
          <div className="bracket-col-body">
            <ChampionCard picks={picks} rounds={rounds} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchCard({
  firstRound,
  picks,
  round,
  index,
  mounted,
  onPick,
  result,
  hint,
}: {
  firstRound: FirstRoundMatch[];
  picks: BracketPicks;
  round: number;
  index: number;
  mounted: boolean;
  onPick?: (round: number, index: number, team: string) => void;
  result?: BracketResult;
  hint?: boolean;
}) {
  const [a, b] = teamsFor(firstRound, picks, round, index);
  const winner = picks[matchKey(round, index)];
  const date = round === 0 ? firstRound[index]?.date : undefined;
  const ready = a !== null && b !== null;

  function row(team: string | null) {
    const selected = !!team && winner === team;
    const resolved = result ? roundResolved(result, round) : false;
    const correct =
      selected && result ? isPickCorrect(result, round, team!) : false;
    const wrong = selected && resolved && !correct;
    const hintable =
      !!hint && !!onPick && round === 0 && ready && !!team && !winner;
    return (
      <button
        type="button"
        className={
          "bracket-team" +
          (selected ? " sel" : "") +
          (correct ? " ok" : "") +
          (wrong ? " no" : "") +
          (hintable ? " hint" : "")
        }
        disabled={!team || !onPick || !ready}
        onClick={() => team && ready && onPick?.(round, index, team)}
      >
        <span className="flag">{team ? flagFor(team) : "·"}</span>
        <span className="tname">{team ?? "TBD"}</span>
        {correct && <span className="rmark ok">✓</span>}
        {wrong && <span className="rmark no">✕</span>}
      </button>
    );
  }

  return (
    <div className={"bracket-match" + (!ready ? " locked" : "")}>
      {row(a)}
      {row(b)}
      {!ready && onPick && (
        <span className="bracket-lock">🔒 Awaiting both teams</span>
      )}
      {date && (
        <span className="bracket-date" suppressHydrationWarning>
          {mounted ? formatDateTime(date) : ""}
        </span>
      )}
    </div>
  );
}

function ChampionCard({
  picks,
  rounds,
}: {
  picks: BracketPicks;
  rounds: number;
}) {
  const champ = picks[matchKey(rounds - 1, 0)];
  return (
    <div className={`bracket-champion${champ ? " has" : ""}`}>
      <span className="trophy">🏆</span>
      {champ ? (
        <span className="tname">
          {flagFor(champ)} {champ}
        </span>
      ) : (
        <span className="muted">TBD</span>
      )}
    </div>
  );
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
