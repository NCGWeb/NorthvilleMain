"use client";
import { useEffect } from "react";

/** Asks the browser to warn before the tab is closed or reloaded while there are unsaved changes. */
export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
}

export const LEAVE_MESSAGE = "You have unsaved changes. Leave without saving?";
