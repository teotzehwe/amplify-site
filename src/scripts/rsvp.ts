import { performing } from '../data/rsvpQuestions';

// Google Apps Script Web App that appends each RSVP as a row in the Sheet.
// To change the destination, redeploy the script and paste the new /exec URL here.
const ENDPOINT =
  'https://script.google.com/macros/s/AKfycbz6AOo8nf2wnYSzC2DC68rxXR8eyT33-Z7f7Ydzo3-gfi_pz_HAU_aX5LgcoxqE1VuI/exec';

export function initRsvp() {
  const form = document.getElementById('rsvp-form') as HTMLFormElement | null;
  if (!form) return;

  const instrumentsBlock = document.getElementById('q-instruments');
  const optout = document.getElementById('optout-btn');
  const errorBox = document.getElementById('rsvp-error');
  const successBox = document.getElementById('rsvp-success');

  const selectedValues = (group: string): string[] =>
    [...form.querySelectorAll(`.q-chips[data-group="${group}"] .chip.selected`)].map(
      (c) => (c as HTMLElement).dataset.value ?? '',
    );

  function updateInstruments() {
    if (!instrumentsBlock) return;
    const show = selectedValues('music').some((v) => performing.includes(v));
    instrumentsBlock.style.display = show ? 'block' : 'none';
    if (!show) instrumentsBlock.querySelectorAll('.chip.selected').forEach((c) => c.classList.remove('selected'));
  }

  // Chip selection (single = radio-like, multi = toggle)
  form.querySelectorAll<HTMLElement>('.q-chips').forEach((group) => {
    const single = group.dataset.select === 'single';
    group.querySelectorAll<HTMLButtonElement>('.chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        if (single) {
          group.querySelectorAll('.chip').forEach((c) => c.classList.remove('selected'));
          chip.classList.add('selected');
        } else {
          chip.classList.toggle('selected');
        }
        if (group.dataset.group === 'music') updateInstruments();
      });
    });
  });

  optout?.addEventListener('click', () => optout.classList.toggle('selected'));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nativeOk = form.checkValidity();
    const requiredGroupsOk = [...form.querySelectorAll('.q-chips[data-required]')].every(
      (g) => g.querySelectorAll('.chip.selected').length > 0,
    );
    if (!nativeOk || !requiredGroupsOk) {
      if (!nativeOk) form.reportValidity();
      if (errorBox) errorBox.style.display = 'flex';
      return;
    }
    if (errorBox) errorBox.style.display = 'none';

    const data = new FormData(form);
    const join = (a: string[]) => a.join(', ');
    const payload = {
      timestamp: new Date().toISOString(),
      name: (data.get('name') as string) || '',
      age: selectedValues('age')[0] || '',
      describe: selectedValues('describe')[0] || '',
      school: (data.get('school') as string) || '',
      area: '',
      music: join(selectedValues('music')),
      instruments: join(selectedValues('instruments')),
      listen: join(selectedValues('listen')),
      why: join(selectedValues('why')),
      find: join(selectedValues('find')),
      showup: join(selectedValues('showup')),
      first: selectedValues('first')[0] || '',
      dream: (data.get('dream') as string) || '',
      email: (data.get('email') as string) || '',
      heard: selectedValues('heard')[0] || '',
      mailing_list: optout?.classList.contains('selected') ? 'opted out' : 'subscribed',
    };

    // Fire-and-forget: text/plain avoids a CORS preflight; no-cors avoids an unreadable-response error.
    if (ENDPOINT.startsWith('http')) {
      try {
        fetch(ENDPOINT, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        }).catch(() => {});
      } catch {
        /* ignore network errors — submission is best-effort */
      }
    }

    form.style.display = 'none';
    if (successBox) successBox.style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
