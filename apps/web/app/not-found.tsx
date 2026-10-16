import { Button } from "./_components/ui";

export default function NotFound() {
  return (
    <section className="mesh pt-16 text-white">
      <div className="mx-auto max-w-3xl px-5 py-32 text-center sm:px-8">
        <p className="text-sm font-semibold  text-sky">404</p>
        <h1 className="mt-4 text-5xl md:text-6xl">This page has moved or does not exist.</h1>
        <p className="mt-5 text-lg text-white/70">Try the home page or tell us what you were looking for.</p>
        <div className="mt-8 flex justify-center gap-3"><Button href="/" variant="light">Back home</Button><Button href="/contact" variant="ghost">Contact us</Button></div>
      </div>
    </section>
  );
}
