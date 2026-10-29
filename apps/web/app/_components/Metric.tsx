import { CountUp } from "./CountUp";

/**
 * Shows a headline result such as "47%", "343K+" or "7 days". Numbers with a simple shape count up as they
 * scroll into view; anything else (words, Indian-style commas) is shown as typed.
 */
export function Metric({ value }: { value: string }) {
  const m = /^([^\w\s]{0,2})(\d[\d,]*(?:\.\d+)?)(.*)$/.exec(value.trim());
  if (!m) return <>{value}</>;
  const decimals = m[2].includes(".") ? m[2].split(".")[1].length : 0;
  return <CountUp value={parseFloat(m[2].replace(/,/g, ""))} decimals={decimals} prefix={m[1]} suffix={m[3]} />;
}
