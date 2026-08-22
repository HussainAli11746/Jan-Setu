/**
 * JanSetu Apply Assist � Frontend Handshake
 *
 * Called immediately before opening the government portal in a new tab.
 * Sends {schemeId, token, lang} to the background service worker of the
 * Chrome extension via chrome.runtime.sendMessage (externally_connectable).
 *
 * If the extension is not installed, this is a silent no-op � the existing
 * window.open behaviour is completely unchanged.
 */

const EXTENSION_ID = import.meta.env.VITE_EXTENSION_ID;

/**
 * @param {string} schemeId  - The scheme ID (matches SCHEME_GROUNDING keys)
 * @param {string} token     - The citizen's existing JWT from AuthContext
 * @param {string} lang      - ISO 639-1 language code from i18next (e.g. "hi")
 */
export function notifyExtension(schemeId, token, lang = "en") {
  // Guard: extension API must be available, extension ID must be set
  if (
    typeof window === "undefined" ||
    !window.chrome?.runtime?.sendMessage ||
    !EXTENSION_ID
  ) {
    // Silent no-op � extension not installed or ID not configured
    return;
  }

  try {
    window.chrome.runtime.sendMessage(
      EXTENSION_ID,
      { schemeId, token, lang },
      (response) => {
        if (chrome.runtime.lastError) {
          // Extension may not be installed; swallow error silently
          return;
        }
        if (response?.ok) {
          console.log("[JanSetu] Handshake sent to extension for scheme:", schemeId);
        }
      }
    );
  } catch (_) {
    // Completely silent � never break the main Apply Now flow
  }
}
