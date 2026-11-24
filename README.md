# yvite

A single invitation page. Anyone with the public link can read it and RSVP. The host edits the wording and reads responses on a separate unlisted page. There is no guest account and no theme or layout settings.

## Pages

- Public invitation: `/`
- Host editor: `/host/<token>`

The token is stored in the database (`events.host_token`). It is not committed in this repository.

- Locally, the first run writes it to `.data/host-token`.
- On the published app, set `HOST_TOKEN` to a private string of 16–128 letters, numbers, hyphens, or underscores. The editor path is `/host/` plus that value. If it is unset, the app creates a random token and stores it in the database.

## Invitation

The starter text is a Ramadan Iftar hosted by Yasser Elsayed, with a short note that the date and place are still to be added. Date, time, and place are blank until the host fills them in.

On the host page, edit the title, host name, date and time, place, and message, then save. The public page uses that text. Yes, no, and maybe responses are listed there with counts. Sending the same name again updates that response (names match without regard to case).

## Develop

```bash
npm install
env -u DATABASE_URL npm run dev
```

With `DATABASE_URL` set, the app uses Postgres. Without it, it uses a local database in `.data/pglite`. Schema changes live in `migrations/` and run at the end of `npm run build` when a database URL is present.
