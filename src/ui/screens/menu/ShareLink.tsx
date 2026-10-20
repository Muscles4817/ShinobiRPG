/**
 * Sharing the game on WhatsApp: a link to WhatsApp's own share page with a short message and
 * the address the game is being played from, so a friend gets the same build. It opens the
 * app on a phone and WhatsApp Web elsewhere; nothing is sent until the player picks a chat.
 */

const WHATSAPP_SHARE = 'https://wa.me/';
const MESSAGE = 'Shinobi RPG: a shinobi’s life, one day at a time. Play it on your phone:';

/** The game's own address: the folder it is served from, without a page, query or hash. */
export function gameAddress(): string {
  return new URL('./', window.location.href).href;
}

/** WhatsApp's share link for a message and an address. */
export function whatsAppShareLink(address: string): string {
  return `${WHATSAPP_SHARE}?text=${encodeURIComponent(`${MESSAGE} ${address}`)}`;
}

export function ShareLink() {
  return (
    <a
      className="menu-option"
      href={whatsAppShareLink(gameAddress())}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="menu-glyph" aria-hidden="true">
        伝
      </span>
      <span className="menu-words">
        <b>Share on WhatsApp</b>
        <small>Send the game to a friend.</small>
      </span>
    </a>
  );
}
