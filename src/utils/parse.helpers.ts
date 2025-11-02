export const toInt = (v: unknown, def = 1) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
};

export const toOrder = (v: unknown): "asc" | "desc" | undefined => {
  return v === "asc" || v === "desc" ? v : undefined;
};

export const toDate = (v: unknown): Date | undefined => {
  const d = v ? new Date(String(v)) : undefined;
  return d && !isNaN(d.getTime()) ? d : undefined;
};

export const toStr = (v: unknown): string | undefined => {
  const s = typeof v === "string" ? v.trim() : undefined;
  return s ? s : undefined;
};
