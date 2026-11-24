import { notFound } from "next/navigation";
import { CopyLink } from "@/app/components/copy-link";
import { HostEditor } from "@/app/components/host-editor";
import { comingSummary, getInvitation, hostTokenMatches, listInvitees } from "@/lib/event";
import { requestOrigin } from "@/lib/origin";
import { isHostToken } from "@/lib/validate";

const STATUS_LABEL = { yes: "Yes", no: "No", maybe: "Maybe" } as const;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function formatUpdated(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

export default async function HostPage({ params }: { params: Promise<{ token: string }> }) {
  const raw = (await params).token;
  let token = "";
  try {
    token = decodeURIComponent(raw);
  } catch {
    notFound();
  }
  if (!isHostToken(token) || !(await hostTokenMatches(token))) notFound();

  const [{ invitees, counts }, origin, current] = await Promise.all([
    listInvitees(),
    requestOrigin(),
    getInvitation(),
  ]);
  const publicUrl = origin ? `${origin}/` : "/";
  const summary = comingSummary(counts);

  return (
    <main className="wrap">
      <article className="card">
        <p className="eyebrow">Host</p>
        <h1>Edit invitation</h1>
        <p className="lede">You can change the wording only. The layout stays the same.</p>

        <section className="block">
          <h2>Public link</h2>
          <p className="hint">Anyone with this link can view the invitation and RSVP. It does not open this page.</p>
          <CopyLink url={publicUrl} />
          <p className="hint">
            <a className="text-link" href="/" rel="noreferrer">Open the invitation</a>
          </p>
        </section>

        <section className="block">
          <h2>Invitation text</h2>
          <HostEditor invitation={current} token={token} />
        </section>

        <section className="block">
          <h2>RSVPs</h2>
          <ul className="counts">
            <li>Yes {counts.yes}</li>
            <li>No {counts.no}</li>
            <li>Maybe {counts.maybe}</li>
          </ul>
          {summary ? <p className="coming">{summary}</p> : null}
          {invitees.length === 0 ? (
            <p className="empty">No RSVPs yet. Share the invitation link and responses will show up here.</p>
          ) : (
            <ul className="guests">
              {invitees.map((invitee) => (
                <li className="guest" key={invitee.id}>
                  <div className="guest-top">
                    <strong>{invitee.name}</strong>
                    <span className={`status ${invitee.status}`}>
                      <span aria-hidden="true" />
                      {STATUS_LABEL[invitee.status]}
                    </span>
                  </div>
                  {invitee.additionalGuests > 0 ? (
                    <p className="extra">
                      +{invitee.additionalGuests} {invitee.additionalGuests === 1 ? "guest" : "guests"}
                    </p>
                  ) : null}
                  {invitee.note ? <p className="note">{invitee.note}</p> : null}
                  <p className="when">Updated {formatUpdated(invitee.updatedAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </article>
    </main>
  );
}
