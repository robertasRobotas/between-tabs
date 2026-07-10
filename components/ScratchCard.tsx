"use client";

import { useEffect, useRef, useState } from "react";

const CARD_W = 1080;
const CARD_H = 1440;
const BRUSH = 70; // erase radius in card pixels
const REVEAL_AT = 0.2; // auto-reveal once this fraction is scratched

export default function ScratchCard({ id }: { id: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coinRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const revealed = useRef(false);
  const storageKey = `wc26-scratch:${id}`;

  const [imgError, setImgError] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  // paint the silver cover
  function paintCover(ctx: CanvasRenderingContext2D) {
    const g = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
    g.addColorStop(0, "#c7ccd1");
    g.addColorStop(0.45, "#eef1f3");
    g.addColorStop(0.55, "#b9bfc5");
    g.addColorStop(1, "#d6dade");
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    ctx.fillStyle = "rgba(90,100,110,0.85)";
    ctx.font = '800 68px Arial, sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SCRATCH TO REVEAL", CARD_W / 2, CARD_H / 2 - 30);
    ctx.font = '400 54px Arial, sans-serif';
    ctx.fillText("🪙", CARD_W / 2, CARD_H / 2 + 60);
  }

  // set up the cover canvas (restore saved scratch state if any)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const saved = localStorage.getItem(storageKey);
    if (saved === "done") {
      ctx.clearRect(0, 0, CARD_W, CARD_H);
      revealed.current = true;
      setDone(true);
      return;
    }
    if (saved) {
      const restore = new Image();
      restore.onload = () => {
        ctx.clearRect(0, 0, CARD_W, CARD_H);
        ctx.drawImage(restore, 0, 0, CARD_W, CARD_H);
      };
      restore.src = saved;
    } else {
      paintCover(ctx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  function toCardCoords(e: React.PointerEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CARD_W,
      y: ((e.clientY - rect.top) / rect.height) * CARD_H,
    };
  }

  function scratchAt(x: number, y: number) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, BRUSH, 0, Math.PI * 2);
    ctx.fill();
  }

  function clearedFraction(ctx: CanvasRenderingContext2D): number {
    const step = 16;
    const data = ctx.getImageData(0, 0, CARD_W, CARD_H).data;
    let clear = 0;
    let total = 0;
    for (let y = 0; y < CARD_H; y += step) {
      for (let x = 0; x < CARD_W; x += step) {
        total++;
        if (data[(y * CARD_W + x) * 4 + 3] === 0) clear++;
      }
    }
    return clear / total;
  }

  function persist() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (revealed.current) {
      localStorage.setItem(storageKey, "done");
      return;
    }
    if (clearedFraction(ctx) >= REVEAL_AT) {
      ctx.clearRect(0, 0, CARD_W, CARD_H);
      revealed.current = true;
      setDone(true);
      localStorage.setItem(storageKey, "done");
      return;
    }
    try {
      localStorage.setItem(storageKey, canvas.toDataURL("image/png"));
    } catch {
      /* storage full — ignore */
    }
  }

  function share(network: string) {
    const url = window.location.href;
    const text = "Check out my World Cup 26 player card!";
    const enc = encodeURIComponent;
    const webUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
      x: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
    };
    if (webUrls[network]) {
      window.open(webUrls[network], "_blank", "noopener,noreferrer,width=640,height=640");
      return;
    }
    // Instagram / Snapchat have no web link-share — use the native sheet or copy.
    if (navigator.share) {
      navigator.share({ title: text, text, url }).catch(() => {});
      return;
    }
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function downloadCard() {
    const a = document.createElement("a");
    a.href = `/api/cards/${id}`;
    a.download = "wc26-card.png";
    a.click();
  }

  function moveCoin(e: React.PointerEvent) {
    const wrap = wrapRef.current;
    const coin = coinRef.current;
    if (!wrap || !coin) return;
    const rect = wrap.getBoundingClientRect();
    coin.style.left = `${e.clientX - rect.left}px`;
    coin.style.top = `${e.clientY - rect.top}px`;
  }

  function onDown(e: React.PointerEvent) {
    if (revealed.current) return;
    drawing.current = true;
    canvasRef.current?.setPointerCapture(e.pointerId);
    const { x, y } = toCardCoords(e);
    scratchAt(x, y);
  }
  function onMove(e: React.PointerEvent) {
    moveCoin(e);
    if (!drawing.current || revealed.current) return;
    const { x, y } = toCardCoords(e);
    scratchAt(x, y);
  }
  function onUp() {
    if (!drawing.current) return;
    drawing.current = false;
    persist();
  }

  const shareButtons: { key: string; label: string; icon: React.ReactNode }[] = [
    {
      key: "facebook",
      label: "Facebook",
      icon: (
        <svg viewBox="4.5 4.5 23 23" fill="currentColor" className="share-ico">
          <path d="M21.95 5.005l-3.306-.004c-3.206 0-5.277 2.124-5.277 5.415v2.495H10.05v4.515h3.317l-.004 9.575h4.641l.004-9.575h3.806l-.003-4.514h-3.803v-2.117c0-1.018.241-1.533 1.566-1.533l2.366-.001.01-4.256z" />
        </svg>
      ),
    },
    {
      key: "instagram",
      label: "Instagram",
      icon: (
        <svg viewBox="1 1 22 22" fill="none" className="share-ico">
          <path
            d="M3 11C3 7.22876 3 5.34315 4.17157 4.17157C5.34315 3 7.22876 3 11 3H13C16.7712 3 18.6569 3 19.8284 4.17157C21 5.34315 21 7.22876 21 11V13C21 16.7712 21 18.6569 19.8284 19.8284C18.6569 21 16.7712 21 13 21H11C7.22876 21 5.34315 21 4.17157 19.8284C3 18.6569 3 16.7712 3 13V11Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="16.5" cy="7.5" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      key: "x",
      label: "X",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="share-ico">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="share-ico">
          <path
            transform="translate(-124, -7319)"
            fillRule="evenodd"
            d="M144,7339 L140,7339 L140,7332.001 C140,7330.081 139.153,7329.01 137.634,7329.01 C135.981,7329.01 135,7330.126 135,7332.001 L135,7339 L131,7339 L131,7326 L135,7326 L135,7327.462 C135,7327.462 136.255,7325.26 139.083,7325.26 C141.912,7325.26 144,7326.986 144,7330.558 L144,7339 L144,7339 Z M126.442,7323.921 C125.093,7323.921 124,7322.819 124,7321.46 C124,7320.102 125.093,7319 126.442,7319 C127.79,7319 128.883,7320.102 128.883,7321.46 C128.884,7322.819 127.79,7323.921 126.442,7323.921 L126.442,7323.921 Z M124,7339 L129,7339 L129,7326 L124,7326 L124,7339 Z"
          />
        </svg>
      ),
    },
    {
      key: "snapchat",
      label: "Snapchat",
      icon: (
        <svg viewBox="14 14 164 164" fill="none" className="share-ico">
          <path
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="12"
            d="M95.918 22.002c-11.963-.087-24.145 4.54-32.031 13.717-6.995 7.405-9.636 17.901-9.284 27.868-.03 5.119.032 10.237.05 15.355-4.901-1.217-9.873-4.624-15.063-2.937-4.422 1.313-6.267 7.088-3.596 10.791 2.876 3.761 7.346 5.907 11.08 8.71 1.837 1.5 4.313 2.571 5.68 4.499-.001 4.62-2.425 8.897-4.722 12.786-5.597 8.802-14.342 15.531-23.705 20.18-2.39 1.035-4.59 4.144-2.473 6.499 3.862 3.622 9.327 4.778 14.195 6.486 2.047.64 5.078 1.34 4.886 4.084.335 2.923 2.205 6.066 5.492 6.078 7.873.91 16.289.522 23.345 4.741 6.917 4.006 14.037 8.473 22.255 8.96 8.188.767 16.623-.888 23.642-5.255 5.23-2.884 10.328-6.477 16.456-7.061 5.155-1.206 10.702-.151 15.685-2.072 3.193-1.367 2.762-5.244 4.104-7.808 2.532-1.747 5.77-1.948 8.59-3.102 3.687-1.47 8.335-2.599 10.268-6.413 1.148-3.038-2.312-4.698-4.453-5.88-11.38-5.874-21.631-14.921-26.121-27.191-.496-1.936-2.279-4.834.084-6.255 4.953-4.176 11.413-6.575 15.514-11.715 3.103-3.884.941-10.55-4.141-11.322-4.928-.78-9.525 1.893-14.152 3.127-.404-8.53.502-17.232-.776-25.746-2.429-13.808-13.514-25.157-26.813-29.124-4.521-1.401-9.266-2.037-13.996-2Z"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      <div className="scratch-wrap" ref={wrapRef}>
        {imgError ? (
          <div className="scratch-missing">
            This card link is invalid or expired.
          </div>
        ) : (
          <>
            {/* revealed card underneath */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/cards/${id}`}
              alt="Player card"
              className="scratch-card-img"
              onError={() => setImgError(true)}
            />
            <canvas
              ref={canvasRef}
              width={CARD_W}
              height={CARD_H}
              className={`scratch-canvas${done ? " is-done" : ""}`}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerLeave={onUp}
            />
            <div ref={coinRef} className="scratch-coin" aria-hidden>
              🪙
            </div>
          </>
        )}
      </div>

      {done && !imgError && (
        <div className="share-bar">
          <button
            type="button"
            className="btn btn-primary"
            onClick={downloadCard}
          >
            Download card ↓
          </button>
          <span className="share-bar-label">Share</span>
          <div className="share-bar-btns">
            {shareButtons.map((b) => (
              <button
                key={b.key}
                type="button"
                className={`share-btn share-${b.key}`}
                onClick={() => share(b.key)}
                aria-label={`Share on ${b.label}`}
                title={`Share on ${b.label}`}
              >
                {b.icon}
              </button>
            ))}
          </div>
          {copied && <span className="share-copied">Link copied!</span>}
        </div>
      )}
    </>
  );
}
