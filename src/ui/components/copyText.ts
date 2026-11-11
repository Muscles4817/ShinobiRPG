/**
 * Puts text on the clipboard. Resolves false where the device won't allow it (an old webview, a
 * page without permission), so the caller can show the text to be copied by hand instead.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
