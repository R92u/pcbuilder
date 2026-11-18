const themeStorageKey = 'pcmaker-design-variant-v2';
const themeSelect = document.getElementById('theme-select');
const menu = document.getElementById('settings-menu');
const trigger = document.getElementById('settings-toggle');
const themes = new Set(Array.from(themeSelect.options, option => option.value));

function applyTheme(id) {
  const selected = themes.has(id) ? id : 'glass';
  themeSelect.value = selected;
  document.documentElement.dataset.design = selected;
  document.body.dataset.auditDesign = String(selected === 'audit');
  document.getElementById('audit-theme').disabled = selected !== 'audit';
  document.dispatchEvent(new Event('pcmaker:design-change'));
  window.dispatchEvent(new Event('resize'));
}

for (const button of document.querySelectorAll('.workshop-toolbar button')) {
  const label = document.createElement('span');
  label.className = 'theme-tool-label';
  label.textContent = button.getAttribute('aria-label') || button.title;
  button.append(label);
}

let saved = 'glass';
try {
  saved = localStorage.getItem(themeStorageKey) ?? localStorage.getItem('pcmaker-design-variant') ?? saved;
} catch {}
applyTheme(saved);

themeSelect.addEventListener('change', () => {
  applyTheme(themeSelect.value);
  try { localStorage.setItem(themeStorageKey, themeSelect.value); } catch {}
});
window.addEventListener('storage', event => {
  if (event.key === themeStorageKey) applyTheme(event.newValue);
});

function positionSettings() {
  const rect = trigger.getBoundingClientRect();
  // Leave room to scroll even on short screens and at high browser zoom.
  const top = Math.max(8, Math.min(rect.bottom + 8, window.innerHeight - 160));
  menu.style.setProperty('--settings-top', top + 'px');
  menu.style.setProperty('--settings-right', Math.max(8, document.documentElement.clientWidth - rect.right) + 'px');
}
menu.addEventListener('beforetoggle', event => {
  if (event.newState === 'open') positionSettings();
  trigger.setAttribute('aria-expanded', String(event.newState === 'open'));
});
window.addEventListener('resize', () => {
  if (menu.matches(':popover-open')) positionSettings();
});
