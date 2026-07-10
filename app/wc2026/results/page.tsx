"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Bracket from "@/components/Bracket";
import { applyPick, championOf, flagFor, roundCount } from "@/lib/bracket";
import type { FirstRoundMatch } from "@/lib/types";

type Picks = Record<string, string>;

export default function GlobalResultsAdmin() {
  const [key, setKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [firstRound, setFirstRound] = useState<FirstRoundMatch[]>([]);
  const [draft, setDraft] = useState<Picks>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const url = new URL(window.location.href);
      const urlKey = url.searchParams.get("key");
      if (urlKey) {
        setKey(urlKey);
        url.searchParams.delete("key");
        window.history.replaceState({}, "", url.pathname + url.hash);
      }
    } catch {
      /* ignore */
    }
    fetch("/api/wc2026/results")
      .then((r) => r.json())
      .then((data) => {
        setFirstRound(data.firstRound ?? []);
        setDraft(data.actual ?? {});
      })
      .catch(() => setMsg("Could not load results."))
      .finally(() => setLoading(false));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const rounds = firstRound.length ? roundCount(firstRound.length) : 1;
  const champion = championOf(firstRound, draft);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/wc2026/results", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": key },
        body: JSON.stringify({ actual: draft, firstRound }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save.");
      setMsg("Saved ✓ Every group now scores against these results.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container page">
      <Link href="/wc2026" className="back-link">
        ← WC 2026
      </Link>
      <div className="page-head">
        <span className="badge">🌍 Official results</span>
        <h1>WC 2026 — global results</h1>
        <p className="muted" style={{ margin: 0 }}>
          Set the real winner of each match once. Every group is scored and
          colour-coded against these — organisers don’t enter results themselves.
        </p>
      </div>

      {!key && (
        <div className="card card-pad" style={{ marginBottom: 18, maxWidth: 420 }}>
          <div className="field" style={{ marginBottom: 12 }}>
            <label htmlFor="adminkey">Admin key</label>
            <input
              id="adminkey"
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Enter the results admin key"
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setKey(keyInput.trim())}
            disabled={!keyInput.trim()}
          >
            Unlock
          </button>
        </div>
      )}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <div className="card card-pad">
          <div className="pool-editor-head">
            <div>
              <h2 style={{ fontSize: "1.15rem", margin: 0 }}>
                Actual results
              </h2>
              <p
                className="muted"
                style={{ fontSize: "0.88rem", margin: "4px 0 0" }}
              >
                Tap the real winner of each match. Champion so far:{" "}
                <strong>
                  {champion ? `${flagFor(champion)} ${champion}` : "—"}
                </strong>
              </p>
            </div>
          </div>

          <Bracket
            firstRound={firstRound}
            picks={draft}
            rounds={rounds}
            mounted
            accent
            onPick={(r, i, team) =>
              setDraft((prev) => applyPick(firstRound, prev, r, i, team))
            }
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 14,
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn btn-primary"
              onClick={save}
              disabled={saving || !key}
            >
              {saving ? "Saving…" : "Save official results"}
            </button>
            {msg && <span className="muted">{msg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
