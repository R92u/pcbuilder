const menu = document.getElementById('settings-menu');
const trigger = document.getElementById('settings-toggle');
const palette = document.getElementById('wave-color');
const resetColor = document.getElementById('wave-color-reset');
const colorKey = 'pcmaker-wave-color';
const defaultColor = palette.defaultValue;

function applyColor(value) {
  palette.value = /^#[0-9a-f]{6}$/i.test(value) ? value : defaultColor;
  document.documentElement.style.setProperty('--wave-color', palette.value);
  resetColor.disabled = palette.value === defaultColor;
}

function saveColor() {
  try {
    if (palette.value === defaultColor) localStorage.removeItem(colorKey);
    else localStorage.setItem(colorKey, palette.value);
  } catch {}
}

let savedColor;
try { savedColor = localStorage.getItem(colorKey); } catch {}
applyColor(savedColor);
palette.addEventListener('input', () => applyColor(palette.value));
palette.addEventListener('change', () => { applyColor(palette.value); saveColor(); });
resetColor.addEventListener('click', () => {
  applyColor(defaultColor);
  saveColor();
  palette.focus();
});
window.addEventListener('storage', event => {
  if (event.key === colorKey || event.key === null) applyColor(event.newValue);
});

function positionSettings() {
  const rect = trigger.getBoundingClientRect();
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
