"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  applyPick,
  championOf,
  flagFor,
  isPickCorrect,
  matchesInRound,
  matchKey,
  predictionStatus,
  roundCount,
  roundName,
  roundResolved,
  scorePrediction,
  teamsFor,
} from "@/lib/bracket";
import { getAdminKey, saveAdminKey } from "@/lib/local";
import type { FirstRoundMatch, PublicPool } from "@/lib/types";

type Picks = Record<string, string>;
const NAME_KEY = "wc2026-name";

export default function GroupView({ initialPool }: { initialPool: PublicPool }) {
  const [pool, setPool] = useState<PublicPool>(initialPool);
  const [toast, setToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [adminKey, setAdminKey] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [picks, setPicks] = useState<Picks>({});
  const [savingPred, setSavingPred] = useState(false);

  const [actualDraft, setActualDraft] = useState<Picks>(pool.actual);
  const [savingActual, setSavingActual] = useState(false);
  const [organiserOpen, setOrganiserOpen] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const rounds = roundCount(pool.firstRound.length);

  useEffect(() => {
    // one-time sync from external systems (localStorage) on mount
    /* eslint-disable react-hooks/set-state-in-effect */
    setMounted(true);
    // Unlock organiser mode either from this browser's saved key, or from a
    // shared organiser link (?key=...). The server still verifies the key on save.
    let key = getAdminKey(pool.id);
    try {
      const url = new URL(window.location.href);
      const urlKey = url.searchParams.get("key");
      if (urlKey) {
        saveAdminKey(pool.id, urlKey);
        key = urlKey;
        url.searchParams.delete("key");
        window.history.replaceState(
          {},
          "",
          url.pathname + url.search + url.hash,
        );
      }
    } catch {
      /* ignore */
    }
    setAdminKey(key);
    try {
      const savedName = localStorage.getItem(NAME_KEY) ?? "";
      if (savedName) {
        setName(savedName);
        const existing = initialPool.predictions.find(
          (p) => p.name.toLowerCase() === savedName.toLowerCase(),
        );
        if (existing) setPicks(existing.picks);
      }
    } catch {
      /* ignore */
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isOrganiser = !!adminKey;

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 2400);
  }

  const champion = championOf(pool.firstRound, picks);
  const actualChampion = championOf(pool.firstRound, pool.actual);
  const noPicks = Object.keys(picks).length === 0;
  const anyResults = useMemo(
    () => Object.keys(pool.actual).length > 0,
    [pool.actual],
  );
  const myName = name.trim().toLowerCase();

  // Is the current bracket already saved (identically) under this name?
  const savedMine = myName
    ? pool.predictions.find((p) => p.name.toLowerCase() === myName)
    : undefined;
  const picksMatchSaved = !!savedMine && samePicks(savedMine.picks, picks);
  // Draw attention to the save banner whenever there's an unsaved prediction.
  const readyUnsaved = !!champion && !picksMatchSaved;
  const saveNote = !champion
    ? "Pick a winner in every match to crown your champion."
    : picksMatchSaved
      ? "Saved ✓ Your bracket is in the group — your friends can see and compare it."
      : !name.trim()
        ? "Add your name and save, so your friends can see your prediction in the group."
        : "Hit save to lock in your bracket — your friends will see it and compare their picks against yours.";

  const leaderboard = useMemo(() => {
    return pool.predictions
      .map((p) => ({ prediction: p, score: scorePrediction(pool, p) }))
      .sort((a, b) => {
        if (anyResults) {
          if (b.score.points !== a.score.points)
            return b.score.points - a.score.points;
          return b.score.correct - a.score.correct;
        }
        return a.prediction.createdAt < b.prediction.createdAt ? 1 : -1;
      });
  }, [pool, anyResults]);

  async function savePrediction() {
    if (!name.trim()) {
      flash("Add your name first.");
      return;
    }
    setSavingPred(true);
    try {
      const res = await fetch(`/api/pools/${pool.id}/predictions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), picks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save.");
      setPool(data.pool);
      try {
        localStorage.setItem(NAME_KEY, name.trim());
      } catch {
        /* ignore */
      }
      flash("Prediction saved! 🏆");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSavingPred(false);
    }
  }

  async function saveResults() {
    setSavingActual(true);
    try {
      const res = await fetch(`/api/pools/${pool.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey ?? "",
        },
        body: JSON.stringify({ actual: actualDraft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save results.");
      setPool(data.pool);
      flash("Results updated ✔");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Could not save results.");
    } finally {
      setSavingActual(false);
    }
  }

  function shareLink() {
    const url = window.location.href;
    navigator.clipboard
      ?.writeText(url)
      .then(() => flash("Link copied — share it with your friends!"))
      .catch(() => flash(url));
  }

  function copyOrganiserLink() {
    if (!adminKey) return;
    const url = `${window.location.origin}${window.location.pathname}?key=${adminKey}`;
    navigator.clipboard
      ?.writeText(url)
      .then(() =>
        flash("Organiser link copied — open it on any device to enter results."),
      )
      .catch(() => flash(url));
  }

  return (
    <div className="container page">
      <Link href="/wc2026" className="back-link">
        ← All groups
      </Link>

      <div className="game-header">
        <h1>{pool.title}</h1>
        <span className="badge">🏆 WC 2026</span>
        {pool.organiser && <span className="badge">by {pool.organiser}</span>}
        {actualChampion ? (
          <span className="badge" style={{ color: "var(--gold)" }}>
            🏅 Winner: {flagFor(actualChampion)} {actualChampion}
          </span>
        ) : (
          <span className="badge">
            {pool.predictions.length} prediction
            {pool.predictions.length === 1 ? "" : "s"}
          </span>
        )}
        <button className="btn btn-sm btn-ghost" onClick={shareLink}>
          🔗 Share
        </button>
      </div>

      {/* YOUR PREDICTION */}
      <section className="card card-pad" style={{ marginBottom: 18 }}>
        <div className="pool-editor-head">
          <div>
            <h2 style={{ fontSize: "1.15rem", margin: 0 }}>Your prediction</h2>
            <p className="muted" style={{ fontSize: "0.88rem", margin: "4px 0 0" }}>
              Build your bracket round by round. Your final pick is the champion.
            </p>
          </div>
        </div>

        <div className="pick-callout" role="note">
          <span className="pick-callout-icon" aria-hidden>
            👇
          </span>
          <span>
            <strong>Tap a country</strong> in each match to send it through —
            keep going until you crown a champion.
          </span>
        </div>

        <Bracket
          firstRound={pool.firstRound}
          picks={picks}
          rounds={rounds}
          mounted={mounted}
          hint={noPicks}
          onPick={(r, i, team) =>
            setPicks((prev) => applyPick(pool.firstRound, prev, r, i, team))
          }
        />

        <div className={"save-panel" + (readyUnsaved ? " pulse" : "")}>
          <div className="save-champ">
            <span className="trophy">🏆</span>
            <div>
              <div className="save-champ-label">Your champion</div>
              {champion ? (
                <strong className="save-champ-team">
                  {flagFor(champion)} {champion}
                </strong>
              ) : (
                <span className="muted">pick your way to the final →</span>
              )}
            </div>
          </div>
          <div className="save-fields">
            <div className="save-name">
              <label htmlFor="predname">Your name</label>
              <input
                id="predname"
                placeholder="Type your name…"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <button
              className={
                "btn btn-primary save-btn" + (readyUnsaved ? " cta-pulse" : "")
              }
              onClick={savePrediction}
              disabled={savingPred}
            >
              {savingPred ? "Saving…" : "Save prediction"}
            </button>
          </div>
          <p className={"save-note" + (readyUnsaved ? " save-note-active" : "")}>
            {saveNote}
          </p>
        </div>
      </section>

      {/* LEADERBOARD */}
      <section className="card card-pad" style={{ marginBottom: 18 }}>
        <div className="section-head" style={{ marginBottom: 12 }}>
          <h2 style={{ fontSize: "1.15rem", margin: 0 }}>
            Leaderboard{" "}
            <span className="muted" style={{ fontWeight: 400 }}>
              · {pool.predictions.length}
            </span>
          </h2>
          {!anyResults && <span className="badge">Results not in yet</span>}
        </div>
        {isOrganiser && !anyResults && (
          <p className="lb-hint muted" style={{ marginTop: 0 }}>
            You’re the organiser — enter the real match winners in the{" "}
            <strong>Organiser panel below</strong> (“Set results”) to score and
            colour-code everyone.
          </p>
        )}
        {pool.predictions.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            No predictions yet — be the first to fill in the bracket above.
          </p>
        ) : (
          <>
            <p className="lb-hint muted">
              Tap any row to expand it and see that player’s full bracket.
            </p>
            {anyResults && (
              <div className="lb-legend">
                <span className="lb-legend-item">
                  <span className="lb-swatch lb-swatch-red" />
                  Champion knocked out
                </span>
                <span className="lb-legend-item">
                  <span className="lb-swatch lb-swatch-orange" />
                  Champion can still win, but not your way
                </span>
                <span className="lb-legend-item">
                  <span className="lb-swatch lb-swatch-white" />
                  Everything still on track
                </span>
              </div>
            )}
            <table className="lb-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Champion pick</th>
                  {anyResults && <th style={{ textAlign: "right" }}>Correct</th>}
                  {anyResults && <th style={{ textAlign: "right" }}>Points</th>}
                  <th aria-hidden="true" className="lb-expand-head"></th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map(({ prediction: p, score }, i) => {
                  const champ = championOf(pool.firstRound, p.picks);
                  const isMe = myName && p.name.toLowerCase() === myName;
                  const open = viewingId === p.id;
                  const cols = 4 + (anyResults ? 2 : 0);
                  const status = predictionStatus(pool, p);
                  const statusClass =
                    status === "eliminated"
                      ? " lb-red"
                      : status === "behind"
                        ? " lb-orange"
                        : "";
                  return (
                    <Fragment key={p.id}>
                      <tr
                        className={"lb-row" + statusClass + (open ? " is-open" : "")}
                        onClick={() =>
                          setViewingId((cur) => (cur === p.id ? null : p.id))
                        }
                        aria-expanded={open}
                      >
                        <td className="lb-rank">
                          {anyResults
                            ? i === 0
                              ? "🥇"
                              : i === 1
                                ? "🥈"
                                : i === 2
                                  ? "🥉"
                                  : i + 1
                            : i + 1}
                        </td>
                        <td>
                          <strong>{p.name}</strong>
                          {isMe && <span className="tag">YOU</span>}
                          {score.championCorrect && (
                            <span className="tag gold">🏆</span>
                          )}
                        </td>
                        <td>
                          {champ ? (
                            <span className="lb-champ">
                              {flagFor(champ)} {champ}
                            </span>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                        {anyResults && (
                          <td style={{ textAlign: "right" }}>{score.correct}</td>
                        )}
                        {anyResults && (
                          <td
                            style={{ textAlign: "right" }}
                            className="rating-score"
                          >
                            {score.points}
                          </td>
                        )}
                        <td className="lb-expand">
                          <span className="lb-chevron" aria-hidden="true" />
                        </td>
                      </tr>
                      {open && (
                        <tr className="lb-detail-row">
                          <td colSpan={cols}>
                            <div className="lb-detail">
                              <div className="lb-detail-head">
                                <span className="lb-detail-title">
                                  {p.name}’s bracket
                                </span>
                                <button
                                  className="btn btn-sm btn-ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewingId(null);
                                  }}
                                >
                                  Close
                                </button>
                              </div>
                              <Bracket
                                firstRound={pool.firstRound}
                                picks={p.picks}
                                rounds={rounds}
                                mounted={mounted}
                                result={anyResults ? pool : undefined}
                              />
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </section>

      {/* ORGANISER */}
      {isOrganiser && (
        <section className="card card-pad">
          <div
            className="section-head"
            style={{ marginBottom: organiserOpen ? 12 : 0 }}
          >
            <h2 style={{ fontSize: "1.15rem", margin: 0 }}>
              🎛️ Organiser · actual results
            </h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                className="btn btn-sm btn-ghost"
                onClick={copyOrganiserLink}
              >
                🔑 Organiser link
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  setActualDraft(pool.actual);
                  setOrganiserOpen((o) => !o);
                }}
              >
                {organiserOpen ? "Hide" : "Set results"}
              </button>
            </div>
          </div>
          {organiserOpen && (
            <>
              <p className="muted" style={{ fontSize: "0.88rem" }}>
                Tap the real winner of each match as the tournament plays out,
                then <strong>Save results</strong> — the leaderboard re-scores
                and re-colours everyone automatically. Use{" "}
                <strong>Organiser link</strong> to enter results from another
                device.
              </p>
              <Bracket
                firstRound={pool.firstRound}
                picks={actualDraft}
                rounds={rounds}
                mounted={mounted}
                accent
                onPick={(r, i, team) =>
                  setActualDraft((prev) =>
                    applyPick(pool.firstRound, prev, r, i, team),
                  )
                }
              />
              <button
                className="btn btn-primary"
                style={{ marginTop: 12 }}
                onClick={saveResults}
                disabled={savingActual}
              >
                {savingActual ? "Saving…" : "Save results"}
              </button>
            </>
          )}
        </section>
      )}

      <section className="cta-banner">
        <div className="cta-banner-body">
          <span className="cta-eyebrow">🏆 Your own group</span>
          <h2>Create your own prediction board</h2>
          <p>
            Set up a bracket for your friends in seconds, share one link, and
            watch the leaderboard settle who really knows their football.
          </p>
        </div>
        <Link href="/wc2026" className="btn btn-primary cta-banner-btn">
          Create a board →
        </Link>
      </section>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------

function Bracket({
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
  picks: Picks;
  rounds: number;
  mounted: boolean;
  onPick?: (round: number, index: number, team: string) => void;
  result?: PublicPool;
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
  picks: Picks;
  round: number;
  index: number;
  mounted: boolean;
  onPick?: (round: number, index: number, team: string) => void;
  result?: PublicPool;
  hint?: boolean;
}) {
  const [a, b] = teamsFor(firstRound, picks, round, index);
  const winner = picks[matchKey(round, index)];
  const date = round === 0 ? firstRound[index]?.date : undefined;
  const ready = a !== null && b !== null;

  function row(team: string | null) {
    const selected = !!team && winner === team;
    const resolved = result ? roundResolved(result, round) : false;
    const correct = selected && result ? isPickCorrect(result, round, team!) : false;
    const wrong = selected && resolved && !correct;
    const hintable = !!hint && !!onPick && round === 0 && ready && !!team && !winner;
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

function ChampionCard({ picks, rounds }: { picks: Picks; rounds: number }) {
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

function samePicks(a: Picks, b: Picks): boolean {
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  return ak.every((k) => a[k] === b[k]);
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
