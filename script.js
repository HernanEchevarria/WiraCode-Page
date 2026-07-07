// ===== Año dinámico en el footer =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Menú móvil =====
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');

navToggle.addEventListener('click', () => {
  const isOpen = navMobile.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

// Cierra el menú móvil al elegir una opción
navMobile.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMobile.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ===== Formulario de contacto =====
// NOTA: esto es solo una simulación de envío en el front-end.
// Para que el formulario envíe correos de verdad, conéctalo a un backend
// o a un servicio como Formspree, EmailJS o tu propia API.
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = contactForm.name.value.trim();
  const email = contactForm.email.value.trim();
  const message = contactForm.message.value.trim();

  if (!name || !email || !message) {
    formStatus.textContent = 'Por favor completa todos los campos.';
    return;
  }

  // Aquí iría la llamada real a tu backend / servicio de envío de correo.
  console.log('Formulario enviado:', { name, email, message });

  formStatus.textContent = `Gracias, ${name}. Te responderemos pronto a ${email}.`;
  contactForm.reset();
});
