import { Spinner } from "../_components/Spinner";

/** Shown while an admin screen loads, so a click never feels dead. */
export default function Loading() {
  return (
    <div className="flex items-center gap-3 py-24 text-royal" role="status" aria-label="Loading">
      <Spinner size={22} /><span className="text-sm font-medium text-muted">Loading...</span>
    </div>
  );
}
