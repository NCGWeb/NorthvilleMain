export type BlockProps = { data: Record<string, unknown>; first?: boolean };
export const str = (v: unknown): string => (typeof v === "string" ? v : v == null ? "" : String(v));
export const arr = <T = Record<string, unknown>>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
