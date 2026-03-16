import React, { useState } from 'react';
import api from '../services/api';
import '../styles/components/InsightsBlock.css';

export default function InsightsBlock() {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/insights');
      setInsight(res.data.insight);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load insights. Check your Gemini API key.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="insights__header">
        <div className="insights__title-wrap">
          <div className="insights__icon">✨</div>
          <h3 className="insights__title">AI Insights</h3>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="btn-secondary text-sm flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="insights__spinner" />
              Analyzing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Insights
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="insights__error">{error}</div>
      )}

      {!insight && !error && !loading && (
        <p className="insights__placeholder">
          Click "Refresh Insights" to get personalized financial analysis powered by Google Gemini.
        </p>
      )}

      {insight && (
        <div className="insights__result">
          <p className="insights__result-text">{insight}</p>
        </div>
      )}
    </div>
  );
}
