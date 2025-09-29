(function() {
  const toggle = document.querySelector('.menu-toggle');
  const links = document.querySelector('.nav-links');
  const year = document.getElementById('year');
  if (year) { year.textContent = String(new Date().getFullYear()); }

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form) return;

  function setError(id, message) {
    const el = document.querySelector(`small.error[data-for="${id}"]`);
    if (el) el.textContent = message || '';
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    setError('name', ''); setError('email', ''); setError('message', '');

    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');

    let valid = true;
    if (!name.value.trim()) { setError('name', 'Informe seu nome.'); valid = false; }
    if (!validateEmail(email.value)) { setError('email', 'Email inválido.'); valid = false; }
    if (!message.value.trim()) { setError('message', 'Digite uma mensagem.'); valid = false; }

    if (!valid) {
      if (status) status.textContent = 'Corrija os campos destacados.';
      return;
    }

    if (status) status.textContent = 'Obrigado! Sua mensagem foi registrada (demo).';
    form.reset();
  });
})();
