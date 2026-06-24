const moneyFormatter = new Intl.NumberFormat("vi-VN");

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const plainDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const compactNumberFormatter = new Intl.NumberFormat("vi-VN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatMoney(value?: number | null) {
  if (value == null || !Number.isFinite(value)) return "-";
  return `${moneyFormatter.format(value)} đ`;
}

export function formatCurrency(value = 0) {
  return currencyFormatter.format(value);
}

export function formatCompactCurrency(value = 0) {
  if (value === 0) return "0đ";
  return `${compactNumberFormatter.format(value)}đ`;
}

export function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return dateTimeFormatter.format(date);
}

export function formatPlainDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return plainDateFormatter.format(date);
}
