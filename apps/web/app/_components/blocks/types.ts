export type BlockProps = { data: Record<string, unknown>; first?: boolean; /** Unique jump-link address for this section, when it has one. */ anchor?: string };
export const str = (v: unknown): string => (typeof v === "string" ? v : v == null ? "" : String(v));
export const arr = <T = Record<string, unknown>>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
