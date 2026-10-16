"use client";
import { useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError("");
    const fd = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(fd) });
    if (res.ok) { window.location.href = "/"; return; }
    setError((await res.json().catch(() => ({}))).error ?? "Could not sign in.");
    setBusy(false);
  }
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-gradient-to-br from-navy to-royal p-14 text-white lg:flex lg:flex-col lg:justify-between">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky">Northville Consulting Group</p>
        <div><h1 className="text-5xl font-semibold leading-tight">Website<br />manager</h1><p className="mt-4 max-w-sm text-white/70">Edit pages, services, team and blog posts. Changes go live when you press Publish.</p></div>
        <p className="text-sm text-white/50">Need access? Ask the site owner to add you.</p>
      </div>
      <div className="grid place-items-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <h2 className="text-2xl font-semibold text-navy">Sign in</h2>
          <label className="block text-sm font-medium">Email<input name="email" type="email" required autoComplete="username" className="input mt-1.5" /></label>
          <label className="block text-sm font-medium">Password<input name="password" type="password" required autoComplete="current-password" className="input mt-1.5" /></label>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button disabled={busy} className="btn btn-primary w-full justify-center">{busy ? "Signing in..." : "Sign in"}</button>
        </form>
      </div>
    </main>
  );
}
