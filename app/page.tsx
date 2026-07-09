import Link from "next/link";

// Placeholder landing page — real content to be added later.
export default function Home() {
  return (
    <div className="container">
      <section className="hero">
        <span className="badge">🏆 Behind Tabs</span>
        <h1>
          Welcome to <span className="grad">Behind Tabs</span>
        </h1>
        <p className="lead">
          This is a placeholder landing page. Tell me what you&apos;d like here
          and I&apos;ll build it out. In the meantime, the World Cup 2026
          prediction game is ready to play.
        </p>
        <div className="hero-cta">
          <Link href="/wc2026" className="btn btn-primary">
            🏆 WC 2026 Predictions
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="features">
          <div className="card feature">
            <span className="emoji">🧠</span>
            <h3>Predict the bracket</h3>
            <p>Pick winners from the knockout stage all the way to the champion.</p>
          </div>
          <div className="card feature">
            <span className="emoji">👥</span>
            <h3>Play with friends</h3>
            <p>Create a group, share the link, and compete on one leaderboard.</p>
          </div>
          <div className="card feature">
            <span className="emoji">🥇</span>
            <h3>See who&apos;s closest</h3>
            <p>Results roll in and everyone is scored automatically.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
