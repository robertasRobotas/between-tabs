"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  applyPick,
  championOf,
  flagFor,
  predictionStatus,
  roundCount,
  scorePrediction,
} from "@/lib/bracket";
import Bracket from "@/components/Bracket";
import type { PublicPool } from "@/lib/types";

type Picks = Record<string, string>;
const NAME_KEY = "wc2026-name";

export default function GroupView({
  initialPool,
  globalActual = {},
}: {
  initialPool: PublicPool;
  globalActual?: Record<string, string>;
}) {
  const [pool, setPool] = useState<PublicPool>(initialPool);
  const [toast, setToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const [name, setName] = useState("");
  const [picks, setPicks] = useState<Picks>({});
  const [savingPred, setSavingPred] = useState(false);

  const [viewingId, setViewingId] = useState<string | null>(null);

  const rounds = roundCount(pool.firstRound.length);

  useEffect(() => {
    // one-time sync from localStorage (saved name) on mount
    /* eslint-disable react-hooks/set-state-in-effect */
    setMounted(true);
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

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 2400);
  }

  // Official WC 2026 results are global; any legacy per-pool results fill gaps.
  const effectiveActual = useMemo(
    () => ({ ...pool.actual, ...globalActual }),
    [pool.actual, globalActual],
  );
  const scorePool = useMemo(
    () => ({ firstRound: pool.firstRound, actual: effectiveActual }),
    [pool.firstRound, effectiveActual],
  );

  const champion = championOf(pool.firstRound, picks);
  const actualChampion = championOf(pool.firstRound, effectiveActual);
  const noPicks = Object.keys(picks).length === 0;
  const anyResults = Object.keys(effectiveActual).length > 0;
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
      .map((p) => ({ prediction: p, score: scorePrediction(scorePool, p) }))
      .sort((a, b) => {
        if (anyResults) {
          if (b.score.points !== a.score.points)
            return b.score.points - a.score.points;
          return b.score.correct - a.score.correct;
        }
        return a.prediction.createdAt < b.prediction.createdAt ? 1 : -1;
      });
  }, [pool.predictions, scorePool, anyResults]);

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

  function shareLink() {
    const url = window.location.href;
    navigator.clipboard
      ?.writeText(url)
      .then(() => flash("Link copied — share it with your friends!"))
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
          {!anyResults && (
            <span className="badge">Official results not in yet</span>
          )}
        </div>
        {!anyResults && (
          <p className="lb-hint muted" style={{ marginTop: 0 }}>
            Scores and colours update automatically as the real World Cup 2026
            results come in — the same official results for every group.
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
                  const status = predictionStatus(scorePool, p);
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
                                result={anyResults ? scorePool : undefined}
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


function samePicks(a: Picks, b: Picks): boolean {
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  return ak.every((k) => a[k] === b[k]);
}

