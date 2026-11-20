/**
 * Handing the player a file their browser saves: a text made into a file of that name, through
 * a link clicked for them. Works offline; in a shell without downloads it simply does nothing.
 */
export function downloadFile(name: string, text: string, type = 'application/json'): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
