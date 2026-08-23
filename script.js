// ===== Año dinámico en el footer =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Menú móvil =====
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');

navToggle.addEventListener('click', () => {
  const isOpen = navMobile.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

navMobile.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMobile.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// =====================================================
// FORMULARIO MULTI-PASO — Wira Code
// =====================================================
//
// IMPORTANTE — Configuración pendiente:
// Este formulario envía los datos a un Google Apps Script conectado
// a una Google Sheet — cada solicitud aparece como una fila nueva,
// sin backend propio y sin costo.
//
// Para activarlo:
//   1. Crea una Google Sheet nueva (o usa una existente).
//   2. Ve a Extensiones > Apps Script y pega el código de
//      "apps-script-code.gs" (te lo entregué junto a estos archivos).
//   3. Haz clic en Implementar > Nueva implementación > tipo "Aplicación web".
//      - Ejecutar como: Yo (tu cuenta)
//      - Quién tiene acceso: Cualquier usuario
//   4. Copia la URL que termina en "/exec" y pégala abajo en APPS_SCRIPT_URL.
//
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxl3uDvk57aDNmV9OYho61FMaKzlilYDHLpH2fAngOKM_q0fnwVx8fMxK1xEHjc8-k-/exec';

const form = document.getElementById('contactForm');
const wizard = document.getElementById('wizard');
const wizardSuccess = document.getElementById('wizardSuccess');
const formStatus = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');
const barFill = document.getElementById('wizardBarFill');

const steps = Array.from(form.querySelectorAll('.wizard__step'));
const indicators = Array.from(wizard.querySelectorAll('.wizard__step-indicator'));
let currentStep = 1;

// ----- Selección de tarjetas de tipo de proyecto -----
const optionGrid = form.querySelector('.option-grid');
const projectTypeInput = document.getElementById('projectType');

optionGrid.querySelectorAll('.option-card').forEach(card => {
  card.addEventListener('click', () => {
    optionGrid.querySelectorAll('.option-card').forEach(c => c.classList.remove('is-selected'));
    card.classList.add('is-selected');
    projectTypeInput.value = card.dataset.value;
    optionGrid.classList.remove('has-error');
  });
});

// ----- Validación por paso -----
function validateStep(stepNumber) {
  let valid = true;
  const stepEl = steps[stepNumber - 1];

  stepEl.querySelectorAll('[required]').forEach(input => {
    const field = input.closest('.field');
    let fieldValid = input.value.trim() !== '';

    if (input.type === 'email' && fieldValid) {
      fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
    }

    if (field) field.classList.toggle('has-error', !fieldValid);
    if (!fieldValid) valid = false;
  });

  // Validación especial: tarjetas de tipo de proyecto
  if (stepNumber === 2) {
    const hasType = projectTypeInput.value.trim() !== '';
    optionGrid.classList.toggle('has-error', !hasType);
    if (!hasType) valid = false;
  }

  return valid;
}

// ----- Navegación entre pasos -----
function goToStep(n) {
  steps.forEach(s => s.classList.toggle('is-active', Number(s.dataset.step) === n));

  indicators.forEach(ind => {
    const num = Number(ind.dataset.step);
    ind.classList.toggle('is-active', num === n);
    ind.classList.toggle('is-done', num < n);
  });

  const pct = ((n - 1) / (steps.length - 1)) * 100;
  barFill.style.width = pct + '%';

  currentStep = n;
  formStatus.textContent = '';
}

form.querySelectorAll('.wizard__next').forEach(btn => {
  btn.addEventListener('click', () => {
    if (validateStep(currentStep)) {
      goToStep(currentStep + 1);
    } else {
      formStatus.textContent = 'Por favor completa los campos marcados antes de continuar.';
    }
  });
});

form.querySelectorAll('.wizard__prev').forEach(btn => {
  btn.addEventListener('click', () => goToStep(currentStep - 1));
});

// ----- Envío del formulario -----
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!validateStep(3)) {
    formStatus.textContent = 'Cuéntanos brevemente tu proyecto antes de enviar.';
    return;
  }

  // Valida que la URL tenga la forma real de un despliegue de Apps Script,
  // en vez de comparar contra el texto del placeholder (así no se rompe
  // si reemplazas el valor con "buscar y reemplazar todo" en tu editor).
  const isConfigured = /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(APPS_SCRIPT_URL);
  if (!isConfigured) {
    formStatus.textContent = 'Formulario no configurado todavía: falta pegar la URL de Apps Script en script.js.';
    console.warn('Wira Code: reemplaza el valor de APPS_SCRIPT_URL en script.js con tu URL real de despliegue.');
    return;
  }

  submitBtn.classList.add('is-loading');
  submitBtn.disabled = true;
  formStatus.textContent = '';

  const data = new FormData(form);

  try {
    // Nota: Google Apps Script no agrega cabeceras CORS a sus respuestas,
    // así que usamos mode "no-cors". Esto significa que no podemos leer
    // el resultado real del servidor — si el fetch no lanza un error de
    // red, asumimos que la solicitud llegó. Por eso es clave hacer una
    // prueba real después de configurar (envía el formulario una vez y
    // confirma que aparezca la fila en tu Google Sheet).
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: data
    });

    const name = data.get('name');
    const projectType = data.get('projectType');
    document.getElementById('successMessage').textContent =
      `Gracias, ${name}. Recibimos tu solicitud sobre "${projectType}" y te contactaremos en menos de 24 horas hábiles.`;

    form.style.display = 'none';
    wizard.querySelector('.wizard__progress').style.display = 'none';
    wizardSuccess.classList.add('is-active');

  } catch (err) {
    console.error('Error al enviar el formulario:', err);
    formStatus.textContent = 'No pudimos conectar con el servidor. Intenta de nuevo o escríbenos por WhatsApp.';
  } finally {
    submitBtn.classList.remove('is-loading');
    submitBtn.disabled = false;
  }
});
