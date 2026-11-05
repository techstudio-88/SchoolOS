"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, Zap } from "lucide-react";
import { Particles } from "@/components/fx";
import { Icon } from "@/components/icons";
import { Logo } from "@/components/landing/Hero";
import { PANELS, PANEL_MAP } from "@/lib/catalog";

export function LoginView() {
  const router = useRouter();
  const [role, setRole] = useState("principal");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState<"login" | "skip" | null>(null);
  const [error, setError] = useState("");
  const panel = PANEL_MAP[role];

  async function enter(mode: "login" | "skip") {
    setBusy(mode);
    setError("");
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role, name: mode === "login" ? email.split("@")[0] : undefined }),
      });
      if (!res.ok) throw new Error();
      router.push(`/app/${role}`);
    } catch {
      setError("Could not start your session. Please try again.");
      setBusy(null);
    }
  }

  return (
    <main className="relative grid min-h-screen overflow-hidden lg:grid-cols-[1.05fr_1fr]">
      <div className="aurora absolute inset-0" />
      <div className="grid-bg absolute inset-0" />
      <Particles count={36} />
      <motion.div
        key={panel.color}
        animate={{ backgroundColor: panel.color }}
        transition={{ duration: 1 }}
        className="animate-blob absolute -left-32 top-1/3 h-96 w-96 opacity-25 blur-[120px]"
      />

      {/* Left: story */}
      <section className="relative z-10 hidden flex-col justify-between p-12 lg:flex">
        <Link href="/" className="flex w-fit items-center gap-3 transition hover:opacity-80">
          <ArrowLeft size={18} className="text-slate-400" />
          <Logo />
        </Link>
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-6xl font-bold leading-[1.05] text-white"
          >
            Welcome back to the <span className="text-gradient">future</span> of school.
          </motion.h1>
          <p className="mt-6 max-w-md text-lg text-slate-400">
            Pick your role, step inside, and watch every part of your school fall into place.
          </p>
          <div className="relative mt-14 h-52">
            {PANELS.slice(0, 8).map((p, i) => (
              <motion.div
                key={p.id}
                className="absolute grid h-16 w-16 place-items-center rounded-2xl"
                style={{
                  left: `${(i % 4) * 22 + (i > 3 ? 8 : 0)}%`,
                  top: i > 3 ? 100 : 0,
                  background: `linear-gradient(135deg, ${p.color}55, ${p.color}10)`,
                  border: `1px solid ${p.color}77`,
                  boxShadow: `0 0 30px ${p.color}55`,
                }}
                animate={{ y: [0, i % 2 ? -16 : 16, 0], rotate: [0, i % 2 ? 6 : -6, 0] }}
                transition={{ duration: 5 + i * 0.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <Icon name={p.icon} size={28} style={{ color: p.color }} />
              </motion.div>
            ))}
          </div>
        </div>
        <p className="text-sm text-slate-500">Encrypted, private and made for schools.</p>
      </section>

      {/* Right: form */}
      <section className="relative z-10 flex items-center justify-center p-5 py-10 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg"
        >
          <div className="spin-border">
            <div className="spin-inner p-6 sm:p-9">
              <div className="mb-6 lg:hidden">
                <Logo />
              </div>
              <h2 className="font-display text-3xl font-bold text-white">Sign in</h2>
              <p className="mt-1 text-sm text-slate-400">Choose your panel, then continue.</p>

              <div className="mt-6 grid max-h-52 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
                {PANELS.map((p) => {
                  const active = p.id === role;
                  return (
                    <motion.button
                      key={p.id}
                      type="button"
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setRole(p.id)}
                      className="relative flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center transition"
                      style={{
                        borderColor: active ? p.color : "rgba(255,255,255,0.08)",
                        background: active ? `${p.color}22` : "rgba(255,255,255,0.03)",
                        boxShadow: active ? `0 0 24px ${p.color}55` : undefined,
                      }}
                    >
                      <Icon name={p.icon} size={18} style={{ color: p.color }} />
                      <span className="text-[10.5px] font-medium leading-tight text-slate-200">{p.title}</span>
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={role}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-3 text-xs"
                  style={{ color: panel.color }}
                >
                  {panel.title} — {panel.tagline}
                </motion.p>
              </AnimatePresence>

              <form
                className="mt-5 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  enter("login");
                }}
              >
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input className="input !pl-10" type="email" placeholder="you@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input className="input !px-10" type={show ? "text" : "password"} placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white" aria-label="Toggle password">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {error && <p className="text-sm text-rose-400">{error}</p>}
                <div>
                  <button type="submit" disabled={busy !== null} className="btn-glow flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm">
                    {busy === "login" ? "Signing in…" : <>Sign in as {panel.title} <ArrowRight size={16} /></>}
                  </button>
                </div>
              </form>

              <div className="my-5 flex items-center gap-3 text-xs text-slate-500">
                <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                disabled={busy !== null}
                onClick={() => enter("skip")}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-amber-400/40 bg-amber-400/10 px-6 py-3.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/20 hover:shadow-[0_0_40px_rgba(251,191,36,0.35)]"
              >
                <Zap size={16} className="fill-amber-300" />
                {busy === "skip" ? "Entering…" : "Skip login for now — explore the demo"}
              </motion.button>
              <p className="mt-4 text-center text-[11px] text-slate-500">
                Demo mode: any email works, and nothing is verified yet.
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
