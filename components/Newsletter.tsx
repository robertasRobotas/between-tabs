"use client";

import { useState } from "react";

type Props = {
  variant?: "band" | "inline";
};

export default function Newsletter({ variant = "band" }: Props) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setDone(true);
    // Placeholder: wire up to your ESP (Buttondown, ConvertKit, Resend…) here.
  }

  return (
    <section className={`newsletter newsletter-${variant}`}>
      <div className="newsletter-inner">
        <div className="newsletter-copy">
          <span className="eyebrow mono">The BehindTabs newsletter</span>
          <h2>Software that changes real work, in your inbox.</h2>
          <p>
            One considered email, most Fridays. No hype, no tool dumps — just the
            pieces worth reading. Unsubscribe anytime.
          </p>
        </div>

        {done ? (
          <p className="newsletter-done" role="status">
            You&apos;re on the list. Check your inbox to confirm.
          </p>
        ) : (
          <form className="newsletter-form" onSubmit={onSubmit} noValidate>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@work.com"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Subscribe
            </button>
            {error && <span className="newsletter-error">{error}</span>}
          </form>
        )}
      </div>
    </section>
  );
}
