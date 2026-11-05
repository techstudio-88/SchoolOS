"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValueEvent } from "motion/react";
import { useRef, useState } from "react";
import { ArrowRight, Play, Sparkles, TrendingUp, Bus, CheckCircle2 } from "lucide-react";
import { Counter, Magnetic, Particles, SplitWords } from "@/components/fx";
import { DemoButton } from "@/components/DemoButton";

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <motion.div
        animate={{ rotate: [0, 8, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative grid place-items-center rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 shadow-[0_0_30px_rgba(139,92,246,0.7)]"
        style={{ width: size, height: size }}
      >
        <Sparkles size={size * 0.52} className="text-white" />
      </motion.div>
      <span className="font-display text-xl font-bold tracking-tight text-white">
        School<span className="text-gradient">OS</span>
      </span>
    </div>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 40));
  const links = [
    ["Story", "#story"],
    ["Journey", "#journey"],
    ["Voices", "#voices"],
    ["Plans", "#plans"],
    ["FAQ", "#faq"],
  ];
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <div
        className={`flex w-full max-w-6xl items-center justify-between rounded-2xl px-5 py-3 transition-all duration-500 ${
          scrolled ? "glass shadow-[0_8px_40px_rgba(0,0,0,0.5)]" : "border border-transparent"
        }`}
      >
        <Link href="/">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(([l, h]) => (
            <a
              key={h}
              href={h}
              className="relative rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:text-white"
            >
              {l}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden rounded-xl px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5 sm:block">
            Sign in
          </Link>
          <DemoButton className="btn-glow rounded-xl px-4 py-2 text-sm">Enter demo</DemoButton>
        </div>
      </div>
    </motion.header>
  );
}

function MockDashboard() {
  const bars = [42, 68, 51, 84, 62, 92, 74, 98, 70, 88, 60, 95];
  return (
    <div className="glass relative overflow-hidden rounded-3xl p-3 shadow-[0_40px_120px_-20px_rgba(139,92,246,0.55)] md:p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-rose-400" />
        <span className="h-3 w-3 rounded-full bg-amber-400" />
        <span className="h-3 w-3 rounded-full bg-emerald-400" />
        <div className="ml-4 h-6 flex-1 rounded-lg bg-white/5 text-center text-[11px] leading-6 text-slate-500">
          greenfield.schoolos.app
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[64px_1fr]">
        <div className="hidden flex-col items-center gap-3 md:flex">
          {["#8b5cf6", "#22d3ee", "#ec4899", "#f59e0b", "#10b981", "#6366f1"].map((c, i) => (
            <motion.div
              key={c}
              animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.35 }}
              className="h-11 w-11 rounded-xl"
              style={{ background: `linear-gradient(135deg, ${c}, ${c}55)`, boxShadow: `0 0 22px ${c}66` }}
            />
          ))}
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ["Students", 1240, "", "#8b5cf6"],
              ["Present today", 96, "%", "#10b981"],
              ["Fees collected", 82, "%", "#22d3ee"],
              ["Staff on duty", 87, "", "#f59e0b"],
            ].map(([l, v, s, c], i) => (
              <motion.div
                key={String(l)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + i * 0.12 }}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5"
              >
                <div className="text-[11px] text-slate-400">{l}</div>
                <div className="font-display text-2xl font-bold" style={{ color: String(c), textShadow: `0 0 18px ${c}88` }}>
                  <Counter to={Number(v)} suffix={String(s)} />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 text-xs text-slate-400">Weekly activity</div>
              <div className="flex h-36 items-end gap-1.5">
                {bars.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: [`${h}%`, `${Math.max(25, h - 28)}%`, `${h}%`] }}
                    transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-violet-600 via-indigo-500 to-cyan-400"
                    style={{ boxShadow: "0 0 14px rgba(99,102,241,0.55)" }}
                  />
                ))}
              </div>
            </div>
            <div className="grid place-items-center rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
                <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                <motion.circle
                  cx="60" cy="60" r="48" fill="none" stroke="url(#g)" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray="302"
                  initial={{ strokeDashoffset: 302 }}
                  animate={{ strokeDashoffset: 302 * 0.18 }}
                  transition={{ duration: 2.4, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{ filter: "drop-shadow(0 0 8px #22d3ee)" }}
                />
                <defs>
                  <linearGradient id="g" x1="0" x2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="-mt-[88px] mb-12 text-center font-display text-2xl font-bold text-white">
                <Counter to={82} suffix="%" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const rotateX = useTransform(scrollYProgress, [0, 0.6], [14, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.6], [0.94, 1.04]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const blobY = useTransform(scrollYProgress, [0, 1], [0, 260]);

  return (
    <section ref={ref} className="relative min-h-[130vh] overflow-hidden pt-32">
      <div className="aurora absolute inset-0" />
      <div className="grid-bg absolute inset-0" />
      <motion.div style={{ y: blobY }} className="absolute inset-0">
        <div className="animate-blob absolute -left-24 top-24 h-96 w-96 bg-violet-600/40 blur-[110px]" />
        <div className="animate-blob absolute right-0 top-40 h-[28rem] w-[28rem] bg-cyan-500/30 blur-[120px] [animation-delay:-6s]" />
        <div className="animate-blob absolute bottom-0 left-1/3 h-96 w-96 bg-pink-600/30 blur-[120px] [animation-delay:-12s]" />
      </motion.div>
      <Particles count={46} />

      <motion.div style={{ y: textY, opacity: textOpacity }} className="relative z-10 mx-auto max-w-5xl px-5 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass mx-auto mb-8 inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-sm text-slate-200"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          The school operating system, reimagined
        </motion.div>

        <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl md:text-8xl">
          <SplitWords text="Your whole school," delay={0.3} />
          <br />
          <SplitWords text="alive in one place." delay={0.6} gradientFrom={1} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.1 }}
          className="mx-auto mt-8 max-w-2xl text-lg text-slate-300 md:text-xl"
        >
          Owners, principals, teachers, parents and every team in between — finally moving in
          perfect sync, in an interface that feels like magic.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.3 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Magnetic>
            <Link href="/login" className="btn-glow group inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-base">
              Get started free
              <ArrowRight size={18} className="transition group-hover:translate-x-1.5" />
            </Link>
          </Magnetic>
          <Magnetic>
            <DemoButton className="glass group inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-medium text-white transition hover:bg-white/10">
              <Play size={16} className="fill-white" /> Skip &amp; explore demo
            </DemoButton>
          </Magnetic>
        </motion.div>
      </motion.div>

      <div className="relative z-10 mx-auto mt-20 max-w-5xl px-4" style={{ perspective: 1400 }}>
        <motion.div style={{ rotateX, scale, transformOrigin: "50% 0%" }}>
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <MockDashboard />
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="glass absolute -left-3 top-16 hidden items-center gap-3 rounded-2xl px-4 py-3 md:flex lg:-left-12"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300"><TrendingUp size={18} /></span>
              <div>
                <div className="text-xs text-slate-400">Fees today</div>
                <div className="font-display font-bold text-white">+ ₹4,28,000</div>
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="glass absolute -right-3 top-40 hidden items-center gap-3 rounded-2xl px-4 py-3 md:flex lg:-right-12"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/20 text-amber-300"><Bus size={18} /></span>
              <div>
                <div className="text-xs text-slate-400">Bus 12</div>
                <div className="font-display font-bold text-white">Arriving in 4 min</div>
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="glass absolute -bottom-6 left-1/4 hidden items-center gap-3 rounded-2xl px-4 py-3 md:flex"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/20 text-violet-300"><CheckCircle2 size={18} /></span>
              <div>
                <div className="text-xs text-slate-400">Report cards</div>
                <div className="font-display font-bold text-white">Published to 1,240 parents</div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.2, repeat: Infinity }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs text-slate-400 md:flex"
      >
        <span className="shimmer-text tracking-[0.3em]">SCROLL</span>
        <span className="h-10 w-px bg-gradient-to-b from-violet-400 to-transparent" />
      </motion.div>
    </section>
  );
}
