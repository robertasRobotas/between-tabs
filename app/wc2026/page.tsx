"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DEFAULT_FIRST_ROUND, flagFor } from "@/lib/bracket";
import {
  addLocalGroup,
  listLocalGroups,
  saveAdminKey,
  type LocalGroup,
} from "@/lib/local";
import type { FirstRoundMatch } from "@/lib/types";

const SIZES = [2, 4, 8, 16];

function toLocalInput(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(
    d.getHours(),
  )}:${p(d.getMinutes())}`;
}

export default function WC2026Hub() {
  const router = useRouter();
  const [title, setTitle] = useState("WC 2026 — Friends group");
  const [organiser, setOrganiser] = useState("");
  const [matches, setMatches] = useState<FirstRoundMatch[]>(() =>
    DEFAULT_FIRST_ROUND.map((m) => ({ ...m })),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mine, setMine] = useState<LocalGroup[]>([]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMine(listLocalGroups());
    const today = new Date();
    today.setHours(23, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(22, 0, 0, 0);
    const jul12a = new Date(today.getFullYear(), 6, 12, 0, 0);
    const jul12b = new Date(today.getFullYear(), 6, 12, 4, 0);
    const dates = [today, tomorrow, jul12a, jul12b].map(toLocalInput);
    setMatches((prev) => prev.map((m, i) => (m.date ? m : { ...m, date: dates[i] })));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function setSize(size: number) {
    setMatches((prev) => {
      const next = prev.slice(0, size);
      while (next.length < size) next.push({ teamA: "", teamB: "" });
      return next;
    });
  }
  function update(i: number, patch: Partial<FirstRoundMatch>) {
    setMatches((prev) => prev.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (matches.some((m) => !m.teamA.trim() || !m.teamB.trim())) {
      setError("Fill in both teams for every opening match.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/pools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || undefined,
          organiser: organiser.trim() || undefined,
          firstRound: matches.map((m) => ({
            teamA: m.teamA.trim(),
            teamB: m.teamB.trim(),
            date: m.date ? new Date(m.date).toISOString() : undefined,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create group.");
      saveAdminKey(data.pool.id, data.adminKey);
      addLocalGroup({ id: data.pool.id, title: data.pool.title });
      router.push(`/wc2026/${data.pool.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <div className="container page">
      <Link href="/" className="back-link">
        ← Home
      </Link>
      <div className="page-head">
        <span className="badge">🏆 World Cup 2026</span>
        <h1>Predict the knockouts</h1>
        <p className="muted" style={{ margin: 0 }}>
          Create a group, share the link with your friends, and everyone picks
          winners from the current round to the champion. Closest bracket wins.
        </p>
      </div>

      {mine.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="section-head">
            <h2 style={{ fontSize: "1.2rem" }}>Your groups</h2>
          </div>
          <div className="group-grid">
            {mine.map((g) => (
              <Link key={g.id} href={`/wc2026/${g.id}`} className="group-card">
                <span className="badge">🏆 Group</span>
                <h3 style={{ margin: "10px 0 2px", fontSize: "1.05rem" }}>
                  {g.title}
                </h3>
                <span className="muted" style={{ fontSize: "0.85rem" }}>
                  Open bracket →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <form onSubmit={submit}>
        <div className="card card-pad" style={{ marginBottom: 18 }}>
          <div className="row">
            <div className="field">
              <label htmlFor="title">Group name</label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Office / mates group"
              />
            </div>
            <div className="field">
              <label htmlFor="org">Your name (organiser)</label>
              <input
                id="org"
                value={organiser}
                onChange={(e) => setOrganiser(e.target.value)}
                placeholder="optional"
              />
            </div>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="size">Opening round</label>
            <select
              id="size"
              value={matches.length}
              onChange={(e) => setSize(Number(e.target.value))}
              style={{ maxWidth: 260 }}
            >
              {SIZES.map((n) => (
                <option key={n} value={n}>
                  {n} matches · {n * 2} teams
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card card-pad" style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: "1.15rem" }}>Opening matchups</h2>
          <div className="matchup-list">
            {matches.map((m, i) => (
              <div key={i} className="matchup-row">
                <span className="matchup-no">{i + 1}</span>
                <div className="matchup-team">
                  <span className="flag">{flagFor(m.teamA)}</span>
                  <input
                    value={m.teamA}
                    onChange={(e) => update(i, { teamA: e.target.value })}
                    placeholder="Team A"
                  />
                </div>
                <span className="matchup-v">vs</span>
                <div className="matchup-team">
                  <span className="flag">{flagFor(m.teamB)}</span>
                  <input
                    value={m.teamB}
                    onChange={(e) => update(i, { teamB: e.target.value })}
                    placeholder="Team B"
                  />
                </div>
                <input
                  className="matchup-date"
                  type="datetime-local"
                  value={m.date ?? ""}
                  onChange={(e) => update(i, { date: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="error" style={{ marginBottom: 12 }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={submitting}
        >
          {submitting ? "Creating…" : "Create group & open bracket"}
        </button>
      </form>
    </div>
  );
}
