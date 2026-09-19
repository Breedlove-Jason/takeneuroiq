const key = 'neuroiq_pending_invitation';
export function rememberInvitation(code, storage, now = Date.now()) {
  if (!/^[A-F0-9]{12}$/i.test(code || '')) return;
  try { storage ??= window.localStorage; storage.setItem(key, JSON.stringify({ code: code.toUpperCase(), expires: now + 600000 })); } catch { /* Optional browser storage. */ }
}
export function pendingInvitation(storage, now = Date.now()) {
  try {
    storage ??= window.localStorage;
    const saved = JSON.parse(storage.getItem(key) || 'null');
    return saved && /^[A-F0-9]{12}$/.test(saved.code) && Number.isFinite(saved.expires) && saved.expires > now ? saved.code : '';
  } catch { return ''; }
}
export function clearInvitation(storage) {
  try { storage ??= window.localStorage; storage.removeItem(key); } catch { /* Optional browser storage. */ }
}
export function competitionDestination(storage, now = Date.now()) {
  const code = pendingInvitation(storage, now);
  return code ? `/compete?code=${code}` : '/compete';
}
