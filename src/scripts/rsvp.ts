import { performing } from '../data/rsvpQuestions';

export function initRsvp() {
  const form = document.getElementById('rsvp-form') as HTMLFormElement | null;
  if (!form) return;

  const instrumentsBlock = document.getElementById('q-instruments');
  const optout = document.getElementById('optout-btn');
  const errorBox = document.getElementById('rsvp-error');
  const successBox = document.getElementById('rsvp-success');
  const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const submitLabel = submitBtn?.textContent ?? 'count me in ♪';

  const selectedValues = (group: string): string[] =>
    [...form.querySelectorAll(`.q-chips[data-group="${group}"] .chip.selected`)].map(
      (c) => (c as HTMLElement).dataset.value ?? '',
    );

  function showError(message: string) {
    if (!errorBox) return;
    errorBox.textContent = message;
    errorBox.style.display = 'flex';
  }

  function clearError() {
    if (errorBox) errorBox.style.display = 'none';
  }

  function setBusy(busy: boolean) {
    if (!submitBtn) return;
    submitBtn.disabled = busy;
    submitBtn.textContent = busy ? 'sending…' : submitLabel;
    submitBtn.style.opacity = busy ? '0.6' : '1';
    submitBtn.style.cursor = busy ? 'wait' : 'pointer';
  }

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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nativeOk = form.checkValidity();
    const requiredGroupsOk = [...form.querySelectorAll('.q-chips[data-required]')].every(
      (g) => g.querySelectorAll('.chip.selected').length > 0,
    );
    if (!nativeOk || !requiredGroupsOk) {
      if (!nativeOk) form.reportValidity();
      showError('please answer the required questions before you send this in.');
      return;
    }
    clearError();

    const data = new FormData(form);
    const payload = {
      event_slug: form.dataset.event ?? '',
      name: (data.get('name') as string) || '',
      age: selectedValues('age')[0] || '',
      describe: selectedValues('describe')[0] || '',
      school: (data.get('school') as string) || '',
      music: selectedValues('music'),
      instruments: selectedValues('instruments'),
      listen: selectedValues('listen'),
      why: selectedValues('why'),
      find: selectedValues('find'),
      showup: selectedValues('showup'),
      first: selectedValues('first')[0] || '',
      dream: (data.get('dream') as string) || '',
      telegram: (data.get('telegram') as string) || '',
      heard: selectedValues('heard')[0] || '',
      mailing_list: !optout?.classList.contains('selected'),
    };

    // The success screen is only shown once the server confirms the row was
    // written. A failure here keeps the filled-in form on screen so the person
    // can retry without losing their answers.
    setBusy(true);
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: '' }));
        showError(error || "we couldn't save your rsvp just then. please try again.");
        setBusy(false);
        return;
      }
    } catch {
      showError("we couldn't reach us just then — check your connection and try again.");
      setBusy(false);
      return;
    }

    setBusy(false);
    form.style.display = 'none';
    if (successBox) successBox.style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
