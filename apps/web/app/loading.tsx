import { Spinner } from "./_components/Spinner";

/** Shown while a page that is not pre-built is fetched. */
export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-royal" role="status" aria-label="Loading">
      <Spinner size={32} />
    </div>
  );
}
