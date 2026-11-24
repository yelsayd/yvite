import type { Metadata } from "next";
import { RsvpForm } from "@/app/components/rsvp-form";
import { getInvitation } from "@/lib/event";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata(): Promise<Metadata> {
  const invitation = await getInvitation();
  return { title: invitation.title };
}

export default async function InvitationPage() {
  const invitation = await getInvitation();
  const when = invitation.startsAt.trim();
  const where = invitation.place.trim();

  return (
    <main className="wrap">
      <article className="card">
        <p className="eyebrow">You’re invited</p>
        <h1>{invitation.title}</h1>
        <p className="host">Hosted by {invitation.hostName}</p>
        <dl className="facts">
          <div>
            <dt>When</dt>
            <dd className={when ? undefined : "placeholder"}>
              {when || "Date and time to be announced"}
            </dd>
          </div>
          <div>
            <dt>Where</dt>
            <dd className={where ? undefined : "placeholder"}>
              {where || "Place to be announced"}
            </dd>
          </div>
        </dl>
        {invitation.message ? <p className="message">{invitation.message}</p> : null}
        <RsvpForm />
      </article>
    </main>
  );
}
