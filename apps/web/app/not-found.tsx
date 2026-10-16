import { getSettings } from "@northville/core";
import { Button } from "./_components/ui";

export default async function NotFound() {
  const { text } = await getSettings();
  return (
    <section className="mesh pt-16 text-white">
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <p className="text-sm font-semibold text-sky">404</p>
        <h1 className="mt-4 text-4xl md:text-5xl">{text.notFoundHeading}</h1>
        <p className="mt-5 text-lg text-white/75">{text.notFoundText}</p>
        <div className="mt-8 flex justify-center gap-3"><Button href="/" variant="light">{text.notFoundHome}</Button><Button href="/contact" variant="ghost">{text.notFoundContact}</Button></div>
      </div>
    </section>
  );
}
