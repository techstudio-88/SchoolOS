"use client";

import Link from "next/link";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ChevronDown, Quote, ShieldCheck, Star } from "lucide-react";
import { Counter, GlowCard, Magnetic, Parallax, Particles, Reveal, SplitWords, TiltCard } from "@/components/fx";
import { Icon } from "@/components/icons";
import { DemoButton } from "@/components/DemoButton";
import { Logo } from "./Hero";
import { PANELS } from "@/lib/catalog";

function SectionTitle({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto mb-16 max-w-3xl text-center">
      <Reveal>
        <span className="glass inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-violet-300">
          {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="font-display mt-6 text-4xl font-bold leading-tight text-white md:text-6xl">{title}</h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.2}>
          <p className="mt-5 text-lg text-slate-400">{sub}</p>
        </Reveal>
      )}
    </div>
  );
}

/* ---------------- Marquee ---------------- */
export function Marquee() {
  const a = ["Greenfield International", "St. Xavier's Academy", "Blue Ridge School", "Lotus Valley", "Oakwood High", "Riverdale Public", "Sunrise Convent", "Heritage Academy", "Orchid Global", "Mount Carmel"];
  const b = ["Loved by 1,200+ schools", "Trusted by 2M+ students", "99.99% uptime", "Teachers save 9 hrs / week", "Parents give 4.9 ★", "Zero paperwork days"];
  return (
    <section className="relative overflow-hidden border-y border-white/5 bg-white/[0.015] py-10">
      <p className="mb-6 text-center text-xs uppercase tracking-[0.35em] text-slate-500">Powering schools that dare to be different</p>
      <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
        <div className="animate-marquee flex shrink-0 gap-16 pr-16">
          {[...a, ...a].map((s, i) => (
            <span key={i} className="font-display whitespace-nowrap text-2xl font-semibold text-slate-500 transition hover:text-white">{s}</span>
          ))}
        </div>
      </div>
      <div className="mt-6 flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
        <div className="animate-marquee-rev flex shrink-0 gap-12 pr-12">
          {[...b, ...b, ...b, ...b].map((s, i) => (
            <span key={i} className="text-gradient font-display whitespace-nowrap text-lg font-semibold">✦ {s}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Stats ---------------- */
export function Stats() {
  const items = [
    { to: 1200, suffix: "+", label: "Schools onboarded", color: "#8b5cf6" },
    { to: 2.4, suffix: "M", decimals: 1, label: "Students supported", color: "#22d3ee" },
    { to: 99.99, suffix: "%", decimals: 2, label: "Platform uptime", color: "#10b981" },
    { to: 9, suffix: " hrs", label: "Saved per teacher, weekly", color: "#f59e0b" },
  ];
  return (
    <section className="relative py-32">
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[130px]" />
      <div className="relative mx-auto max-w-6xl px-5">
        <SectionTitle eyebrow="By the numbers" title="Numbers that make principals smile" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1} y={60} scale={0.9}>
              <TiltCard glow={s.color} className="rounded-3xl p-8 text-center">
                <div className="font-display text-5xl font-bold md:text-6xl" style={{ color: s.color, textShadow: `0 0 40px ${s.color}99` }}>
                  <Counter to={s.to} suffix={s.suffix} decimals={s.decimals ?? 0} />
                </div>
                <div className="mt-3 text-sm text-slate-400">{s.label}</div>
                <div className="mx-auto mt-5 h-1 w-16 rounded-full" style={{ background: s.color, boxShadow: `0 0 18px ${s.color}` }} />
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Orbit of people ---------------- */
export function Orbit() {
  const people = PANELS;
  return (
    <section className="relative overflow-hidden py-32">
      <div className="aurora absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-6xl px-5">
        <SectionTitle
          eyebrow="Everyone belongs"
          title="One platform. Every person in your school."
          sub="Each role gets a home that feels made just for them — and they all orbit the same living source of truth."
        />
        <div className="relative mx-auto grid h-[380px] w-[380px] place-items-center md:h-[620px] md:w-[620px]">
          {[1, 0.72, 0.46].map((s, i) => (
            <div key={i} className="absolute rounded-full border border-white/10" style={{ width: `${s * 100}%`, height: `${s * 100}%`, boxShadow: i === 0 ? "0 0 80px rgba(139,92,246,0.15) inset" : undefined }} />
          ))}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 [--r:150px] md:[--r:255px]"
          >
            {people.map((p, i) => {
              const a = (360 / people.length) * i;
              return (
                <div
                  key={p.id}
                  className="absolute left-1/2 top-1/2 -ml-6 -mt-6 h-12 w-12 md:-ml-7 md:-mt-7 md:h-14 md:w-14"
                  style={{ transform: `rotate(${a}deg) translateX(var(--r))` }}
                >
                  <motion.div
                    animate={{ rotate: [-a, -a - 360] }}
                    transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
                    className="group relative grid h-full w-full place-items-center rounded-2xl"
                    style={{ background: `linear-gradient(135deg, ${p.color}55, ${p.color}15)`, border: `1px solid ${p.color}88`, boxShadow: `0 0 28px ${p.color}66` }}
                  >
                    <Icon name={p.icon} size={22} style={{ color: p.color }} />
                    <span className="pointer-events-none absolute -bottom-9 whitespace-nowrap rounded-lg bg-black/80 px-2.5 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                      {p.title}
                    </span>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
          <div className="relative grid h-36 w-36 place-items-center rounded-full md:h-48 md:w-48">
            <div className="animate-spin-slow absolute inset-0 rounded-full border-2 border-dashed border-violet-400/40" />
            <div className="animate-pulse-glow absolute inset-5 rounded-full bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500" />
            <div className="relative text-center">
              <div className="font-display text-3xl font-bold text-white md:text-5xl"><Counter to={18} /></div>
              <div className="text-[11px] uppercase tracking-widest text-white/80">tailored panels</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Story (scroll-drawn path) ---------------- */
export function Story() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const h = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const steps = [
    { n: "01", t: "Tell us about your school", d: "Import your people in minutes. Our guided setup understands grades, sections, houses and boards — no spreadsheets harmed.", c: "#8b5cf6" },
    { n: "02", t: "Invite every team", d: "Principal, teachers, accounts, transport, wardens, parents — each lands in a panel that already speaks their language.", c: "#22d3ee" },
    { n: "03", t: "Watch the school sync", d: "Attendance flows to parents, fees to accounts, syllabus to principals. Information moves so nobody has to chase it.", c: "#ec4899" },
    { n: "04", t: "Lead with clarity", d: "Live dashboards turn the daily noise into a calm, confident picture — from classroom to boardroom.", c: "#f59e0b" },
  ];
  return (
    <section id="story" className="relative py-32">
      <div className="mx-auto max-w-5xl px-5">
        <SectionTitle eyebrow="The story" title="From chaos to calm in four moves" sub="Switching systems sounds scary. This part, strangely, is the fun one." />
        <div ref={ref} className="relative">
          <div className="absolute bottom-0 left-6 top-0 w-px bg-white/10 md:left-1/2" />
          <motion.div
            style={{ scaleY: h, transformOrigin: "top" }}
            className="absolute bottom-0 left-6 top-0 w-[3px] -translate-x-[1px] bg-gradient-to-b from-violet-500 via-cyan-400 to-pink-500 shadow-[0_0_24px_#8b5cf6] md:left-1/2"
          />
          <div className="space-y-24">
            {steps.map((s, i) => (
              <div key={s.n} className={`relative flex pl-16 md:pl-0 ${i % 2 ? "md:justify-start" : "md:justify-end"}`}>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ type: "spring", stiffness: 260, damping: 14 }}
                  className="absolute left-6 top-8 grid h-5 w-5 -translate-x-1/2 place-items-center rounded-full md:left-1/2"
                  style={{ background: s.c, boxShadow: `0 0 0 6px ${s.c}33, 0 0 30px ${s.c}` }}
                />
                <Reveal x={i % 2 ? 80 : -80} y={0} className="w-full md:w-[calc(50%-48px)]">
                  <GlowCard glow={s.c} className="rounded-3xl p-8">
                    <div className="font-display text-6xl font-bold" style={{ color: s.c, opacity: 0.9, textShadow: `0 0 30px ${s.c}88` }}>{s.n}</div>
                    <h3 className="font-display mt-3 text-2xl font-bold text-white">{s.t}</h3>
                    <p className="mt-3 leading-relaxed text-slate-400">{s.d}</p>
                  </GlowCard>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Horizontal journey ---------------- */
export function Journey() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-76%"]);
  const bar = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const moments = [
    { t: "06:30", h: "The first bus rolls out", d: "Parents get a gentle ping. Drivers have the route. Everyone knows where everyone is.", c: "#f59e0b" },
    { t: "08:00", h: "Morning bell, zero registers", d: "Attendance is marked in seconds. Absences reach parents before first period ends.", c: "#10b981" },
    { t: "10:15", h: "A lesson lands perfectly", d: "The teacher's plan, the syllabus and the timetable finally agree with each other.", c: "#8b5cf6" },
    { t: "12:40", h: "Lunch, handled", d: "Meals counted, allergies respected, wallets topped up. Nobody queues for cash.", c: "#ec4899" },
    { t: "14:30", h: "The principal's calm moment", d: "One screen. Whole school. Every number that matters, already explained.", c: "#22d3ee" },
    { t: "16:00", h: "Fees, quietly collected", d: "Receipts issued, reminders sent, books balanced — while the school day winds down.", c: "#6366f1" },
    { t: "19:00", h: "Parents sleep easy", d: "Marks, homework and messages waiting — beautifully organised, never overwhelming.", c: "#f43f5e" },
  ];
  return (
    <section id="journey" ref={ref} className="relative h-[420vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="aurora absolute inset-0 opacity-50" />
        <div className="relative mb-10 px-5 text-center">
          <Reveal>
            <span className="glass inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">A day in the life</span>
          </Reveal>
          <h2 className="font-display mt-5 text-4xl font-bold text-white md:text-6xl">One day. <span className="text-gradient">Perfectly in sync.</span></h2>
        </div>
        <motion.div style={{ x }} className="relative flex gap-6 pl-[6vw]">
          {moments.map((m) => (
            <div key={m.t} className="w-[78vw] shrink-0 md:w-[400px]">
              <TiltCard glow={m.c} className="h-[300px] rounded-[2rem] p-8" max={6}>
                <div className="font-display text-7xl font-bold" style={{ color: m.c, textShadow: `0 0 40px ${m.c}aa` }}>{m.t}</div>
                <h3 className="font-display mt-5 text-2xl font-bold text-white">{m.h}</h3>
                <p className="mt-3 text-slate-400">{m.d}</p>
                <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full opacity-30 blur-3xl" style={{ background: m.c }} />
              </TiltCard>
            </div>
          ))}
        </motion.div>
        <div className="relative mx-auto mt-12 h-1.5 w-64 overflow-hidden rounded-full bg-white/10">
          <motion.div style={{ scaleX: bar, transformOrigin: "left" }} className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 shadow-[0_0_20px_#22d3ee]" />
        </div>
      </div>
    </section>
  );
}

/* ---------------- Testimonials ---------------- */
export function Voices() {
  const quotes = [
    { q: "I used to chase eleven people for one report. Now I open one screen and the whole school is just… there.", n: "Dr. Meera Kapoor", r: "Principal, Lotus Valley", c: "#8b5cf6" },
    { q: "Our fee collection jumped by a fifth in a single term. The reminders feel polite, but they work like magic.", n: "Rajiv Malhotra", r: "Owner, Heritage Academy", c: "#22d3ee" },
    { q: "My teachers actually smile when they mention the software. In twenty years, that has never happened.", n: "Sister Annie Joseph", r: "Vice Principal, Mount Carmel", c: "#ec4899" },
    { q: "As a parent, I finally know what's going on — without calling the school five times a week.", n: "Priya Nair", r: "Parent, Riverdale Public", c: "#f59e0b" },
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % quotes.length), 5500);
    return () => clearInterval(t);
  }, [quotes.length]);
  const cur = quotes[i];
  return (
    <section id="voices" className="relative overflow-hidden py-32">
      <Particles count={25} />
      <div className="relative mx-auto max-w-4xl px-5">
        <SectionTitle eyebrow="Voices" title="Don't take our word for it" />
        <div className="relative">
          <div className="absolute -inset-10 rounded-full opacity-40 blur-[100px] transition-colors duration-1000" style={{ background: cur.c }} />
          <div className="spin-border">
            <div className="spin-inner min-h-[340px] p-8 md:p-14">
              <Quote size={48} style={{ color: cur.c }} className="opacity-60" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -30, filter: "blur(8px)" }}
                  transition={{ duration: 0.6 }}
                >
                  <p className="font-display mt-4 text-2xl font-medium leading-snug text-white md:text-3xl">“{cur.q}”</p>
                  <div className="mt-8 flex items-center gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-full font-bold text-white" style={{ background: `linear-gradient(135deg, ${cur.c}, #0ea5e9)`, boxShadow: `0 0 24px ${cur.c}` }}>
                      {cur.n.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{cur.n}</div>
                      <div className="text-sm text-slate-400">{cur.r}</div>
                    </div>
                    <div className="ml-auto hidden gap-0.5 text-amber-400 sm:flex">
                      {Array.from({ length: 5 }).map((_, k) => <Star key={k} size={16} className="fill-amber-400" />)}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="mt-8 flex justify-center gap-2">
            {quotes.map((_, k) => (
              <button key={k} aria-label={`Show quote ${k + 1}`} onClick={() => setI(k)} className="h-2 rounded-full transition-all duration-500" style={{ width: k === i ? 40 : 10, background: k === i ? cur.c : "rgba(255,255,255,0.2)", boxShadow: k === i ? `0 0 14px ${cur.c}` : undefined }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Trust ---------------- */
export function Trust() {
  return (
    <section className="relative overflow-hidden py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-5 md:grid-cols-2">
        <div className="relative mx-auto grid h-[340px] w-[340px] place-items-center">
          {[0, 1, 2, 3].map((r) => (
            <span key={r} className="animate-ping-slow absolute rounded-full border border-emerald-400/40" style={{ inset: r * 28, animationDelay: `${r * 0.6}s` }} />
          ))}
          <div className="animate-spin-slow absolute inset-6 rounded-full border-2 border-dashed border-cyan-400/30" />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative grid h-36 w-36 place-items-center rounded-[2.2rem] bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-[0_0_80px_rgba(16,185,129,0.7)]"
          >
            <ShieldCheck size={72} className="text-white" />
          </motion.div>
        </div>
        <div>
          <Reveal>
            <span className="glass inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Trust, built in</span>
            <h2 className="font-display mt-6 text-4xl font-bold leading-tight text-white md:text-5xl">Children&apos;s data deserves a <span className="text-gradient">fortress.</span></h2>
            <p className="mt-5 text-lg text-slate-400">Every school is sealed in its own private space. Nothing is shared, nothing is sold, and everything is backed up while you sleep.</p>
          </Reveal>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { to: 256, s: "-bit", l: "Encryption" },
              { to: 24, s: "/7", l: "Monitoring" },
              { to: 100, s: "%", l: "Data isolation" },
            ].map((x, i) => (
              <Reveal key={x.l} delay={0.15 * i}>
                <div className="glass rounded-2xl p-4 text-center">
                  <div className="font-display text-3xl font-bold text-emerald-300"><Counter to={x.to} suffix={x.s} /></div>
                  <div className="mt-1 text-xs text-slate-400">{x.l}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Plans ---------------- */
export function Plans() {
  const plans = [
    { n: "Starter", p: "₹4,999", d: "For small schools taking their first digital step.", c: "#22d3ee" },
    { n: "Pro", p: "₹14,999", d: "For growing schools that want everything connected.", c: "#8b5cf6", hot: true },
    { n: "Enterprise", p: "Let's talk", d: "For groups and chains with many campuses.", c: "#ec4899" },
  ];
  return (
    <section id="plans" className="relative py-32">
      <div className="mx-auto max-w-6xl px-5">
        <SectionTitle eyebrow="Plans" title="Simple pricing. Serious value." sub="Start free for 30 days. No card. No catch. Cancel by simply stopping." />
        <div className="grid items-center gap-6 md:grid-cols-3">
          {plans.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.12} y={70}>
              {p.hot ? (
                <div className="spin-border md:scale-105">
                  <div className="spin-inner p-8 text-center">
                    <div className="mb-4 inline-block rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-3 py-1 text-xs font-bold text-white">MOST LOVED</div>
                    <PlanBody p={p} />
                  </div>
                </div>
              ) : (
                <TiltCard glow={p.c} className="rounded-[1.25rem] p-8 text-center">
                  <PlanBody p={p} />
                </TiltCard>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
function PlanBody({ p }: { p: { n: string; p: string; d: string; c: string } }) {
  return (
    <>
      <h3 className="font-display text-xl font-bold text-white">{p.n}</h3>
      <div className="font-display my-4 text-5xl font-bold" style={{ color: p.c, textShadow: `0 0 36px ${p.c}aa` }}>{p.p}</div>
      {p.p.startsWith("₹") && <div className="-mt-3 mb-3 text-xs text-slate-500">per month</div>}
      <p className="mb-6 text-slate-400">{p.d}</p>
      <Link href="/login" className="btn-glow inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm">
        <Check size={16} /> Choose {p.n}
      </Link>
    </>
  );
}

/* ---------------- FAQ ---------------- */
export function Faq() {
  const items = [
    ["How long does setup take?", "Most schools are fully live in a single afternoon. Our guided import brings in students, staff and classes from a simple spreadsheet."],
    ["Can parents and students use it too?", "Absolutely. Parents and students have their own beautiful, simplified spaces — on any phone, with nothing to install."],
    ["Is our school's data private?", "Every school lives in its own sealed space with encrypted storage and daily backups. No other school can ever see your data."],
    ["We have several campuses. Will it work?", "Yes. Owners can view every campus side by side while each principal only sees their own."],
    ["What if we want to leave?", "Your data is yours. Export everything in a click, any time, no questions asked."],
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative py-32">
      <div className="mx-auto max-w-3xl px-5">
        <SectionTitle eyebrow="FAQ" title="Questions, answered" />
        <div className="space-y-3">
          {items.map(([q, a], i) => (
            <Reveal key={q} delay={i * 0.06} y={30}>
              <div className={`glass overflow-hidden rounded-2xl transition-shadow ${open === i ? "shadow-[0_0_50px_rgba(139,92,246,0.25)]" : ""}`}>
                <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
                  <span className="font-display text-lg font-semibold text-white">{q}</span>
                  <motion.span animate={{ rotate: open === i ? 180 : 0 }} className="text-violet-300"><ChevronDown /></motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                      <p className="px-5 pb-5 text-slate-400">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Final CTA ---------------- */
export function FinalCta() {
  return (
    <section className="relative overflow-hidden py-40">
      <div className="aurora absolute inset-0" />
      <Particles count={30} />
      <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2">
        <div className="animate-spin-slow absolute inset-0 rounded-full border border-violet-500/30" />
        <div className="absolute inset-16 animate-[spin_30s_linear_infinite_reverse] rounded-full border border-cyan-400/30" />
        <div className="absolute inset-32 animate-spin-slow rounded-full border border-pink-500/30" />
      </div>
      <div className="relative mx-auto max-w-4xl px-5 text-center">
        <h2 className="font-display text-5xl font-bold leading-[1.05] text-white md:text-8xl">
          <SplitWords text="Ready to feel the" /> <br />
          <SplitWords text="calm of a school that runs itself?" delay={0.25} gradientFrom={4} />
        </h2>
        <Reveal delay={0.3}>
          <p className="mx-auto mt-8 max-w-xl text-xl text-slate-300">Step inside the demo in one click. No sign-up, no forms, no waiting.</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Magnetic>
              <DemoButton className="btn-glow inline-flex items-center gap-2 rounded-2xl px-10 py-5 text-lg">
                Enter the demo <ArrowRight />
              </DemoButton>
            </Magnetic>
            <Link href="/login" className="glass rounded-2xl px-10 py-5 text-lg text-white transition hover:bg-white/10">Create an account</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-14">
      <div className="divider-glow absolute inset-x-0 top-0" />
      <Parallax offset={10}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 md:flex-row">
          <Logo />
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} SchoolOS. Crafted for schools that care.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#story" className="hover:text-white">Story</a>
            <a href="#plans" className="hover:text-white">Plans</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
            <Link href="/login" className="hover:text-white">Sign in</Link>
          </div>
        </div>
      </Parallax>
    </footer>
  );
}
