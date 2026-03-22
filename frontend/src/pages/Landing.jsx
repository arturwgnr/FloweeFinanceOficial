import React from "react";
import { Link } from "react-router-dom";
import "../styles/pages/Landing.css";

const features = [
  {
    icon: (
      <svg
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    ),
    title: "Smart Dashboard",
    desc: "Get a clear picture of your finances with beautiful charts showing income vs expenses over time.",
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
        />
      </svg>
    ),
    title: "Transaction Tracking",
    desc: "Log every income and expense, filter by category, and always know where your money goes.",
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z"
        />
      </svg>
    ),
    title: "Budget & Goals",
    desc: "Set monthly budgets per category and track your savings goals with visual progress bars.",
  },
  {
    icon: (
      <svg
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
        />
      </svg>
    ),
    title: "AI Insights",
    desc: "Get personalized financial advice powered by Google Gemini based on your spending patterns.",
  },
];

const steps = [
  {
    number: "01",
    title: "Track",
    desc: "Log every income and expense in seconds. Categorize transactions and set up recurring entries.",
  },
  {
    number: "02",
    title: "Analyze",
    desc: "Visualize your spending with charts and get AI-powered insights about your financial habits.",
  },
  {
    number: "03",
    title: "Improve",
    desc: "Hit your monthly budgets, reach your savings goals, and build the financial future you want.",
  },
];

const avatarColors = ["#10b77f", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function Landing() {
  return (
    <div className="landing">
      {/* Navigation */}
      <nav className="landing__nav">
        <div className="landing__nav-logo">
          <div className="landing__nav-logo-icon">
            <h1 className="oficial-logo">ᨒ</h1>
          </div>
          <span className="landing__nav-logo-text">Flowee</span>
        </div>
        <div className="landing__nav-links">
          <Link to="/login" className="landing__nav-login">
            Login
          </Link>
          <Link to="/register" className="btn-primary text-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing__hero">
        <div className="landing__badge">
          <span>ᨒ</span>
          <span className="span-ai">AI-powered personal finance</span>
        </div>
        <h1 className="landing__h1">
          Take control of your
          <span className="landing__h1-accent">financial flow</span>
        </h1>
        <p className="landing__lead">
          Track income and expenses, set budgets, achieve your savings goals,
          and get personalized AI insights! All in one place.
        </p>
        <div className="landing__cta-row">
          <Link to="/register" className="btn-primary px-8 py-3 text-base">
            Start for free
          </Link>
          <Link to="/login" className="btn-secondary px-8 py-3 text-base">
            Sign in
          </Link>
        </div>

        {/* Hero visual */}
        <div className="landing__hero-visual">
          <div className="landing__hero-window">
            <div className="landing__hero-inner">
              <div className="landing__hero-stats">
                {[
                  { label: "Balance", value: "$4,280", color: "text-primary" },
                  { label: "Income", value: "$5,200", color: "text-green-600" },
                  { label: "Expenses", value: "$2,920", color: "text-red-500" },
                ].map((stat) => (
                  <div key={stat.label} className="landing__hero-stat">
                    <p className="landing__hero-stat-label">{stat.label}</p>
                    <p className={`text-xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
              <h1 className="data-title">ᨒ Data Analysis</h1>
              <div className="landing__hero-chart">
                {[40, 65, 45, 80, 55, 90].map((h, i) => (
                  <div key={i} className="landing__hero-bar">
                    <div
                      className="bg-primary-light rounded-sm"
                      style={{ height: `${h * 0.5}px` }}
                    />
                    <div
                      className="bg-primary rounded-sm"
                      style={{ height: `${h * 0.3}px` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing__features" id="features">
        <div className="landing__features-inner">
          <h2 className="landing__features-title">
            Everything you need to manage your money
          </h2>
          <p className="landing__features-sub">
            Simple, powerful tools to help you understand and improve your
            financial health.
          </p>
          <div className="landing__features-grid">
            {features.map((f) => (
              <div key={f.title} className="landing__feature-card">
                <div className="landing__feature-icon">{f.icon}</div>
                <h3 className="landing__feature-title">{f.title}</h3>
                <p className="landing__feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="landing__how-it-works" id="how-it-works">
        <div className="landing__how-it-works-inner">
          <h2 className="landing__how-it-works-title">How it works</h2>
          <p className="landing__how-it-works-sub">
            Three simple steps to financial clarity
          </p>
          <div className="landing__steps">
            {steps.map((step, i) => (
              <div key={step.number} className="landing__step">
                <div className="landing__step-number">{step.number}</div>
                <h3 className="landing__step-title">{step.title}</h3>
                <p className="landing__step-desc">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="landing__step-connector" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="landing__social-proof">
        <div className="landing__social-proof-inner">
          <div className="landing__avatars">
            {avatarColors.map((color, i) => (
              <div
                key={i}
                className="landing__avatar"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <p className="landing__social-proof-text">
            Trusted by <strong>10,000+</strong> users worldwide
          </p>
          <div className="landing__social-proof-rating">
            <span className="landing__stars">★★★★★</span>
            <span className="landing__rating-score">4.9/5</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing__cta" id="cta">
        <div className="landing__cta-inner">
          <h2 className="landing__cta-title">Ready to flow?</h2>
          <p className="landing__cta-sub">
            Join thousands of people who use Flowee to take control of their
            finances.
          </p>
          <Link to="/register" className="btn-primary px-10 py-3 text-base">
            Create your free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing__footer">
        <div className="landing__footer-inner">
          <div className="landing__footer-top">
            <div className="landing__footer-brand">
              <div className="landing__footer-logo">
                <span className="landing__footer-logo-mark" aria-hidden="true">
                  ᨒ
                </span>
                <span className="landing__footer-logo-text">Flowee</span>
              </div>
              <p className="landing__footer-tagline">
                Premium personal finance — track spending, plan budgets, hit
                goals, and get AI insights.
              </p>
            </div>

            <div className="landing__footer-cols" aria-label="Footer links">
              <div className="landing__footer-col">
                <h3 className="landing__footer-col-title">Product</h3>
                <ul className="landing__footer-links">
                  <li>
                    <Link className="landing__footer-link" to="/register">
                      Get started
                    </Link>
                  </li>
                  <li>
                    <Link className="landing__footer-link" to="/login">
                      Sign in
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="landing__footer-col">
                <h3 className="landing__footer-col-title">Company</h3>
                <ul className="landing__footer-links">
                  <li>
                    <a className="landing__footer-link" href="#features">
                      Features
                    </a>
                  </li>
                  <li>
                    <a className="landing__footer-link" href="#how-it-works">
                      How it works
                    </a>
                  </li>
                </ul>
              </div>

              <div className="landing__footer-col">
                <h3 className="landing__footer-col-title">Resources</h3>
                <ul className="landing__footer-links">
                  <li>
                    <a
                      className="landing__footer-link"
                      href="mailto:support@flowee.app"
                    >
                      Support
                    </a>
                  </li>
                  <li>
                    <a
                      className="landing__footer-link"
                      href="https://www.linkedin.com/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      LinkedIn
                    </a>
                  </li>
                </ul>
              </div>

              <div className="landing__footer-col">
                <h3 className="landing__footer-col-title">Legal</h3>
                <ul className="landing__footer-links">
                  <li>
                    <a className="landing__footer-link" href="#privacy">
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a className="landing__footer-link" href="#terms">
                      Terms
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="landing__footer-bottom">
            <p className="landing__footer-copy">
              © {new Date().getFullYear()} Flowee. Built by Artur Wagner.
            </p>
            <div className="landing__footer-bottom-links">
              <a className="landing__footer-link" href="#privacy">
                Privacy
              </a>
              <span className="landing__footer-sep" aria-hidden="true">
                ·
              </span>
              <a className="landing__footer-link" href="#terms">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
