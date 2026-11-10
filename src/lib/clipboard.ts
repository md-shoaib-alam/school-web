/**
 * Safely copies text to the clipboard, falling back to document.execCommand
 * if navigator.clipboard is unavailable (such as in non-secure HTTP contexts).
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn("Failed to copy using navigator.clipboard, trying fallback", err);
    }
  }

  // Fallback for non-secure HTTP context
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  textArea.style.opacity = "0"; // Make it invisible

  // Find the open dialog modal to bypass Radix Focus Trap, otherwise fallback to body
  const container = document.querySelector('[role="dialog"]') || document.body;
  container.appendChild(textArea);

  textArea.focus();
  textArea.select();

  let success = false;
  try {
    success = document.execCommand('copy');
  } catch (err) {
    console.error('Fallback copy failed:', err);
  }

  container.removeChild(textArea);
  return success;
}
