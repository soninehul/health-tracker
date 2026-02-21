import { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import api from '../api';
import './History.css';

function formatDDMMYYYY(dateStrOrDate) {
  const d = dateStrOrDate instanceof Date ? dateStrOrDate : new Date(dateStrOrDate);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function History() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/metrics')
      .then((res) => setMetrics(res.data))
      .catch(() => setError('Failed to load history.'))
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    const sorted = [...metrics].sort((a, b) => new Date(a.date) - new Date(b.date));
    return sorted.map((m) => ({
      ...m,
      dateLabel: formatDDMMYYYY(m.date),
    }));
  }, [metrics]);

  const averages = useMemo(() => {
    const withWeight = metrics.filter((m) => m.weight != null).map((m) => m.weight);
    const withSteps = metrics.filter((m) => m.steps != null).map((m) => m.steps);
    const withCalories = metrics.filter((m) => m.calories != null).map((m) => m.calories);
    const withSleep = metrics.filter((m) => m.sleepHours != null).map((m) => m.sleepHours);
    const sum = (arr) => arr.reduce((a, b) => a + b, 0);
    return {
      weight: withWeight.length ? sum(withWeight) / withWeight.length : null,
      steps: withSteps.length ? Math.round(sum(withSteps) / withSteps.length) : null,
      calories: withCalories.length ? Math.round(sum(withCalories) / withCalories.length) : null,
      sleepHours: withSleep.length ? sum(withSleep) / withSleep.length : null,
    };
  }, [metrics]);

  const ChartCard = ({ title, dataKey, unit, average, color }) => {
    const hasData = chartData.some((d) => d[dataKey] != null);
    if (!hasData) return null;
    return (
      <div className="history-chart-card">
        <h3 className="history-chart-title">{title}</h3>
        <div className="history-chart-wrap">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="dateLabel"
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                stroke="var(--border)"
              />
              <YAxis
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                stroke="var(--border)"
                width={40}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                }}
                labelStyle={{ color: 'var(--text)' }}
                formatter={(value) => [value != null ? (dataKey === 'sleepHours' ? value.toFixed(1) : value) : '—', title]}
                labelFormatter={(label) => label}
              />
              {average != null && (
                <ReferenceLine
                  y={average}
                  stroke="var(--accent)"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{ value: 'Avg', fill: 'var(--text-muted)', fontSize: 10 }}
                />
              )}
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, r: 3 }}
                connectNulls
                name={title}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {average != null && (
          <p className="history-chart-avg">
            Average: {dataKey === 'sleepHours' ? average.toFixed(1) : average} {unit}
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="history-page">
        <div className="history-header">
          <h1>History</h1>
          <p>Your past metrics</p>
        </div>
        <div className="history-loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-page">
        <div className="history-header">
          <h1>History</h1>
        </div>
        <div className="history-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-header">
        <h1>History</h1>
        <p>Your past metrics and trends. Add more from the Metrics page.</p>
      </div>

      {metrics.length === 0 ? (
        <div className="history-empty">
          <span className="history-empty-icon">📋</span>
          <p>No entries yet.</p>
          <p className="history-empty-hint">Add weight, steps, calories or sleep on the Metrics page.</p>
        </div>
      ) : (
        <>
          <section className="history-charts">
            <h2 className="history-charts-heading">Trends</h2>
            <div className="history-charts-grid">
              <ChartCard
                title="Weight"
                dataKey="weight"
                unit="kg"
                average={averages.weight}
                color="var(--accent)"
              />
              <ChartCard
                title="Steps"
                dataKey="steps"
                unit=""
                average={averages.steps}
                color="#a78bfa"
              />
              <ChartCard
                title="Calories"
                dataKey="calories"
                unit="cal"
                average={averages.calories}
                color="#f59e0b"
              />
              <ChartCard
                title="Sleep"
                dataKey="sleepHours"
                unit="h"
                average={averages.sleepHours}
                color="#22d3ee"
              />
            </div>
          </section>

          <section className="history-list-section">
            <h2 className="history-list-heading">Entries</h2>
            <ul className="history-list">
              {metrics.map((m) => (
                <li key={m._id} className="history-card">
                  <div className="history-card-date">{formatDDMMYYYY(m.date)}</div>
                  <div className="history-card-fields">
                    {m.weight != null && (
                      <span className="history-badge" title="Weight">⚖️ {m.weight} kg</span>
                    )}
                    {m.steps != null && (
                      <span className="history-badge" title="Steps">👟 {Number(m.steps).toLocaleString()} steps</span>
                    )}
                    {m.calories != null && (
                      <span className="history-badge" title="Calories">🔥 {m.calories} cal</span>
                    )}
                    {m.sleepHours != null && (
                      <span className="history-badge" title="Sleep">😴 {m.sleepHours} h</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
