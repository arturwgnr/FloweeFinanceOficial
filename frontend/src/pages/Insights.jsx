import React, { useEffect, useState, useCallback } from "react";
import {
  Lightbulb,
  EyeOff,
  Snowflake,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
} from "lucide-react";
import api from "../services/api";
import "../styles/pages/Insights.css";

const TYPE_LABELS = {
  SUGGESTION: "Suggestion",
  BLIND_SPOT: "Blind Spot",
  COLD_ANALYSIS: "Cold Analysis",
  ANNUAL: "Annual Analysis",
};

const INSIGHT_CARDS = [
  {
    type: "SUGGESTION",
    title: "Suggestion",
    description:
      "One concrete, actionable step you can take based on real patterns in your data.",
    icon: <Lightbulb size={22} />,
  },
  {
    type: "BLIND_SPOT",
    title: "Blind Spot",
    description:
      "Something you're likely not noticing — a hidden pattern or overlooked category.",
    icon: <EyeOff size={22} />,
  },
  {
    type: "COLD_ANALYSIS",
    title: "Cold Analysis",
    description:
      "A direct, unfiltered read of the numbers. No encouragement, just facts.",
    icon: <Snowflake size={22} />,
  },
];

function formatTimeRemaining(resetAt) {
  if (!resetAt) return "";
  const diff = new Date(resetAt).getTime() - Date.now();
  if (diff <= 0) return "a moment";
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function formatDateTime(value) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Insights() {
  const [activeTab, setActiveTab] = useState("flowee");

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedAnnualYear, setSelectedAnnualYear] = useState(currentYear);

  const isCurrentMonth =
    selectedMonth === currentMonth && selectedYear === currentYear;

  const selectedMonthLabel = new Date(
    selectedYear,
    selectedMonth - 1,
    1,
  ).toLocaleString("default", { month: "long", year: "numeric" });

  const [tokens, setTokens] = useState({
    tokensUsed: 0,
    tokensRemaining: 3,
    resetAt: null,
  });
  const [tokensLoading, setTokensLoading] = useState(true);
  const [, setTick] = useState(0);

  const [generating, setGenerating] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [annualResult, setAnnualResult] = useState(null);
  const [annualError, setAnnualError] = useState("");
  const [annualHistory, setAnnualHistory] = useState([]);
  const [annualHistoryLoading, setAnnualHistoryLoading] = useState(false);
  const [annualHistoryOpen, setAnnualHistoryOpen] = useState(false);

  const fetchTokens = useCallback(async () => {
    try {
      const res = await api.get("/insights/tokens");
      setTokens(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setTokensLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get(
        `/insights/history?month=${selectedMonth}&year=${selectedYear}`,
      );
      setHistory(res.data.history || []);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  const fetchAnnualHistory = useCallback(async () => {
    setAnnualHistoryLoading(true);
    try {
      const res = await api.get(`/insights/history?year=${selectedAnnualYear}`);
      setAnnualHistory((res.data.history || []).filter((h) => h.type === "ANNUAL"));
    } catch (err) {
      console.error(err);
    } finally {
      setAnnualHistoryLoading(false);
    }
  }, [selectedAnnualYear]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setResult(null);
    setError("");
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    setAnnualResult(null);
    setAnnualError("");
    fetchAnnualHistory();
  }, [fetchAnnualHistory]);

  function goToPreviousMonth() {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (isCurrentMonth) return;
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  }

  async function generateInsight(type) {
    setGenerating(type);
    setError("");
    try {
      const res = await api.post("/insights/generate", {
        type,
        month: selectedMonth,
        year: selectedYear,
      });
      setResult({
        type,
        content: res.data.insight,
        createdAt: res.data.createdAt || new Date().toISOString(),
      });
      setTokens((t) => ({
        ...t,
        tokensUsed: t.tokensUsed + 1,
        tokensRemaining: res.data.tokensRemaining,
      }));
      fetchHistory();
    } catch (err) {
      if (err.response?.status === 429) {
        setTokens((t) => ({
          ...t,
          tokensRemaining: 0,
          resetAt: err.response.data.resetAt || t.resetAt,
        }));
        setError("Daily analysis limit reached.");
      } else {
        setError(err.response?.data?.error || "Failed to generate insight.");
      }
    } finally {
      setGenerating(null);
    }
  }

  async function generateAnnual() {
    setGenerating("ANNUAL");
    setAnnualError("");
    try {
      const res = await api.post("/insights/annual", { year: selectedAnnualYear });
      setAnnualResult({
        content: res.data.insight,
        createdAt: res.data.createdAt || new Date().toISOString(),
      });
      setTokens((t) => ({
        ...t,
        tokensUsed: t.tokensUsed + 1,
        tokensRemaining: res.data.tokensRemaining,
      }));
      fetchAnnualHistory();
    } catch (err) {
      if (err.response?.status === 429) {
        setTokens((t) => ({
          ...t,
          tokensRemaining: 0,
          resetAt: err.response.data.resetAt || t.resetAt,
        }));
        setAnnualError("Daily analysis limit reached.");
      } else {
        setAnnualError(
          err.response?.data?.error || "Failed to generate annual analysis.",
        );
      }
    } finally {
      setGenerating(null);
    }
  }

  const tokensExhausted = !tokensLoading && tokens.tokensRemaining <= 0;

  return (
    <div className="insights">
      <div className="insights__header">
        <h1 className="insights__greeting">Flowee Insights</h1>
        <p className="insights__subtitle">
          AI-powered analysis of your financial data, grounded in your real numbers.
        </p>
      </div>

      <div className="insights__token-banner">
        {tokensLoading ? (
          <span>Checking available analyses…</span>
        ) : tokensExhausted ? (
          <span className="insights__token-banner__exhausted">
            <Clock size={15} /> Daily limit reached — resets in{" "}
            {formatTimeRemaining(tokens.resetAt)}
          </span>
        ) : (
          <span>
            <strong>{tokens.tokensRemaining}</strong> of 3 analyses available today
          </span>
        )}
      </div>

      <div className="insights__tabs">
        <button
          className={`insights__tab ${activeTab === "flowee" ? "insights__tab--active" : ""}`}
          onClick={() => setActiveTab("flowee")}
        >
          Flowee Insights
        </button>
        <button
          className={`insights__tab ${activeTab === "annual" ? "insights__tab--active" : ""}`}
          onClick={() => setActiveTab("annual")}
        >
          Annual Analysis
        </button>
      </div>

      {activeTab === "flowee" ? (
        <>
          <div className="insights__month-nav">
            <button
              onClick={goToPreviousMonth}
              className="insights__month-nav__btn"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="insights__month-nav__label">{selectedMonthLabel}</span>
            <button
              onClick={goToNextMonth}
              disabled={isCurrentMonth}
              className="insights__month-nav__btn"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="insights__cards">
            {INSIGHT_CARDS.map((c) => (
              <button
                key={c.type}
                className="insights__card"
                disabled={generating !== null || tokensExhausted}
                onClick={() => generateInsight(c.type)}
              >
                <div className="insights__card-icon">{c.icon}</div>
                <h3 className="insights__card-title">{c.title}</h3>
                <p className="insights__card-desc">{c.description}</p>
                {generating === c.type && (
                  <div className="insights__card-loading">
                    <span className="spinner spinner--sm" />
                    Analyzing…
                  </div>
                )}
              </button>
            ))}
          </div>

          {error && <div className="insights__error">{error}</div>}

          {result && (
            <div className="insights__result card">
              <div className="insights__result-header">
                <span className="insights__result-badge">
                  {TYPE_LABELS[result.type]}
                </span>
                <span className="insights__result-date">
                  {formatDateTime(result.createdAt)}
                </span>
              </div>
              <p className="insights__result-text">{result.content}</p>
            </div>
          )}

          <div className="insights__history">
            <button
              className="insights__history-toggle"
              onClick={() => setHistoryOpen((o) => !o)}
            >
              <ChevronDown
                size={16}
                className={`insights__history-toggle__chevron${historyOpen ? " insights__history-toggle__chevron--open" : ""}`}
              />
              History{history.length ? ` (${history.length})` : ""}
            </button>
            {historyOpen && (
              <div className="insights__history-body">
                {historyLoading ? (
                  <div className="insights__history-loading">
                    <span className="spinner spinner--sm" />
                  </div>
                ) : history.length === 0 ? (
                  <p className="insights__history-empty">
                    No previous insights for {selectedMonthLabel}.
                  </p>
                ) : (
                  <ul className="insights__history-list">
                    {history.map((h) => (
                      <li key={h.id} className="insights__history-item">
                        <div className="insights__history-item-header">
                          <span className="insights__history-item-badge">
                            {TYPE_LABELS[h.type]}
                          </span>
                          <span className="insights__history-item-date">
                            {formatDateTime(h.createdAt)}
                          </span>
                        </div>
                        <p className="insights__history-item-text">{h.content}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="insights__year-nav">
            <button
              onClick={() => setSelectedAnnualYear((y) => y - 1)}
              className="insights__month-nav__btn"
              aria-label="Previous year"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="insights__month-nav__label">{selectedAnnualYear}</span>
            <button
              onClick={() => setSelectedAnnualYear((y) => y + 1)}
              disabled={selectedAnnualYear >= currentYear}
              className="insights__month-nav__btn"
              aria-label="Next year"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="insights__annual-generate card">
            <div>
              <h3 className="insights__annual-generate__title">
                Full-year analysis for {selectedAnnualYear}
              </h3>
              <p className="insights__annual-generate__desc">
                Analyses income, spending trends and top categories across every month
                with data this year. Costs 1 token.
              </p>
            </div>
            <button
              className="btn-primary insights__annual-generate__btn"
              disabled={generating !== null || tokensExhausted}
              onClick={generateAnnual}
            >
              {generating === "ANNUAL" ? (
                <>
                  <span className="spinner spinner--sm" /> Analyzing…
                </>
              ) : (
                "Generate Annual Analysis"
              )}
            </button>
          </div>

          {annualError && <div className="insights__error">{annualError}</div>}

          {annualResult && (
            <div className="insights__result card">
              <div className="insights__result-header">
                <span className="insights__result-badge">Annual Analysis</span>
                <span className="insights__result-date">
                  {formatDateTime(annualResult.createdAt)}
                </span>
              </div>
              <p className="insights__result-text">{annualResult.content}</p>
            </div>
          )}

          <div className="insights__history">
            <button
              className="insights__history-toggle"
              onClick={() => setAnnualHistoryOpen((o) => !o)}
            >
              <ChevronDown
                size={16}
                className={`insights__history-toggle__chevron${annualHistoryOpen ? " insights__history-toggle__chevron--open" : ""}`}
              />
              History{annualHistory.length ? ` (${annualHistory.length})` : ""}
            </button>
            {annualHistoryOpen && (
              <div className="insights__history-body">
                {annualHistoryLoading ? (
                  <div className="insights__history-loading">
                    <span className="spinner spinner--sm" />
                  </div>
                ) : annualHistory.length === 0 ? (
                  <p className="insights__history-empty">
                    No previous annual analyses for {selectedAnnualYear}.
                  </p>
                ) : (
                  <ul className="insights__history-list">
                    {annualHistory.map((h) => (
                      <li key={h.id} className="insights__history-item">
                        <div className="insights__history-item-header">
                          <span className="insights__history-item-badge">
                            Annual Analysis
                          </span>
                          <span className="insights__history-item-date">
                            {formatDateTime(h.createdAt)}
                          </span>
                        </div>
                        <p className="insights__history-item-text">{h.content}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
