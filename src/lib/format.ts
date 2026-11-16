const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(amount: number): string {
  if (!Number.isFinite(amount)) return "₹0";
  return inrFormatter.format(amount);
}

/**
 * Indian mobile: ten bare digits. A leading 91 country code or 0 trunk code is a display
 * prefix, not data, so legacy rows saved as +919812345678 still count as entered correctly.
 */
export function isTenDigitMobile(value: string | null | undefined): boolean {
  const digits = (value || "").replace(/\D/g, "");
  const local =
    digits.length === 12 && digits.startsWith("91") ? digits.slice(2)
      : digits.length === 11 && digits.startsWith("0") ? digits.slice(1)
        : digits;
  return local.length === 10;
}
