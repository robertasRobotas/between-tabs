"use client";

import { useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import exampleCards from "@/assets/real-world/images/wc26playerCards.webp";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/football";
import {
  CARD_H,
  CARD_W,
  computeSubjectBox,
  drawPlayerCard,
  type CardData,
  type SubjectBox,
} from "@/lib/drawPlayerCard";
import { FIFA_LOGO_URL } from "@/lib/fifaLogo";

const EXAMPLE: CardData = {
  firstName: "Luka",
  lastName: "Modrić",
  country: DEFAULT_COUNTRY,
  birth: "9-9-1985",
  height: "1,73m",
  weight: "65 kg",
  club: "AC Milan (ITA)",
  atk: "90",
  def: "90",
  speed: "90",
};

export default function FootballPlayerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState("");
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [subject, setSubject] = useState<SubjectBox | null>(null);
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [imgError, setImgError] = useState("");
  const [data, setData] = useState<CardData>(EXAMPLE);
  const [shareUrl, setShareUrl] = useState("");
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState("");
  const [copied, setCopied] = useState(false);

  // redraw whenever inputs or the photo change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawPlayerCard(ctx, data, img, subject, logo);
  }, [data, img, subject, logo]);

  // preload the FIFA 26 emblem once
  useEffect(() => {
    const image = new Image();
    image.onload = () => setLogo(image);
    image.src = FIFA_LOGO_URL;
  }, []);

  function set<K extends keyof CardData>(key: K, value: CardData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function showBlob(blob: Blob) {
    const image = new Image();
    const objectUrl = URL.createObjectURL(blob);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      setSubject(computeSubjectBox(image));
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

  async function processBlob(input: Blob) {
    setLoading(true);
    setImgError("");
    try {
      setStatus("Removing background…");
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(input, {
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

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImgError("Please choose an image file.");
      return;
    }
    setStatus("Reading photo…");
    await processBlob(file);
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
      const blob = await res.blob();
      await processBlob(blob);
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

  async function createScratchLink() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSharing(true);
    setShareError("");
    setShareUrl("");
    setCopied(false);
    try {
      const png = canvas.toDataURL("image/png");
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ png }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Could not create link.");
      setShareUrl(`${window.location.origin}/wc-26-player/${json.id}`);
    } catch (err) {
      setShareError(
        err instanceof Error ? err.message : "Could not create link.",
      );
    } finally {
      setSharing(false);
    }
  }

  function copyShare() {
    if (!shareUrl) return;
    navigator.clipboard?.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="container page fp-page">
      <header className="page-head fp-head">
        <span className="eyebrow mono">Card generator</span>
        <h1>
          Turn anyone into a <span className="grad">collectible card.</span>
        </h1>
        <p className="page-lead">
          A star striker, your five-a-side captain, your mate, even your dog —
          drop in any photo, tweak the stats, and walk away with a
          World-Cup-2026-style card you can download or send. No Photoshop, no
          sign-up.
        </p>
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
            <div className="fp-upload">
              <span className="fp-or">or</span>
              <label className="btn btn-ghost btn-sm fp-upload-btn">
                Upload from device
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  disabled={loading}
                  hidden
                />
              </label>
            </div>
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

          <div className="fp-row fp-row-3">
            <label className="fp-field">
              <span>ATK</span>
              <input
                type="number"
                value={data.atk}
                onChange={(e) => set("atk", e.target.value)}
              />
            </label>
            <label className="fp-field">
              <span>DEF</span>
              <input
                type="number"
                value={data.def}
                onChange={(e) => set("def", e.target.value)}
              />
            </label>
            <label className="fp-field">
              <span>SPEED</span>
              <input
                type="number"
                value={data.speed}
                onChange={(e) => set("speed", e.target.value)}
              />
            </label>
          </div>

          <button type="button" className="btn btn-primary" onClick={download}>
            Download card ↓
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={createScratchLink}
            disabled={sharing}
          >
            {sharing ? "Creating link…" : "Create scratch link 🪙"}
          </button>

          {shareError && <small className="fp-error">{shareError}</small>}

          {shareUrl && (
            <div className="fp-share">
              <p className="fp-hint">
                Send this link — they&apos;ll scratch the card to reveal it:
              </p>
              <div className="fp-url-row">
                <input readOnly value={shareUrl} onFocus={(e) => e.target.select()} />
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={copyShare}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}
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

      <section className="fp-landing" aria-label="How it works">
        <figure className="fp-banner">
          <NextImage
            src={exampleCards}
            alt="Example World Cup 2026 player cards for Messi, Mbappé, and Haaland"
            sizes="(max-width: 1200px) 100vw, 1104px"
            placeholder="blur"
          />
          <figcaption className="fp-banner-cap mono">
            Made in seconds — one photo each, no design tools.
          </figcaption>
        </figure>

        <ol className="fp-steps">
          <li className="fp-step">
            <span className="fp-step-no mono">01</span>
            <h3>Add a photo</h3>
            <p>
              Paste an image URL or upload from your device. The background is
              removed automatically, right in your browser.
            </p>
          </li>
          <li className="fp-step">
            <span className="fp-step-no mono">02</span>
            <h3>Fill in the details</h3>
            <p>
              Name, nation, club, and the ATK / DEF / SPEED ratings. The preview
              redraws live with every keystroke.
            </p>
          </li>
          <li className="fp-step">
            <span className="fp-step-no mono">03</span>
            <h3>Download or share</h3>
            <p>
              Save a high-res PNG, or generate a scratch-to-reveal link your
              friends uncover coin by coin.
            </p>
          </li>
        </ol>

        <ul className="fp-feature-grid">
          <li className="fp-feature">
            <span className="fp-feature-tag mono">In-browser</span>
            <p>Background removal runs on your device — your photo never leaves it.</p>
          </li>
          <li className="fp-feature">
            <span className="fp-feature-tag mono">Every nation</span>
            <p>Pick from all World Cup flags and colorways for the frame.</p>
          </li>
          <li className="fp-feature">
            <span className="fp-feature-tag mono">Scratch links</span>
            <p>Send a card as a coin-scratch surprise instead of a plain image.</p>
          </li>
          <li className="fp-feature">
            <span className="fp-feature-tag mono">Free</span>
            <p>No account, no watermark, no limits on how many you make.</p>
          </li>
        </ul>

        <div className="fp-landing-cta">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
          >
            Make your card ↑
          </button>
          <span className="fp-landing-cta-note mono">Takes about a minute.</span>
        </div>
      </section>
    </div>
  );
}
