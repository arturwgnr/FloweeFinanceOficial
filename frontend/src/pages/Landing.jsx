import React from "react";
import { Link } from "react-router-dom";
import "../styles/pages/Landing.css";

const features = [
  {
    icon: "📊",
    title: "Smart Dashboard",
    desc: "Get a clear picture of your finances with beautiful charts showing income vs expenses over time.",
  },
  {
    icon: "💳",
    title: "Transaction Tracking",
    desc: "Log every income and expense, filter by category, and always know where your money goes.",
  },
  {
    icon: "🎯",
    title: "Budget & Goals",
    desc: "Set monthly budgets per category and track your savings goals with visual progress bars.",
  },
  {
    icon: "🤖",
    title: "AI Insights",
    desc: "Get personalized financial advice powered by Google Gemini based on your spending patterns.",
  },
];

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
                Premium personal finance track spending, plan budgets, hit
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
                    <a className="landing__footer-link" href="#cta">
                      Try Flowee
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
