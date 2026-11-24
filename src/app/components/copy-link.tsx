"use client";

import { useState } from "react";

export function CopyLink({ url }: { url: string }) {
  const [message, setMessage] = useState("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Copied.");
    } catch {
      setMessage("Select the link and copy it.");
    }
  }

  return (
    <div>
      <div className="copylink">
        <input readOnly value={url} aria-label="Public invitation link" onFocus={(event) => event.currentTarget.select()} />
        <button className="button secondary" type="button" onClick={() => void copy()}>
          Copy
        </button>
      </div>
      {message ? <p className="hint" role="status">{message}</p> : null}
    </div>
  );
}
