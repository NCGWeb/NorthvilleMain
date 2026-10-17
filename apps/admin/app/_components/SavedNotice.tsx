"use client";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";

/** Green confirmation shown on a list after saving. Fades away by itself. */
export function SavedNotice({ show, text = "Saved. The website will show this within a few seconds." }: { show: boolean; text?: string }) {
  const [visible, setVisible] = useState(show);
  useEffect(() => {
    if (!show) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(t);
  }, [show]);
  if (!visible) return null;
  return (
    <p role="status" className="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
      <Check size={16} aria-hidden /> {text}
    </p>
  );
}
