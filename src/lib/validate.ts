import { RSVP_STATUSES, type Invitation, type RsvpStatus } from "@/lib/types";

const TOKEN_RE = /^[A-Za-z0-9_-]{16,128}$/;

export function hostTokenFromEnv(value: string | undefined): string | null {
  const token = value?.trim() ?? "";
  if (token === "") return null;
  return TOKEN_RE.test(token) ? token : null;
}

export function isHostToken(value: string): boolean {
  return TOKEN_RE.test(value);
}

function stripHidden(value: string): string {
  return value.replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\u0000/g, "");
}

export function normalizeName(value: string): string {
  return stripHidden(value).normalize("NFC").trim().replace(/\s+/g, " ");
}

export function nameKey(name: string): string {
  return normalizeName(name).toLocaleLowerCase("en-US");
}

function oneLine(value: string): string {
  return stripHidden(value).normalize("NFC").trim().replace(/\s+/g, " ");
}

export function parseRsvp(input: {
  name: string;
  status: string;
  additionalGuests: string;
  note: string;
}): { error: string } | { name: string; nameKey: string; status: RsvpStatus; additionalGuests: number; note: string } {
  const name = normalizeName(input.name);
  if (name === "") return { error: "Enter your name." };
  if (name.length > 80) return { error: "Name must be 80 characters or fewer." };
  if (!/[\p{L}\p{N}]/u.test(name)) return { error: "Enter a name with at least one letter or number." };

  if (!RSVP_STATUSES.includes(input.status as RsvpStatus)) {
    return { error: "Choose yes, no, or maybe." };
  }

  const guestsRaw = input.additionalGuests.trim();
  let additionalGuests = 0;
  if (guestsRaw !== "") {
    if (!/^\d+$/.test(guestsRaw)) {
      return { error: "Additional guests must be a whole number from 0 to 20." };
    }
    additionalGuests = Number(guestsRaw);
    if (additionalGuests > 20) {
      return { error: "Additional guests must be a whole number from 0 to 20." };
    }
  }

  const note = stripHidden(input.note).replace(/\r\n/g, "\n").trim();
  if (note.length > 500) return { error: "Note must be 500 characters or fewer." };

  return {
    name,
    nameKey: nameKey(name),
    status: input.status as RsvpStatus,
    additionalGuests,
    note,
  };
}

export function parseInvitation(input: {
  title: string;
  hostName: string;
  startsAt: string;
  place: string;
  message: string;
}): { error: string } | Invitation {
  const title = oneLine(input.title);
  const hostName = oneLine(input.hostName);
  const startsAt = oneLine(input.startsAt);
  const place = oneLine(input.place);
  const message = stripHidden(input.message).replace(/\r\n/g, "\n").trim();

  if (title === "") return { error: "Enter a title." };
  if (title.length > 120) return { error: "Title must be 120 characters or fewer." };
  if (hostName === "") return { error: "Enter the host's name." };
  if (hostName.length > 80) return { error: "Host name must be 80 characters or fewer." };
  if (startsAt.length > 120) return { error: "Date and time must be 120 characters or fewer." };
  if (place.length > 200) return { error: "Place must be 200 characters or fewer." };
  if (message.length > 2000) return { error: "Message must be 2000 characters or fewer." };

  return { title, hostName, startsAt, place, message };
}
