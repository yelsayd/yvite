"use client";

import { useActionState } from "react";
import { submitRsvp, type RsvpState } from "@/app/actions";

const initial: RsvpState = {};

function savedMessage(name: string, status: "yes" | "no" | "maybe"): string {
  if (status === "yes") return `${name} is marked as coming.`;
  if (status === "no") return `${name} is marked as not coming.`;
  return `${name} is marked as maybe.`;
}

export function RsvpForm() {
  const [state, action, pending] = useActionState(submitRsvp, initial);

  return (
    <section className="rsvp" id="rsvp">
      <form action={action}>
        <fieldset>
          <legend>Will you come?</legend>
          <div className="choices">
            {(["yes", "no", "maybe"] as const).map((status) => (
              <label className="choice" key={status}>
                <input type="radio" name="status" value={status} required />
                {status === "yes" ? "Yes" : status === "no" ? "No" : "Maybe"}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="fields">
          <label className="field">
            <span>Your name</span>
            <input type="text" name="name" required maxLength={80} autoComplete="name" placeholder="Your name" />
          </label>
          <label className="field">
            <span>Additional guests (optional)</span>
            <input
              type="number"
              name="additionalGuests"
              min={0}
              max={20}
              step={1}
              inputMode="numeric"
              placeholder="0"
              aria-describedby="guests-hint"
            />
            <span className="hint" id="guests-hint">Not counting yourself.</span>
          </label>
          <label className="field">
            <span>Note (optional)</span>
            <textarea name="note" maxLength={500} rows={3} placeholder="Anything the host should know" />
          </label>
          <button className="button" type="submit" disabled={pending}>
            {pending ? "Sending…" : "Send RSVP"}
          </button>
        </div>
      </form>
      {state.error ? (
        <p className="banner error" role="alert">{state.error}</p>
      ) : state.ok ? (
        <p className="banner" role="status">
          {savedMessage(state.ok.name, state.ok.status)} Submit the same name again if this changes.
        </p>
      ) : null}
      <p className="privacy">The host can see your name, response, and note.</p>
    </section>
  );
}
