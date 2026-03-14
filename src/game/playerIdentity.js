const PLAYER_NAME_KEY = "takeneuroiq_player_name";
const DEFAULT_PLAYER_NAME = "Arena Runner";

export function getPlayerName() {
  try {
    const storedName = localStorage.getItem(PLAYER_NAME_KEY);

    if (!storedName || !storedName.trim()) {
      return DEFAULT_PLAYER_NAME;
    }

    return storedName.trim();
  } catch (error) {
    console.error("Failed to load TakeNeuroIQ player name:", error);
    return DEFAULT_PLAYER_NAME;
  }
}

function notifyPlayerIdentityUpdate() {
  window.dispatchEvent(new Event('takeneuroiq:player-identity-updated'));
}

export function setPlayerName(name) {
  const normalizedName = String(name ?? "").trim();

  if (!normalizedName) {
    return DEFAULT_PLAYER_NAME;
  }

  try {
    localStorage.setItem(PLAYER_NAME_KEY, normalizedName)
    notifyPlayerIdentityUpdate();
    return normalizedName;
  } catch (error) {
    console.error("Failed to save TakeNeuroIQ player name:", error);
    return DEFAULT_PLAYER_NAME;
  }
}

export function clearPlayerName() {
  try {
    localStorage.removeItem(PLAYER_NAME_KEY);
    notifyPlayerIdentityUpdate();
  } catch (error) {
    console.error("Failed to clear TakeNeuroIQ player name:", error);
  }
}

export function getDefaultPlayerName() {
  return DEFAULT_PLAYER_NAME;
}
