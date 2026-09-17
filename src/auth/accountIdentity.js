let accountId = null;
export function getAccountId() {
  return accountId;
}
export function setAccountId(id) {
  if (accountId === id) return;
  accountId = id || null;
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("takeneuroiq:account-changed"));
}
