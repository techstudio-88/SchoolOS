import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden p-6 text-center">
      <div className="aurora absolute inset-0" />
      <div className="relative">
        <div className="text-gradient font-display text-[9rem] font-bold leading-none md:text-[14rem]">404</div>
        <p className="mt-2 text-xl text-slate-300">This page skipped class.</p>
        <Link href="/" className="btn-glow mt-8 inline-block rounded-2xl px-8 py-4">Back to school</Link>
      </div>
    </main>
  );
}
