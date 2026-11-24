export const RSVP_STATUSES = ["yes", "no", "maybe"] as const;

export type RsvpStatus = (typeof RSVP_STATUSES)[number];

export type Invitation = {
  title: string;
  hostName: string;
  message: string;
  startsAt: string;
  place: string;
};

export type Invitee = {
  id: number;
  name: string;
  status: RsvpStatus;
  additionalGuests: number;
  note: string;
  updatedAt: string;
};

export type RsvpCounts = {
  yes: number;
  no: number;
  maybe: number;
  coming: number;
  additionalComing: number;
};

export const DEFAULT_INVITATION: Invitation = {
  title: "Ramadan Iftar",
  hostName: "Yasser Elsayed",
  message: "You're invited to break the fast together. I'll add the date, time, and place here.",
  startsAt: "",
  place: "",
};

export const GUEST_LIST_LIMIT = 500;
