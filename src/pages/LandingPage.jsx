import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// ======================================
// CONFIG: change these if your routes differ
// ======================================
const LOGIN_PATH = "/login";
const REGISTER_PATH = "/register";

// ======================================
// CONTENT
// ======================================
const features = [
  {
    icon: "🎫",
    title: "Centralized ticketing",
    text: "Every request from every team in one organized queue, with clear priorities, owners and statuses.",
  },
  {
    icon: "🏢",
    title: "Organizations & projects",
    text: "Keep each organization and project separate, so the right people see the right tickets.",
  },
  {
    icon: "🔐",
    title: "Role-based access",
    text: "Admins, Support Leads and Employees each get the permissions they need, nothing more.",
  },
  {
    icon: "✉️",
    title: "Easy team invitations",
    text: "Invite teammates by email, assign their role, and track who has joined in a few clicks.",
  },
  {
    icon: "📊",
    title: "Live progress tracking",
    text: "Follow every request from open to resolved, so nothing slips through the cracks.",
  },
  {
    icon: "⚡",
    title: "Fast and simple",
    text: "A clean, distraction-free workspace that your whole team can learn in minutes.",
  },
];

const steps = [
  {
    title: "Create your workspace",
    text: "Sign up with your organization and be ready in under a minute.",
  },
  {
    title: "Invite your team",
    text: "Send email invitations and assign Admin, Support Lead or Employee roles.",
  },
  {
    title: "Resolve tickets together",
    text: "Raise, assign and track requests until every one is closed.",
  },
];

const roles = [
  {
    name: "Admin",
    text: "Full control: manage the organization, invite people and assign roles.",
    tag: "Control",
    perks: ["Invite & manage members", "Assign roles", "Oversee all projects"],
  },
  {
    name: "Support Lead",
    text: "Triage incoming tickets, assign owners and keep the team on track.",
    tag: "Manage",
    perks: ["Triage & assign tickets", "Track team progress", "Close resolved work"],
  },
  {
    name: "Employee",
    text: "Raise requests, follow their progress and get answers fast.",
    tag: "Request",
    perks: ["Raise new tickets", "Follow live status", "Get notified on updates"],
  },
];

// Replace these with your real numbers before launch
const stats = [
  { to: 40, suffix: "+", label: "Organizations" },
  { to: 10, suffix: "k+", label: "Tickets resolved" },
  { to: 99.9, suffix: "%", decimals: 1, label: "Uptime" },
  { to: 1, prefix: "< ", suffix: " min", label: "Setup time" },
];

const useCases = [
  "IT Support",
  "HR Requests",
  "Facilities",
  "Finance Ops",
  "Customer Support",
  "Logistics",
  "Procurement",
  "Internal Tools",
];

const faqs = [
  {
    q: "Who can invite people to my organization?",
    a: "Only Admins can send invitations and assign roles. Invited people receive an email and join your workspace once they accept.",
  },
  {
    q: "What roles are available?",
    a: "Relay has three roles: Admin, Support Lead and Employee. Each role sees and does only what it needs.",
  },
  {
    q: "How long does setup take?",
    a: "Most teams are ready in under a minute: create your account, confirm your email and start inviting your team.",
  },
  {
    q: "Can I manage more than one project?",
    a: "Yes. Organize work into projects inside your organization and keep every ticket in the right place.",
  },
  {
    q: "I forgot my password. What do I do?",
    a: "Use the Forgot password link on the sign-in page. We email you a secure link to set a new password.",
  },
];

const tabs = [
  { id: "tickets", label: "Tickets" },
  { id: "projects", label: "Projects" },
  { id: "team", label: "Team" },
];

const mockTickets = [
  { id: "#1042", title: "VPN access for new hire", status: "Open", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  { id: "#1041", title: "Invoice export not working", status: "In progress", color: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  { id: "#1039", title: "Update shipping dashboard", status: "Resolved", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  { id: "#1037", title: "Reset warehouse login", status: "Resolved", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
];

const mockProjects = [
  { name: "Warehouse Systems", tickets: 18, progress: 72 },
  { name: "Customer Portal", tickets: 11, progress: 45 },
  { name: "Finance Automation", tickets: 7, progress: 90 },
];

const mockTeam = [
  { name: "Arnab Khan", role: "Admin", status: "Active", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  { name: "Priya Sen", role: "Support Lead", status: "Active", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  { name: "Rahul Das", role: "Employee", status: "Invited", color: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
];

// ======================================
// SMALL HELPERS
// ======================================
function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-gradient-to-br from-[#5b6ef5] to-[#3d4bc7] shadow-[0_4px_14px_rgba(91,110,245,0.35)]">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path
            d="M5 12.5L10 17L19 7"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="text-xl font-bold tracking-tight text-[#f3f5fb]">
        Relay
      </span>
    </div>
  );
}

// Returns [ref, visible]; becomes true once the element scrolls into view
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, visible];
}

// Fades and slides content in when scrolled into view
function Reveal({ children, delay = 0, className = "" }) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      className={`relay-reveal ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity .8s ease ${delay}s, transform .8s cubic-bezier(.2,.7,.2,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// Counts up to a number when scrolled into view
function Counter({ to, prefix = "", suffix = "", decimals = 0 }) {
  const [ref, visible] = useInView(0.4);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const duration = 1600;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, to]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}

// Card with a glow that follows the mouse
function SpotlightCard({ children, className = "" }) {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div
      onMouseMove={onMove}
      className={`relay-spot group relative overflow-hidden rounded-2xl border border-[#1d2545] bg-gradient-to-b from-[#111830] to-[#0d1326] transition duration-300 hover:-translate-y-1 hover:border-[#5b6ef5]/50 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(360px circle at var(--mx,50%) var(--my,50%), rgba(91,110,245,0.18), transparent 60%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

function SectionHeading({ tag, title, sub }) {
  return (
    <Reveal className="mx-auto mb-14 max-w-2xl text-center">
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#5b6ef5]">
        {tag}
      </div>
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      {sub && <p className="mt-4 text-[#aab4d4]">{sub}</p>}
    </Reveal>
  );
}

// ======================================
// PAGE
// ======================================
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tickets");
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 12);
      setProgress(max > 0 ? (y / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#product", label: "Product" },
    { href: "#how", label: "How it works" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0a0e1a] text-[#f3f5fb]">
      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes relay-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes relay-fade-up { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes relay-glow { 0%,100% { opacity: .5; } 50% { opacity: .95; } }
        @keyframes relay-aurora { 0% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,-30px) scale(1.15); } 100% { transform: translate(0,0) scale(1); } }
        @keyframes relay-shimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
        @keyframes relay-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes relay-spin { to { transform: rotate(360deg); } }
        @keyframes relay-pop { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .relay-float { animation: relay-float 6s ease-in-out infinite; }
        .relay-fade-up { animation: relay-fade-up .8s ease-out both; }
        .relay-glow { animation: relay-glow 7s ease-in-out infinite; }
        .relay-aurora { animation: relay-aurora 14s ease-in-out infinite; }
        .relay-shimmer-text { background-size: 200% auto; animation: relay-shimmer 6s linear infinite; }
        .relay-marquee { animation: relay-marquee 32s linear infinite; }
        .relay-marquee:hover { animation-play-state: paused; }
        .relay-pop { animation: relay-pop .45s ease-out both; }
        .relay-border-spin::before {
          content: ""; position: absolute; inset: -150%;
          background: conic-gradient(from 0deg, transparent 0 70%, #5b6ef5 85%, #34ebc1 100%);
          animation: relay-spin 6s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation: none !important; transition: none !important; }
          .relay-reveal { opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      {/* Scroll progress bar */}
      <div className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-[#5b6ef5] via-[#8b9bff] to-[#34ebc1]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Background aurora */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[820px] overflow-hidden">
        <div className="relay-glow absolute -top-40 left-1/2 h-[520px] w-[860px] -translate-x-1/2 rounded-full bg-[#5b6ef5]/25 blur-[120px]" />
        <div className="relay-aurora absolute left-[6%] top-40 h-72 w-72 rounded-full bg-[#3d4bc7]/25 blur-[100px]" />
        <div className="relay-aurora absolute right-[6%] top-56 h-64 w-64 rounded-full bg-[#34ebc1]/10 blur-[100px]" style={{ animationDelay: "-6s" }} />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse at 50% 20%, black 0%, transparent 65%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 50% 20%, black 0%, transparent 65%)",
          }}
        />
      </div>

      {/* NAVBAR */}
      <header
        className={`fixed inset-x-0 top-[3px] z-50 transition-all duration-300 ${
          scrolled || menuOpen
            ? "border-b border-[#1d2545] bg-[#0a0e1a]/80 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6">
          <a href="#top" aria-label="Relay home">
            <Logo />
          </a>

          <nav className="hidden items-center gap-9 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-[#aab4d4] transition hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to={LOGIN_PATH}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-[#f3f5fb] transition hover:bg-white/5"
            >
              Sign in
            </Link>
            <Link
              to={REGISTER_PATH}
              className="rounded-lg bg-gradient-to-r from-[#5b6ef5] to-[#4557e0] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(91,110,245,0.35)] transition hover:-translate-y-0.5 hover:opacity-95"
            >
              Get started
            </Link>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#2a3358] text-[#f3f5fb] md:hidden"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-[#1d2545] px-6 pb-6 pt-4 md:hidden">
            <div className="flex flex-col gap-4">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-[#aab4d4]"
                >
                  {l.label}
                </a>
              ))}
              <Link
                to={LOGIN_PATH}
                className="rounded-lg border border-[#2a3358] py-3 text-center text-sm font-semibold"
              >
                Sign in
              </Link>
              <Link
                to={REGISTER_PATH}
                className="rounded-lg bg-gradient-to-r from-[#5b6ef5] to-[#4557e0] py-3 text-center text-sm font-semibold text-white"
              >
                Get started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="top" className="relative px-6 pb-16 pt-36 md:pt-44">
        <div className="mx-auto max-w-4xl text-center">
          <div className="relay-fade-up mb-7 inline-flex items-center gap-2 rounded-full border border-[#2a3358] bg-[#131a30]/80 px-4 py-1.5 text-xs font-medium text-[#aab4d4] backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Ticket Management Platform
          </div>

          <h1
            className="relay-fade-up text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-7xl"
            style={{ animationDelay: "0.08s" }}
          >
            Bring your organization and{" "}
            <span className="relay-shimmer-text bg-gradient-to-r from-[#8b9bff] via-[#34ebc1] to-[#8b9bff] bg-clip-text text-transparent">
              tickets together.
            </span>
          </h1>

          <p
            className="relay-fade-up mx-auto mt-7 max-w-2xl text-base leading-relaxed text-[#aab4d4] md:text-lg"
            style={{ animationDelay: "0.16s" }}
          >
            Relay gives your team one organized workspace to manage
            organizations, projects and support tickets, with clear roles and
            simple request tracking.
          </p>

          <div
            className="relay-fade-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            style={{ animationDelay: "0.24s" }}
          >
            <Link
              to={REGISTER_PATH}
              className="w-full rounded-xl bg-gradient-to-r from-[#5b6ef5] to-[#4557e0] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(91,110,245,0.45)] transition hover:-translate-y-0.5 hover:opacity-95 sm:w-auto"
            >
              Create free account →
            </Link>
            <a
              href="#product"
              className="w-full rounded-xl border border-[#2a3358] bg-[#131a30]/70 px-8 py-3.5 text-sm font-semibold text-[#f3f5fb] backdrop-blur transition hover:border-[#5b6ef5] sm:w-auto"
            >
              See how it works
            </a>
          </div>

          <p
            className="relay-fade-up mt-6 text-[13px] text-[#6b7396]"
            style={{ animationDelay: "0.32s" }}
          >
            Trusted by support and product teams across 40+ organizations
          </p>
        </div>

        {/* Hero dashboard preview */}
        <div
          className="relay-fade-up relative mx-auto mt-16 max-w-5xl"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="absolute -inset-x-6 -bottom-10 -top-6 rounded-[32px] bg-gradient-to-b from-[#5b6ef5]/25 to-transparent blur-2xl" />

          <div className="relative overflow-hidden rounded-2xl border border-[#2a3358] bg-[#0d1326] shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2 border-b border-[#1d2545] bg-[#0b1020] px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="ml-4 rounded-md bg-[#161d33] px-3 py-1 text-[11px] text-[#6b7396]">
                relay.app/tickets
              </span>
            </div>

            <div className="grid md:grid-cols-[200px_1fr]">
              <div className="hidden border-r border-[#1d2545] bg-[#0b1020] p-5 md:block">
                <div className="mb-6 text-[11px] font-semibold uppercase tracking-widest text-[#6b7396]">
                  Northwind Logistics
                </div>
                {["Overview", "Projects", "Tickets", "Invitation"].map(
                  (item) => (
                    <div
                      key={item}
                      className={`mb-2 rounded-lg px-3 py-2 text-[13px] ${
                        item === "Tickets"
                          ? "bg-[#1b2447] font-semibold text-white"
                          : "text-[#8a94b8]"
                      }`}
                    >
                      {item}
                    </div>
                  )
                )}
              </div>

              <div className="p-5 sm:p-7">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold">Tickets</div>
                    <div className="text-xs text-[#6b7396]">
                      4 requests this week
                    </div>
                  </div>
                  <div className="rounded-lg bg-[#5b6ef5] px-4 py-2 text-xs font-semibold text-white">
                    + New ticket
                  </div>
                </div>

                <div className="mb-5 grid grid-cols-3 gap-3">
                  {[
                    ["Open", "12"],
                    ["In progress", "7"],
                    ["Resolved", "58"],
                  ].map(([l, v]) => (
                    <div
                      key={l}
                      className="rounded-xl border border-[#1d2545] bg-[#111830] p-4"
                    >
                      <div className="text-[11px] text-[#6b7396]">{l}</div>
                      <div className="mt-1 text-2xl font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="overflow-hidden rounded-xl border border-[#1d2545]">
                  {mockTickets.map((t, i) => (
                    <div
                      key={t.id}
                      className={`flex items-center justify-between gap-3 bg-[#111830] px-4 py-3.5 ${
                        i !== mockTickets.length - 1
                          ? "border-b border-[#1d2545]"
                          : ""
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="text-xs text-[#6b7396]">{t.id}</span>
                        <span className="truncate text-sm font-medium">
                          {t.title}
                        </span>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold ${t.color}`}
                      >
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="relay-float absolute -left-4 top-24 hidden rounded-xl border border-[#2a3358] bg-[#131a30]/95 px-4 py-3 shadow-2xl backdrop-blur lg:block">
            <div className="text-[11px] text-[#6b7396]">Ticket resolved</div>
            <div className="text-sm font-semibold text-emerald-300">
              ✓ Invoice export fixed
            </div>
          </div>
          <div
            className="relay-float absolute -right-4 bottom-24 hidden rounded-xl border border-[#2a3358] bg-[#131a30]/95 px-4 py-3 shadow-2xl backdrop-blur lg:block"
            style={{ animationDelay: "2s" }}
          >
            <div className="text-[11px] text-[#6b7396]">New invitation</div>
            <div className="text-sm font-semibold text-[#8b9bff]">
              ✉ Employee joined
            </div>
          </div>
        </div>
      </section>

      {/* USE-CASE MARQUEE */}
      <section className="py-10">
        <div className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#6b7396]">
          Built for every team
        </div>
        <div
          className="relative overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
          }}
        >
          <div className="relay-marquee flex w-max gap-4">
            {[...useCases, ...useCases].map((u, i) => (
              <span
                key={`${u}-${i}`}
                className="whitespace-nowrap rounded-full border border-[#1d2545] bg-[#0d1326] px-6 py-2.5 text-sm font-medium text-[#aab4d4]"
              >
                {u}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="px-6 py-10">
        <Reveal>
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 rounded-2xl border border-[#1d2545] bg-[#0d1326]/80 p-8 backdrop-blur md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="bg-gradient-to-r from-[#8b9bff] to-[#34ebc1] bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
                  <Counter
                    to={s.to}
                    prefix={s.prefix}
                    suffix={s.suffix}
                    decimals={s.decimals}
                  />
                </div>
                <div className="mt-1 text-sm text-[#8a94b8]">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            tag="Features"
            title="Everything your team needs to stay organized"
            sub="Powerful where it matters, simple everywhere else."
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 0.08}>
                <SpotlightCard className="h-full p-7">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[#2a3358] bg-[#161d33] text-xl transition group-hover:border-[#5b6ef5]/60">
                    {f.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-[#aab4d4]">
                    {f.text}
                  </p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT TOUR */}
      <section id="product" className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            tag="Product tour"
            title="See Relay in action"
            sub="Switch between views to see how your team will work."
          />

          <Reveal>
            <div className="mb-6 flex justify-center">
              <div className="inline-flex rounded-xl border border-[#1d2545] bg-[#0d1326] p-1.5">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition ${
                      activeTab === t.id
                        ? "bg-gradient-to-r from-[#5b6ef5] to-[#4557e0] text-white shadow-[0_4px_14px_rgba(91,110,245,0.35)]"
                        : "text-[#8a94b8] hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-[#2a3358] bg-[#0d1326] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.5)] sm:p-8">
              <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#5b6ef5]/15 blur-[80px]" />

              <div key={activeTab} className="relay-pop relative">
                {activeTab === "tickets" && (
                  <div>
                    <h3 className="mb-1 text-xl font-bold">
                      Every request, one queue
                    </h3>
                    <p className="mb-6 text-sm text-[#aab4d4]">
                      Raise, assign and track tickets with clear statuses.
                    </p>
                    <div className="space-y-3">
                      {mockTickets.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-[#1d2545] bg-[#111830] px-5 py-4"
                        >
                          <div className="flex min-w-0 items-center gap-4">
                            <span className="text-xs text-[#6b7396]">
                              {t.id}
                            </span>
                            <span className="truncate text-sm font-medium">
                              {t.title}
                            </span>
                          </div>
                          <span
                            className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold ${t.color}`}
                          >
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "projects" && (
                  <div>
                    <h3 className="mb-1 text-xl font-bold">
                      Projects that stay organized
                    </h3>
                    <p className="mb-6 text-sm text-[#aab4d4]">
                      Group tickets by project and watch progress at a glance.
                    </p>
                    <div className="grid gap-4 md:grid-cols-3">
                      {mockProjects.map((p) => (
                        <div
                          key={p.name}
                          className="rounded-xl border border-[#1d2545] bg-[#111830] p-5"
                        >
                          <div className="mb-1 text-sm font-semibold">
                            {p.name}
                          </div>
                          <div className="mb-4 text-xs text-[#6b7396]">
                            {p.tickets} tickets
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-[#1d2545]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#5b6ef5] to-[#34ebc1]"
                              style={{ width: `${p.progress}%` }}
                            />
                          </div>
                          <div className="mt-2 text-right text-xs text-[#8a94b8]">
                            {p.progress}% complete
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "team" && (
                  <div>
                    <h3 className="mb-1 text-xl font-bold">
                      Invite your team with roles
                    </h3>
                    <p className="mb-6 text-sm text-[#aab4d4]">
                      Admins invite by email and decide who can do what.
                    </p>
                    <div className="space-y-3">
                      {mockTeam.map((m) => (
                        <div
                          key={m.name}
                          className="flex items-center justify-between gap-3 rounded-xl border border-[#1d2545] bg-[#111830] px-5 py-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-xs font-bold text-white">
                              {m.name
                                .split(" ")
                                .map((w) => w[0])
                                .join("")}
                            </div>
                            <div>
                              <div className="text-sm font-semibold">
                                {m.name}
                              </div>
                              <div className="text-xs text-[#6b7396]">
                                {m.role}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${m.color}`}
                          >
                            {m.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            tag="How it works"
            title="Up and running in three steps"
          />

          <div className="relative grid gap-6 md:grid-cols-3">
            <div className="pointer-events-none absolute left-[16%] right-[16%] top-[54px] hidden h-px bg-gradient-to-r from-transparent via-[#2a3358] to-transparent md:block" />
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.12}>
                <div className="relative h-full rounded-2xl border border-[#1d2545] bg-[#0d1326] p-8">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#5b6ef5] to-[#3d4bc7] text-base font-bold shadow-[0_4px_14px_rgba(91,110,245,0.35)]">
                    {i + 1}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-[#aab4d4]">
                    {s.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            tag="Roles"
            title="The right access for every person"
          />

          <div className="grid gap-6 md:grid-cols-3">
            {roles.map((r, i) => (
              <Reveal key={r.name} delay={i * 0.1}>
                <SpotlightCard className="h-full p-8">
                  <span className="mb-4 inline-block rounded-full border border-[#2a3358] bg-[#161d33] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#8b9bff]">
                    {r.tag}
                  </span>
                  <h3 className="mb-2 text-xl font-semibold">{r.name}</h3>
                  <p className="mb-5 text-sm leading-relaxed text-[#aab4d4]">
                    {r.text}
                  </p>
                  <ul className="space-y-2">
                    {r.perks.map((p) => (
                      <li
                        key={p}
                        className="flex items-center gap-2 text-sm text-[#d6dcf2]"
                      >
                        <span className="text-[#34ebc1]">✓</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <SectionHeading tag="FAQ" title="Questions? We have answers" />

          <Reveal>
            <div className="space-y-3">
              {faqs.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div
                    key={f.q}
                    className={`overflow-hidden rounded-xl border transition ${
                      open
                        ? "border-[#5b6ef5]/50 bg-[#111830]"
                        : "border-[#1d2545] bg-[#0d1326]"
                    }`}
                  >
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? -1 : i)}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    >
                      <span className="text-[15px] font-semibold">{f.q}</span>
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#2a3358] text-sm transition-transform duration-300 ${
                          open ? "rotate-45 text-[#34ebc1]" : "text-[#8a94b8]"
                        }`}
                      >
                        +
                      </span>
                    </button>
                    <div
                      className="grid transition-all duration-300 ease-out"
                      style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        <p className="px-6 pb-5 text-sm leading-relaxed text-[#aab4d4]">
                          {f.a}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 pb-24 pt-10">
        <Reveal>
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl p-[1.5px]">
            <div className="relay-border-spin absolute inset-0" />
            <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#1a2350] via-[#121a38] to-[#0d1326] px-8 py-16 text-center">
              <div className="absolute -top-24 left-1/2 h-64 w-[500px] -translate-x-1/2 rounded-full bg-[#5b6ef5]/30 blur-[90px]" />
              <div className="relative">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Ready to bring your tickets together?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-[#aab4d4]">
                  Create your Relay workspace today and invite your team in
                  minutes.
                </p>
                <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    to={REGISTER_PATH}
                    className="w-full rounded-xl bg-gradient-to-r from-[#5b6ef5] to-[#4557e0] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(91,110,245,0.45)] transition hover:-translate-y-0.5 sm:w-auto"
                  >
                    Get started free
                  </Link>
                  <Link
                    to={LOGIN_PATH}
                    className="w-full rounded-xl border border-[#2a3358] px-8 py-3.5 text-sm font-semibold transition hover:border-[#5b6ef5] sm:w-auto"
                  >
                    I already have an account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#1d2545] px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 md:flex-row">
          <Logo />
          <div className="flex flex-wrap items-center justify-center gap-7 text-sm text-[#8a94b8]">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#product" className="hover:text-white">Product</a>
            <a href="#how" className="hover:text-white">How it works</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
            <Link to={LOGIN_PATH} className="hover:text-white">Sign in</Link>
          </div>
          <div className="text-xs text-[#6b7396]">
            © 2026 Relay. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Back to top */}
      <a
        href="#top"
        aria-label="Back to top"
        className={`fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-[#2a3358] bg-[#131a30]/90 text-[#f3f5fb] shadow-xl backdrop-blur transition-all duration-300 hover:border-[#5b6ef5] ${
          scrolled ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        ↑
      </a>
    </div>
  );
}
