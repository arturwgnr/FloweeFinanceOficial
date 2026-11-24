import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Globe,
  Lightbulb,
  LockKeyhole,
  Repeat,
  ShieldCheck,
  Smartphone,
  Snowflake,
  Star,
  Tags,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import "../styles/pages/Landing.css";

/* ------------------------------------------------------------------ */
/* Sample data used by the product previews (illustrative only)        */
/* ------------------------------------------------------------------ */

const MONTHS = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
const INCOME = [5200, 5200, 5650, 5200, 5900, 6050];
const EXPENSES = [3480, 3910, 3320, 4100, 3650, 3120];

/* Same palette as the dashboard pie chart */
const CATEGORIES = [
  { name: "Housing", value: 1250, color: "#10b77f" },
  { name: "Supermarket", value: 620, color: "#f59e0b" },
  { name: "Food", value: 410, color: "#3b82f6" },
  { name: "Other", value: 370, color: "#8b5cf6" },
  { name: "Transport", value: 280, color: "#ec4899" },
  { name: "Entertainment", value: 190, color: "#14b8a6" },
];

const BUDGETS = [
  { name: "Food", spent: 410, limit: 500, pct: 82 },
  { name: "Supermarket", spent: 620, limit: 700, pct: 89 },
  { name: "Transport", spent: 280, limit: 400, pct: 70 },
  { name: "Entertainment", spent: 190, limit: 150, pct: 127 },
];

const GOALS = [
  { name: "Emergency fund", current: 6400, target: 10000, deadline: "Jun 2027" },
  { name: "Trip to Lisbon", current: 1850, target: 2500, deadline: "Mar 2027" },
];

const INSIGHTS = [
  {
    type: "Suggestion",
    icon: Lightbulb,
    modifier: "suggestion",
    text: "Food delivery made up 38% of your Food spending this month. Cooking two more nights a week would keep you under your $500 budget.",
  },
  {
    type: "Blind Spot",
    icon: EyeOff,
    modifier: "blindspot",
    text: "Entertainment has grown four months in a row and is now 27% over its limit. Most of it is small, repeated charges.",
  },
  {
    type: "Cold Analysis",
    icon: Snowflake,
    modifier: "cold",
    text: "You kept 48% of your income in November, up from 38% in October. Housing is fixed at 21% of income.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Create your account",
    desc: "Name, email and a password. Choose your currency and categories whenever you like.",
  },
  {
    number: "02",
    title: "Log your money",
    desc: "Add income and expenses as they happen. Set rent or salary as recurring once and forget it.",
  },
  {
    number: "03",
    title: "Read your month",
    desc: "Your dashboard, budgets and goals update instantly. Ask Flowee Insights for a straight read.",
  },
];

const TRUST = [
  { icon: LockKeyhole, label: "Passwords stored hashed" },
  { icon: ShieldCheck, label: "No bank login required" },
  { icon: Globe, label: "USD, EUR and BRL" },
  { icon: Smartphone, label: "Phone, tablet and desktop" },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const fmt = (n) => `$${n.toLocaleString("en-US")}`;

/* Smooth SVG path through points (Catmull-Rom to cubic Bezier) */
function smoothPath(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0]} ${p2[1].toFixed(1)}`;
  }
  return d;
}

const CHART_W = 320;
const CHART_H = 120;
const CHART_MAX = 7000;

function toPoints(values) {
  const step = CHART_W / (values.length - 1);
  return values.map((v, i) => [
    Math.round(i * step),
    CHART_H - (v / CHART_MAX) * CHART_H,
  ]);
}

/* Reveal elements with the .reveal class as they enter the viewport */
function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return undefined;

    root.classList.add("landing--motion");
    const items = root.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef]);
}

/* ------------------------------------------------------------------ */
/* Product previews                                                    */
/* ------------------------------------------------------------------ */

function LineChartPreview() {
  const inc = toPoints(INCOME);
  const exp = toPoints(EXPENSES);
  const incPath = smoothPath(inc);
  const expPath = smoothPath(exp);
  const incArea = `${incPath} L ${CHART_W} ${CHART_H} L 0 ${CHART_H} Z`;

  return (
    <div className="mock-chart">
      <div className="mock-chart__head">
        <span className="mock-chart__title">Income vs Expenses</span>
        <span className="mock-chart__legend">
          <span className="mock-chart__key mock-chart__key--income">Income</span>
          <span className="mock-chart__key mock-chart__key--expense">Expenses</span>
        </span>
      </div>
      <svg
        className="mock-chart__svg"
        viewBox={`0 -6 ${CHART_W} ${CHART_H + 12}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="lpIncomeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b77f" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#10b77f" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((r) => (
          <line
            key={r}
            className="mock-chart__grid"
            x1="0"
            x2={CHART_W}
            y1={CHART_H * r}
            y2={CHART_H * r}
          />
        ))}
        <path d={incArea} fill="url(#lpIncomeFill)" />
        <path className="mock-chart__line mock-chart__line--income" d={incPath} />
        <path className="mock-chart__line mock-chart__line--expense" d={expPath} />
      </svg>
      <div className="mock-chart__axis" aria-hidden="true">
        {MONTHS.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
}

function DonutPreview() {
  const total = CATEGORIES.reduce((s, c) => s + c.value, 0);
  const r = 15.915; // circumference ~100
  let offset = 25;
  return (
    <div className="mock-donut">
      <span className="mock-chart__title">Expenses by Category</span>
      <div className="mock-donut__body">
        <svg className="mock-donut__svg" viewBox="0 0 42 42" aria-hidden="true">
          <circle className="mock-donut__track" cx="21" cy="21" r={r} />
          {CATEGORIES.map((c) => {
            const pct = (c.value / total) * 100;
            const seg = (
              <circle
                key={c.name}
                cx="21"
                cy="21"
                r={r}
                fill="none"
                stroke={c.color}
                strokeWidth="5"
                strokeDasharray={`${Math.max(pct - 0.8, 0)} ${100 - pct + 0.8}`}
                strokeDashoffset={offset}
              />
            );
            offset -= pct;
            return seg;
          })}
        </svg>
        <ul className="mock-donut__legend">
          {CATEGORIES.slice(0, 4).map((c) => (
            <li key={c.name} className="mock-donut__item">
              <svg className="mock-donut__dot" viewBox="0 0 8 8" aria-hidden="true">
                <circle cx="4" cy="4" r="4" fill={c.color} />
              </svg>
              <span className="mock-donut__name">{c.name}</span>
              <span className="mock-donut__pct">
                {Math.round((c.value / total) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function HeroPreview() {
  const stats = [
    { label: "Balance", value: "$2,930", trend: null },
    { label: "Income", value: "$6,050", trend: { dir: "up", text: "2.5%" } },
    { label: "Expenses", value: "$3,120", trend: { dir: "down", text: "14.5%" } },
  ];

  return (
    <div className="hero-preview">
      <div className="hero-preview__window">
        <div className="hero-preview__bar" aria-hidden="true">
          <span className="hero-preview__dot" />
          <span className="hero-preview__dot" />
          <span className="hero-preview__dot" />
          <span className="hero-preview__url">flowee / dashboard</span>
        </div>

        <div className="hero-preview__body">
          <div className="hero-preview__top">
            <div>
              <p className="hero-preview__hello">Good morning, Marta</p>
              <p className="hero-preview__sub">Your overview for November</p>
            </div>
            <div className="hero-preview__month" aria-hidden="true">
              <ChevronLeft size={14} />
              <span>Nov 2026</span>
              <ChevronRight size={14} />
            </div>
          </div>

          <div className="hero-preview__stats">
            {stats.map((s) => (
              <div key={s.label} className="hero-stat">
                <p className="hero-stat__label">
                  {s.label}
                  {s.label === "Balance" && (
                    <Eye size={12} className="hero-stat__eye" aria-hidden="true" />
                  )}
                </p>
                <p className="hero-stat__value">{s.value}</p>
                {s.trend ? (
                  <span
                    className={`hero-stat__trend hero-stat__trend--${s.trend.dir}`}
                  >
                    {s.trend.dir === "up" ? (
                      <TrendingUp size={11} aria-hidden="true" />
                    ) : (
                      <TrendingDown size={11} aria-hidden="true" />
                    )}
                    {s.trend.text}
                  </span>
                ) : (
                  <span className="hero-stat__trend hero-stat__trend--flat">
                    this month
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="hero-preview__charts">
            <LineChartPreview />
            <DonutPreview />
          </div>
        </div>
      </div>

      <div className="hero-float hero-float--budget" aria-hidden="true">
        <div className="hero-float__row">
          <Wallet size={14} />
          <span className="hero-float__label">Monthly budget</span>
          <span className="hero-float__pct">78%</span>
        </div>
        <div className="mock-meter">
          <span className="mock-meter__fill mock-meter__fill--p78" />
        </div>
        <p className="hero-float__meta">$3,120 of $4,000</p>
      </div>

      <div className="hero-float hero-float--insight" aria-hidden="true">
        <span className="hero-float__chip">
          <EyeOff size={12} /> Blind Spot
        </span>
        <p className="hero-float__text">
          Entertainment is up four months in a row.
        </p>
      </div>

      <p className="hero-preview__note">Preview with sample data</p>
    </div>
  );
}

function BudgetsPreview() {
  return (
    <div className="panel-preview" aria-hidden="true">
      <div className="panel-preview__card panel-preview__card--wide">
        <div className="budget-total">
          <div>
            <p className="budget-total__label">Monthly budget</p>
            <p className="budget-total__value">
              $3,120 <span>/ $4,000</span>
            </p>
          </div>
          <span className="budget-total__left">$880 left</span>
        </div>
        <div className="mock-meter mock-meter--lg">
          <span className="mock-meter__fill mock-meter__fill--p78" />
        </div>
      </div>

      <div className="panel-preview__card">
        <p className="panel-preview__title">Category budgets</p>
        <ul className="budget-list">
          {BUDGETS.map((b) => {
            const state = b.pct > 100 ? "over" : b.pct >= 85 ? "warn" : "ok";
            return (
              <li key={b.name} className="budget-list__item">
                <div className="budget-list__row">
                  <span className="budget-list__name">{b.name}</span>
                  <span className={`budget-list__amount budget-list__amount--${state}`}>
                    {fmt(b.spent)} <span>/ {fmt(b.limit)}</span>
                  </span>
                </div>
                <div className="mock-meter">
                  <span
                    className={`mock-meter__fill mock-meter__fill--p${Math.min(b.pct, 100)} mock-meter__fill--${state}`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="panel-preview__card">
        <p className="panel-preview__title">Active goals</p>
        <ul className="goal-list">
          {GOALS.map((g) => {
            const pct = Math.round((g.current / g.target) * 100);
            return (
              <li key={g.name} className="goal-list__item">
                <svg className="goal-ring" viewBox="0 0 36 36">
                  <circle className="goal-ring__track" cx="18" cy="18" r="15.915" />
                  <circle
                    className="goal-ring__fill"
                    cx="18"
                    cy="18"
                    r="15.915"
                    strokeDasharray={`${pct} ${100 - pct}`}
                    strokeDashoffset="25"
                  />
                  <text className="goal-ring__text" x="18" y="20.5">
                    {pct}%
                  </text>
                </svg>
                <div className="goal-list__body">
                  <span className="goal-list__name">{g.name}</span>
                  <span className="goal-list__meta">
                    {fmt(g.current)} of {fmt(g.target)} · by {g.deadline}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Landing() {
  const rootRef = useRef(null);
  const sentinelRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useReveal(rootRef);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(([entry]) =>
      setScrolled(!entry.isIntersecting),
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const year = new Date().getFullYear();

  return (
    <div className="landing" ref={rootRef}>
      <a className="landing__skip" href="#main">
        Skip to content
      </a>
      <span className="landing__sentinel" ref={sentinelRef} aria-hidden="true" />

      {/* Navigation */}
      <header className={`landing__nav${scrolled ? " landing__nav--scrolled" : ""}`}>
        <div className="landing__nav-inner">
          <Link to="/" className="brand" aria-label="Flowee home">
            <span className="brand__mark" aria-hidden="true">
              ᨒ
            </span>
            <span className="brand__name">Flowee</span>
          </Link>

          <nav className="landing__nav-links" aria-label="Sections">
            <a href="#features" className="landing__nav-link">
              Features
            </a>
            <a href="#insights" className="landing__nav-link">
              Insights
            </a>
            <a href="#how-it-works" className="landing__nav-link">
              How it works
            </a>
          </nav>

          <div className="landing__nav-actions">
            <Link to="/login" className="landing__nav-signin">
              Sign in
            </Link>
            <Link to="/register" className="lbtn lbtn--primary lbtn--sm">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="hero">
          <div className="hero__glow" aria-hidden="true" />
          <div className="hero__inner">
            <div className="hero__copy">
              <p className="hero__kicker reveal">
                <span className="hero__kicker-dot" aria-hidden="true" />
                Budgets, goals and an honest AI read
              </p>
              <h1 className="hero__title reveal reveal--d1">
                Know exactly where your money <em>flows</em>.
              </h1>
              <p className="hero__lead reveal reveal--d2">
                Flowee brings your income, expenses, budgets and savings goals
                into one clear dashboard, then tells you plainly what the
                numbers mean.
              </p>
              <div className="hero__ctas reveal reveal--d3">
                <Link to="/register" className="lbtn lbtn--primary lbtn--lg">
                  Create free account
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link to="/login" className="lbtn lbtn--ghost lbtn--lg">
                  Sign in
                </Link>
              </div>
              <ul className="hero__facts reveal reveal--d4">
                <li>Free to use</li>
                <li>No bank connection</li>
                <li>Works on any device</li>
              </ul>
            </div>

            <div className="hero__visual reveal reveal--d2">
              <HeroPreview />
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="trust" aria-label="Product facts">
          <ul className="trust__list">
            {TRUST.map(({ icon: Icon, label }) => (
              <li key={label} className="trust__item">
                <Icon size={18} aria-hidden="true" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Feature: Dashboard */}
        <section className="feature" id="features">
          <div className="feature__inner">
            <div className="feature__copy reveal">
              <p className="feature__eyebrow">Dashboard</p>
              <h2 className="feature__title">
                Your whole month, readable in ten seconds.
              </h2>
              <p className="feature__text">
                Balance, income and expenses with trends against last month.
                Six months of income against spending, and a breakdown of where
                it went by category.
              </p>
              <ul className="feature__points">
                <li>Move back to any previous month</li>
                <li>Hide your balance with one tap when people are around</li>
                <li>Edit recent transactions right from the dashboard</li>
              </ul>
            </div>
            <div className="feature__visual reveal reveal--d1">
              <div className="panel-preview panel-preview--charts" aria-hidden="true">
                <div className="panel-preview__card">
                  <LineChartPreview />
                </div>
                <div className="panel-preview__card">
                  <DonutPreview />
                </div>
                <div className="panel-preview__card panel-preview__card--tx">
                  <p className="panel-preview__title">Recent transactions</p>
                  <ul className="tx-list">
                    <li className="tx-list__item">
                      <span className="tx-list__icon tx-list__icon--in">
                        <TrendingUp size={14} />
                      </span>
                      <span className="tx-list__name">
                        Salary
                        <Repeat size={11} className="tx-list__recurring" />
                      </span>
                      <span className="tx-list__amount tx-list__amount--in">
                        +$5,200
                      </span>
                    </li>
                    <li className="tx-list__item">
                      <span className="tx-list__icon">
                        <TrendingDown size={14} />
                      </span>
                      <span className="tx-list__name">
                        Supermarket
                        <Star size={11} className="tx-list__star" />
                      </span>
                      <span className="tx-list__amount">-$86.40</span>
                    </li>
                    <li className="tx-list__item">
                      <span className="tx-list__icon tx-list__icon--in">
                        <TrendingUp size={14} />
                      </span>
                      <span className="tx-list__name">Freelance</span>
                      <span className="tx-list__amount tx-list__amount--in">
                        +$850
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature: Budgets & Goals */}
        <section className="feature feature--alt">
          <div className="feature__inner feature__inner--reverse">
            <div className="feature__copy reveal">
              <p className="feature__eyebrow">Budgets and goals</p>
              <h2 className="feature__title">
                Set the limit before the month sets it for you.
              </h2>
              <p className="feature__text">
                Give the whole month a budget, then cap the categories that
                tend to run away. Flowee shows what is left and flags anything
                that goes over.
              </p>
              <ul className="feature__points">
                <li>Category budgets for one month or every month</li>
                <li>Savings goals with a target amount and a deadline</li>
                <li>Add to a goal whenever you put money aside</li>
              </ul>
            </div>
            <div className="feature__visual reveal reveal--d1">
              <BudgetsPreview />
            </div>
          </div>
        </section>

        {/* Feature: Flowee Insights */}
        <section className="insights-band" id="insights">
          <div className="insights-band__inner">
            <div className="insights-band__head reveal">
              <p className="insights-band__eyebrow">
                <SparkMark /> Flowee Insights
              </p>
              <h2 className="insights-band__title">
                Three honest reads of your month. No pep talk.
              </h2>
              <p className="insights-band__text">
                Flowee Insights looks at your real transactions and answers in
                one of three ways. When the year is done, ask for an Annual
                Analysis of income, spending trends and top categories across
                every month.
              </p>
            </div>

            <div className="insights-band__grid">
              {INSIGHTS.map(({ type, icon: Icon, modifier, text }, i) => (
                <article
                  key={type}
                  className={`insight-card insight-card--${modifier} reveal reveal--d${i + 1}`}
                >
                  <div className="insight-card__head">
                    <span className="insight-card__icon">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <h3 className="insight-card__type">{type}</h3>
                  </div>
                  <p className="insight-card__text">{text}</p>
                  <p className="insight-card__foot">Example output</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Capabilities bento */}
        <section className="capabilities" aria-labelledby="capabilities-title">
          <div className="capabilities__inner">
            <div className="capabilities__head reveal">
              <h2 className="capabilities__title" id="capabilities-title">
                The details that make it stick.
              </h2>
              <p className="capabilities__text">
                Small things you will use every week.
              </p>
            </div>

            <div className="bento">
              <article className="bento__tile bento__tile--recurring reveal">
                <span className="bento__icon">
                  <Repeat size={18} aria-hidden="true" />
                </span>
                <h3 className="bento__title">Recurring transactions</h3>
                <p className="bento__text">
                  Mark rent, salary or a subscription as monthly and choose the
                  day. Flowee adds it every month on its own.
                </p>
                <div className="bento__calendar" aria-hidden="true">
                  {Array.from({ length: 14 }, (_, i) => (
                    <span
                      key={i}
                      className={`bento__day${i === 4 ? " bento__day--on" : ""}`}
                    >
                      {i + 1}
                    </span>
                  ))}
                </div>
              </article>

              <article className="bento__tile bento__tile--currency reveal reveal--d1">
                <span className="bento__icon">
                  <Globe size={18} aria-hidden="true" />
                </span>
                <h3 className="bento__title">Your currency</h3>
                <p className="bento__text">
                  Choose US Dollar, Euro or Brazilian Real in your profile.
                </p>
                <div className="bento__currencies" aria-hidden="true">
                  <span>$</span>
                  <span>€</span>
                  <span>R$</span>
                </div>
              </article>

              <article className="bento__tile reveal reveal--d2">
                <span className="bento__icon">
                  <Tags size={18} aria-hidden="true" />
                </span>
                <h3 className="bento__title">Your categories</h3>
                <p className="bento__text">
                  Start with sensible defaults, then add your own for income
                  and expenses.
                </p>
              </article>

              <article className="bento__tile reveal">
                <span className="bento__icon">
                  <Star size={18} aria-hidden="true" />
                </span>
                <h3 className="bento__title">Marked transactions</h3>
                <p className="bento__text">
                  Star the ones you need to revisit and find them all on one
                  page.
                </p>
              </article>

              <article className="bento__tile bento__tile--half reveal reveal--d1">
                <span className="bento__icon">
                  <CalendarRange size={18} aria-hidden="true" />
                </span>
                <h3 className="bento__title">Year in review</h3>
                <p className="bento__text">
                  An Annual Analysis that reads all twelve months together.
                </p>
              </article>

              <article className="bento__tile bento__tile--half reveal reveal--d2">
                <span className="bento__icon">
                  <EyeOff size={18} aria-hidden="true" />
                </span>
                <h3 className="bento__title">Private by default</h3>
                <p className="bento__text">
                  Hide your balance on screen. Your data is only ever tied to
                  your own account.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="steps" id="how-it-works">
          <div className="steps__inner">
            <div className="steps__head reveal">
              <h2 className="steps__title">Up and running in three steps</h2>
            </div>
            <ol className="steps__list">
              {STEPS.map((s, i) => (
                <li key={s.number} className={`step reveal reveal--d${i + 1}`}>
                  <span className="step__number">{s.number}</span>
                  <h3 className="step__title">{s.title}</h3>
                  <p className="step__desc">{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Final CTA */}
        <section className="final-cta">
          <div className="final-cta__inner reveal">
            <h2 className="final-cta__title">
              Your next month starts with one entry.
            </h2>
            <p className="final-cta__text">
              Create an account, log today&apos;s spending and watch the
              picture fill in.
            </p>
            <div className="final-cta__actions">
              <Link to="/register" className="lbtn lbtn--ink lbtn--lg">
                Create free account
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link to="/login" className="lbtn lbtn--outline-ink lbtn--lg">
                I already have an account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <Link to="/" className="brand" aria-label="Flowee home">
              <span className="brand__mark" aria-hidden="true">
                ᨒ
              </span>
              <span className="brand__name">Flowee</span>
            </Link>
            <p className="footer__tagline">
              Personal finance that tells you the truth about your month.
            </p>
          </div>

          <div className="footer__cols">
            <div className="footer__col">
              <h3 className="footer__col-title">Product</h3>
              <ul className="footer__links">
                <li>
                  <a className="footer__link" href="#features">
                    Features
                  </a>
                </li>
                <li>
                  <a className="footer__link" href="#insights">
                    Flowee Insights
                  </a>
                </li>
                <li>
                  <a className="footer__link" href="#how-it-works">
                    How it works
                  </a>
                </li>
              </ul>
            </div>
            <div className="footer__col">
              <h3 className="footer__col-title">Account</h3>
              <ul className="footer__links">
                <li>
                  <Link className="footer__link" to="/register">
                    Create account
                  </Link>
                </li>
                <li>
                  <Link className="footer__link" to="/login">
                    Sign in
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copy">
            © {year} Flowee. Built by Artur Wagner.
          </p>
        </div>
      </footer>
    </div>
  );
}

function SparkMark() {
  return (
    <span className="insights-band__mark" aria-hidden="true">
      ᨒ
    </span>
  );
}
