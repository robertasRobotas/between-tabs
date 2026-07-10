"use client";

import { useEffect, useRef, useState } from "react";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/football";
import {
  CARD_H,
  CARD_W,
  computeSubjectBox,
  drawPlayerCard,
  type CardData,
  type SubjectBox,
} from "@/lib/drawPlayerCard";

const EXAMPLE: CardData = {
  firstName: "Luka",
  lastName: "Modrić",
  country: DEFAULT_COUNTRY,
  birth: "9-9-1985",
  height: "1,73m",
  weight: "65 kg",
  club: "AC Milan (ITA)",
};

export default function FootballPlayerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState("");
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [subject, setSubject] = useState<SubjectBox | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [imgError, setImgError] = useState("");
  const [removeBg, setRemoveBg] = useState(true);
  const [data, setData] = useState<CardData>(EXAMPLE);

  // redraw whenever inputs or the photo change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawPlayerCard(ctx, data, img, subject);
  }, [data, img, subject]);

  function set<K extends keyof CardData>(key: K, value: CardData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function showBlob(blob: Blob) {
    const image = new Image();
    const objectUrl = URL.createObjectURL(blob);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      setSubject(removeBg ? computeSubjectBox(image) : null);
      setImg(image);
      setLoading(false);
      setStatus("");
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setLoading(false);
      setStatus("");
      setImgError("Could not render that image.");
    };
    image.src = objectUrl;
  }

  async function loadPhoto() {
    const trimmed = url.trim();
    if (!trimmed) return;
    setLoading(true);
    setImgError("");
    setStatus("Fetching photo…");
    try {
      const res = await fetch(
        `/api/player-image?url=${encodeURIComponent(trimmed)}`,
      );
      if (!res.ok) {
        throw new Error("Could not load that image. Check the URL is a direct image link.");
      }
      let blob = await res.blob();

      if (removeBg) {
        setStatus("Removing background…");
        const { removeBackground } = await import("@imgly/background-removal");
        blob = await removeBackground(blob, {
          progress: (key, current, total) => {
            if (key.startsWith("fetch")) {
              setStatus(
                `Preparing model… ${Math.round((current / total) * 100)}%`,
              );
            } else {
              setStatus("Removing background…");
            }
          },
        });
      }

      showBlob(blob);
    } catch (err) {
      setLoading(false);
      setStatus("");
      setImgError(
        err instanceof Error
          ? err.message
          : "Something went wrong processing the image.",
      );
    }
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      const name =
        `${data.firstName}-${data.lastName}`.trim().replace(/\s+/g, "-") ||
        "player-card";
      link.download = `${name}.png`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    }, "image/png");
  }

  return (
    <div className="container page fp-page">
      <header className="page-head">
        <span className="eyebrow mono">Card generator</span>
        <h1>Football player card.</h1>
      </header>

      <div className="fp-layout">
        <form className="fp-form" onSubmit={(e) => e.preventDefault()}>
          <label className="fp-field">
            <span>Photo URL</span>
            <div className="fp-url-row">
              <input
                type="url"
                placeholder="https://…/player.png"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={loadPhoto}
                disabled={loading || !url.trim()}
              >
                {loading ? "Working…" : "Load"}
              </button>
            </div>
            <label className="fp-check">
              <input
                type="checkbox"
                checked={removeBg}
                onChange={(e) => setRemoveBg(e.target.checked)}
              />
              <span>Automatically remove background (recommended)</span>
            </label>
            {loading && status && <small className="fp-hint">{status}</small>}
            {imgError && <small className="fp-error">{imgError}</small>}
          </label>

          <div className="fp-row">
            <label className="fp-field">
              <span>First name</span>
              <input
                value={data.firstName}
                onChange={(e) => set("firstName", e.target.value)}
              />
            </label>
            <label className="fp-field">
              <span>Last name</span>
              <input
                value={data.lastName}
                onChange={(e) => set("lastName", e.target.value)}
              />
            </label>
          </div>

          <label className="fp-field">
            <span>Country</span>
            <select
              value={data.country}
              onChange={(e) => set("country", e.target.value)}
            >
              {COUNTRIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <div className="fp-row fp-row-3">
            <label className="fp-field">
              <span>Birth date</span>
              <input
                value={data.birth}
                placeholder="9-9-1985"
                onChange={(e) => set("birth", e.target.value)}
              />
            </label>
            <label className="fp-field">
              <span>Height</span>
              <input
                value={data.height}
                placeholder="1,73m"
                onChange={(e) => set("height", e.target.value)}
              />
            </label>
            <label className="fp-field">
              <span>Weight</span>
              <input
                value={data.weight}
                placeholder="65 kg"
                onChange={(e) => set("weight", e.target.value)}
              />
            </label>
          </div>

          <label className="fp-field">
            <span>Club</span>
            <input
              value={data.club}
              placeholder="AC Milan (ITA)"
              onChange={(e) => set("club", e.target.value)}
            />
          </label>

          <button type="button" className="btn btn-primary" onClick={download}>
            Download card ↓
          </button>
        </form>

        <div className="fp-preview">
          <canvas
            ref={canvasRef}
            width={CARD_W}
            height={CARD_H}
            className="fp-canvas"
          />
        </div>
      </div>
    </div>
  );
}
