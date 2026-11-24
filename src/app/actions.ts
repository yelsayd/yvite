"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { hostTokenMatches, saveInvitation, saveRsvp } from "@/lib/event";
import type { RsvpStatus } from "@/lib/types";
import { isHostToken, parseInvitation, parseRsvp } from "@/lib/validate";

export type RsvpState = {
  error?: string;
  ok?: { name: string; status: RsvpStatus };
};

export type InvitationState = {
  error?: string;
  savedAt?: number;
};

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function submitRsvp(_prev: RsvpState, formData: FormData): Promise<RsvpState> {
  const parsed = parseRsvp({
    name: field(formData, "name"),
    status: field(formData, "status"),
    additionalGuests: field(formData, "additionalGuests"),
    note: field(formData, "note"),
  });
  if ("error" in parsed) return { error: parsed.error };

  const saved = await saveRsvp(parsed);
  if ("error" in saved) return { error: saved.error };

  revalidatePath("/", "layout");
  return { ok: { name: parsed.name, status: parsed.status } };
}

export async function updateInvitation(_prev: InvitationState, formData: FormData): Promise<InvitationState> {
  const token = field(formData, "token");
  if (!isHostToken(token) || !(await hostTokenMatches(token))) notFound();

  const parsed = parseInvitation({
    title: field(formData, "title"),
    hostName: field(formData, "hostName"),
    startsAt: field(formData, "startsAt"),
    place: field(formData, "place"),
    message: field(formData, "message"),
  });
  if ("error" in parsed) return { error: parsed.error };

  await saveInvitation(parsed);
  revalidatePath("/", "layout");
  return { savedAt: Date.now() };
}
