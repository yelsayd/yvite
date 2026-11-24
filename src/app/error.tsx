"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="wrap">
      <article className="card">
        <p className="eyebrow">Invitation</p>
        <h1>Something went wrong</h1>
        <p className="lede">Please try again in a moment.</p>
        <button className="button retry" type="button" onClick={() => reset()}>
          Try again
        </button>
      </article>
    </main>
  );
}
