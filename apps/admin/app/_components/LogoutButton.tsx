"use client";
export function LogoutButton() {
  return (
    <button type="button" className="text-xs font-semibold text-muted hover:text-red-600" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/login"; }}>Sign out</button>
  );
}
