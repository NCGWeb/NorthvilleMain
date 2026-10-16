"use client";
import { useLinkStatus } from "next/link";
import { Spinner } from "./Spinner";

/** Place inside a <Link>: shows a spinner while that link's page is loading. */
export function LinkPending() {
  const { pending } = useLinkStatus();
  return pending ? <Spinner size={14} /> : null;
}
