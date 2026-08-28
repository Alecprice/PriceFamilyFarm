export function localDay(value = new Date()) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function localDayPlus(days, value = new Date()) {
  const next = new Date(value);
  next.setHours(12, 0, 0, 0);
  next.setDate(next.getDate() + days);
  return localDay(next);
}
