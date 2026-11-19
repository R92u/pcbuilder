const menu = document.getElementById('settings-menu');
const trigger = document.getElementById('settings-toggle');

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
