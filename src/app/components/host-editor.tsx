"use client";

import { useActionState } from "react";
import { updateInvitation, type InvitationState } from "@/app/actions";
import type { Invitation } from "@/lib/types";

const initial: InvitationState = {};

export function HostEditor({ invitation, token }: { invitation: Invitation; token: string }) {
  const [state, action, pending] = useActionState(updateInvitation, initial);

  return (
    <form action={action} className="fields">
      <input type="hidden" name="token" value={token} />
      {state.error ? <p className="banner error" role="alert">{state.error}</p> : null}
      {state.savedAt ? <p className="banner" role="status">Invitation saved. The public page shows this text.</p> : null}
      <label className="field">
        <span>Title</span>
        <input type="text" name="title" required maxLength={120} defaultValue={invitation.title} />
      </label>
      <label className="field">
        <span>Host name</span>
        <input type="text" name="hostName" required maxLength={80} defaultValue={invitation.hostName} autoComplete="name" />
      </label>
      <label className="field">
        <span>Date and time (optional)</span>
        <input
          type="text"
          name="startsAt"
          maxLength={120}
          defaultValue={invitation.startsAt}
          placeholder="Add a date and time"
        />
      </label>
      <label className="field">
        <span>Place (optional)</span>
        <input type="text" name="place" maxLength={200} defaultValue={invitation.place} placeholder="Add a place" />
      </label>
      <label className="field">
        <span>Message</span>
        <textarea name="message" maxLength={2000} rows={5} defaultValue={invitation.message} />
      </label>
      <button className="button" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save invitation"}
      </button>
    </form>
  );
}
