import { NextResponse } from "next/server";
import { HttpError } from "./session";

/** Wraps a handler so errors come back as `{ error }` in plain language. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (e) {
      if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
      console.error(e);
      const msg = e instanceof Error && /Unique constraint/.test(e.message) ? "That name or web address is already used. Please pick another." : "Something went wrong saving that. Nothing was lost. Please try again.";
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  };
}
