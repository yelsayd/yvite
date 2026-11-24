import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { sql } from "@/lib/db";
import {
  DEFAULT_INVITATION,
  GUEST_LIST_LIMIT,
  type Invitation,
  type Invitee,
  type RsvpCounts,
  type RsvpStatus,
} from "@/lib/types";
import { hostTokenFromEnv } from "@/lib/validate";

type EventRow = {
  title: string;
  host_name: string;
  message: string;
  starts_at: string;
  place: string;
  host_token: string;
};

type InviteeRow = {
  id: number | string;
  name: string;
  status: RsvpStatus;
  additional_guests: number | string;
  note: string;
  updated_at: Date | string;
};

let warnedInvalidHostToken = false;
let rememberedLocalToken = false;

function configuredHostToken(): string | null {
  const raw = process.env.HOST_TOKEN;
  const token = hostTokenFromEnv(raw);
  if ((raw?.trim() ?? "") !== "" && token === null && !warnedInvalidHostToken) {
    warnedInvalidHostToken = true;
    console.warn("HOST_TOKEN was ignored because it must be 16–128 URL-safe characters.");
  }
  return token;
}

function tokensMatch(stored: string, provided: string): boolean {
  const left = createHash("sha256").update(stored).digest();
  const right = createHash("sha256").update(provided).digest();
  return timingSafeEqual(left, right);
}

function toIso(value: Date | string): string {
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

function mapInvitation(row: EventRow): Invitation {
  return {
    title: row.title,
    hostName: row.host_name,
    message: row.message,
    startsAt: row.starts_at,
    place: row.place,
  };
}

async function rememberLocalToken(token: string): Promise<void> {
  if ((process.env.DATABASE_URL?.trim() ?? "") !== "" || rememberedLocalToken) return;
  rememberedLocalToken = true;
  const dir = path.join(process.cwd(), ".data");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "host-token"), `${token}\n`, { mode: 0o600 });
}

export const ensureEvent = cache(async function ensureEvent(): Promise<{ invitation: Invitation; hostToken: string }> {
  const envToken = configuredHostToken();
  await sql(
    `insert into events (id, title, host_name, message, starts_at, place, host_token)
     values (1, $1, $2, $3, $4, $5, $6)
     on conflict (id) do nothing`,
    [
      DEFAULT_INVITATION.title,
      DEFAULT_INVITATION.hostName,
      DEFAULT_INVITATION.message,
      DEFAULT_INVITATION.startsAt,
      DEFAULT_INVITATION.place,
      envToken ?? randomBytes(24).toString("base64url"),
    ],
  );

  if (envToken) {
    await sql("update events set host_token = $1 where id = 1 and host_token is distinct from $1", [envToken]);
  }

  const rows = await sql<EventRow>(
    "select title, host_name, message, starts_at, place, host_token from events where id = 1",
  );
  const row = rows[0];
  if (!row) throw new Error("Invitation could not be loaded.");
  await rememberLocalToken(row.host_token);
  return { invitation: mapInvitation(row), hostToken: row.host_token };
});

export const getInvitation = cache(async function getInvitation(): Promise<Invitation> {
  const event = await ensureEvent();
  return event.invitation;
});

export async function hostTokenMatches(provided: string): Promise<boolean> {
  const event = await ensureEvent();
  return tokensMatch(event.hostToken, provided);
}

export async function saveInvitation(invitation: Invitation): Promise<void> {
  await ensureEvent();
  await sql(
    `update events
     set title = $1, host_name = $2, message = $3, starts_at = $4, place = $5, updated_at = now()
     where id = 1`,
    [invitation.title, invitation.hostName, invitation.message, invitation.startsAt, invitation.place],
  );
}

export async function saveRsvp(input: {
  name: string;
  nameKey: string;
  status: RsvpStatus;
  additionalGuests: number;
  note: string;
}): Promise<{ error: string } | { ok: true }> {
  await ensureEvent();
  const existing = await sql<{ id: number }>("select id from invitees where name_key = $1", [input.nameKey]);
  if (existing.length === 0) {
    const counts = await sql<{ n: number | string }>("select count(*)::int as n from invitees");
    if (Number(counts[0]?.n ?? 0) >= GUEST_LIST_LIMIT) {
      return { error: "The guest list is full." };
    }
  }

  await sql(
    `insert into invitees (name, name_key, status, additional_guests, note)
     values ($1, $2, $3, $4, $5)
     on conflict (name_key) do update set
       name = excluded.name,
       status = excluded.status,
       additional_guests = excluded.additional_guests,
       note = excluded.note,
       updated_at = now()`,
    [input.name, input.nameKey, input.status, input.additionalGuests, input.note],
  );
  return { ok: true };
}

export async function listInvitees(): Promise<{ invitees: Invitee[]; counts: RsvpCounts }> {
  await ensureEvent();
  const rows = await sql<InviteeRow>(
    `select id, name, status, additional_guests, note, updated_at
     from invitees
     order by updated_at desc, id desc`,
  );
  const invitees = rows.map((row) => ({
    id: Number(row.id),
    name: row.name,
    status: row.status,
    additionalGuests: Number(row.additional_guests),
    note: row.note,
    updatedAt: toIso(row.updated_at),
  }));
  const counts: RsvpCounts = { yes: 0, no: 0, maybe: 0, coming: 0, additionalComing: 0 };
  for (const invitee of invitees) {
    counts[invitee.status] += 1;
    if (invitee.status === "yes") {
      counts.coming += 1 + invitee.additionalGuests;
      counts.additionalComing += invitee.additionalGuests;
    }
  }
  return { invitees, counts };
}

export function comingSummary(counts: RsvpCounts): string {
  if (counts.coming === 0) return "";
  const people = counts.coming === 1 ? "1 person coming" : `${counts.coming} people coming`;
  return counts.additionalComing > 0 ? `${people}, including additional guests` : people;
}
