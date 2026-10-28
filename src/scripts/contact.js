// Contact form: validates like the Framer Formspark component, posts JSON to Formspark and shows a checkmark on success.
// Without JavaScript the form still works as a normal POST to the same Formspark endpoint.
const form = document.querySelector('.contact-form');
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const fields = {
    name: form.elements.name,
    email: form.elements.email,
    message: form.elements.message,
  };
  const invalid = [
    fields.name.value.trim() === '' && fields.name,
    !EMAIL.test(fields.email.value.trim()) && fields.email,
    fields.message.value.trim() === '' && fields.message,
  ].filter(Boolean);

  Object.values(fields).forEach((field) => field.setAttribute('aria-invalid', String(invalid.includes(field))));
  if (invalid.length) {
    invalid[0].focus();
    return;
  }

  const button = form.querySelector('.contact-form__submit');
  button.disabled = true;
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    if (!response.ok) throw new Error(response.status);
    // The "message sent" label comes from the translation files via data-success-label on the form
    form.innerHTML = `<div class="contact-form__success" role="status" aria-label="${form.dataset.successLabel}"><svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="5 12.5 10 17.5 19 7"/></svg></div>`;
  } catch {
    button.disabled = false;
  }
});

// Clear the red border as soon as the visitor edits a field
form.addEventListener('input', (event) => event.target.removeAttribute('aria-invalid'));
