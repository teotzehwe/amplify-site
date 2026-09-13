import type { APIRoute } from 'astro';

// On-demand: this route runs as a Vercel function. Every other route stays static.
export const prerender = false;

// Google Apps Script Web App that appends each RSVP as a row in the Sheet.
// To change the destination, redeploy the script and paste the new /exec URL here.
//
// This lives server-side on purpose. The browser never sees it, so the sheet
// can't be spammed directly by anyone reading the page source — and because
// there's no CORS to work around here, we can actually read the response and
// tell the person whether their RSVP really landed.
const ENDPOINT =
  'https://script.google.com/macros/s/AKfycbw7zrCatMpgPleF6SRm_6qFp5FDOY2wzZ0dl1QZqgi22-FCJH9A9_yLcDQFwcysqozm/exec';

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

/** Trim, cap length, and reject anything that isn't a string. */
const text = (v: unknown, max = 200): string =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

/** The sheet wants one cell per question, so multi-selects arrive as arrays and go in joined. */
const joined = (v: unknown): string =>
  Array.isArray(v)
    ? v.filter((x): x is string => typeof x === 'string')
        .map((x) => x.trim())
        .filter(Boolean)
        .slice(0, 40)
        .join(', ')
    : '';

/** Singapore local time as `YYYY/MM/DD HH:MM.SS` (period before seconds). */
const SG_TZ = 'Asia/Singapore';
const sgParts = new Intl.DateTimeFormat('en-GB', {
  timeZone: SG_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});
const formatSgTimestamp = (d = new Date()): string => {
  const p = Object.fromEntries(
    sgParts.formatToParts(d).filter((x) => x.type !== 'literal').map((x) => [x.type, x.value]),
  );
  return `${p.year}/${p.month}/${p.day} ${p.hour}:${p.minute}.${p.second}`;
};

// Telegram's own rule: 5-32 chars, starts with a letter, letters/digits/
// underscores only. Stored lowercased and without the leading @ so the same
// person is recognisable however they typed it.
const TELEGRAM = /^[a-z][a-z0-9_]{4,31}$/;
const handle = (v: unknown): string => text(v, 40).replace(/^@+/, '').toLowerCase();

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'that request looked malformed — please try again.' }, 400);
  }

  const name = text(body.name);
  const telegram = handle(body.telegram);

  if (!name) {
    return json({ error: 'please tell us your name.' }, 400);
  }
  if (!TELEGRAM.test(telegram)) {
    return json(
      { error: "that telegram username doesn't look right — 5–32 letters, numbers or underscores, starting with a letter." },
      400,
    );
  }

  // Column-for-column the shape the Apps Script HEADERS already expects.
  // Removed form fields are sent as empty strings so sheet columns stay aligned.
  const row = {
    timestamp: formatSgTimestamp(),
    name,
    age: text(body.age),
    describe: text(body.describe),
    school: '',
    area: '',
    music: '',
    instruments: joined(body.instruments),
    listen: '',
    why: '',
    find: '',
    showup: '',
    first: '',
    dream: '',
    telegram,
    heard: text(body.heard),
    mailing_list: 'subscribed',
    event: text(body.event_slug, 100),
  };

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(row),
      // The script takes a lock and waits up to 30s under contention, so give
      // it room — a premature abort here would report failure for a row that
      // actually landed.
      signal: AbortSignal.timeout(28_000),
    });

    if (!res.ok) {
      console.error('[rsvp] apps script returned', res.status);
      return json({ error: "we couldn't save your rsvp just then. please try again." }, 500);
    }

    const reply = await res.text();

    // A Web App that isn't deployed for "anyone" answers 200 with a Google
    // sign-in page instead of running the script, which would otherwise look
    // exactly like success.
    if (/accounts\.google\.com|<title>\s*Sign in/i.test(reply)) {
      console.error('[rsvp] apps script is not publicly deployed — got a sign-in page');
      return json({ error: "we couldn't save your rsvp just then. please try again." }, 500);
    }

    // The script answers 200 even when it failed, reporting the problem as
    // {ok:false} in the body. Trusting the status code alone would tell people
    // they're on the list when the row was never written.
    let parsed: { ok?: boolean; error?: string } | null = null;
    try {
      parsed = JSON.parse(reply);
    } catch {
      console.error('[rsvp] apps script gave a non-JSON reply:', reply.slice(0, 200));
      return json({ error: "we couldn't save your rsvp just then. please try again." }, 500);
    }
    if (!parsed || parsed.ok !== true) {
      console.error('[rsvp] apps script reported failure:', parsed?.error ?? reply.slice(0, 200));
      return json({ error: "we couldn't save your rsvp just then. please try again." }, 500);
    }
  } catch (err) {
    console.error('[rsvp] request to apps script failed:', err);
    return json({ error: "we couldn't save your rsvp just then. please try again." }, 500);
  }

  return json({ ok: true }, 200);
};
