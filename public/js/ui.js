export function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function renderWall(container, messages) {
  container.innerHTML = '';
  if (!messages.length) {
    const empty = document.createElement('div');
    empty.className = 'notice';
    empty.innerHTML = '<div class="subtle">no notes here yet. be the first.</div>';
    container.appendChild(empty);
    return;
  }
  messages.forEach((m) => {
    const div = document.createElement('div');
    div.className = 'note';
    const t = new Date(m.created_at);
    const time = `${t.toLocaleDateString()} · ${t.toLocaleTimeString()}`;
    div.innerHTML = `<time>${time}</time><div>${escapeHtml(m.text)}</div>`;
    container.appendChild(div);
  });
}
