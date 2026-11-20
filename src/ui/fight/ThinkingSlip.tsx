/** The slip shown while foes think ahead off the page's thread (`useThinking`). */
export function ThinkingSlip({ thinking }: { readonly thinking: boolean }) {
  if (!thinking) return null;
  return (
    <p className="fight-thinking" role="status">
      They are thinking ahead.
    </p>
  );
}
