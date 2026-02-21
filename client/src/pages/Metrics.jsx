import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../api';
import './Metrics.css';

function toYYYYMMDD(d) {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  return date.toISOString().slice(0, 10);
}

function formatDDMMYYYY(dateStrOrDate) {
  const d = dateStrOrDate instanceof Date ? dateStrOrDate : new Date(dateStrOrDate);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function Metrics() {
  const [date, setDate] = useState(() => new Date());
  const [weight, setWeight] = useState('');
  const [steps, setSteps] = useState('');
  const [calories, setCalories] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    const dateStr = toYYYYMMDD(date);
    const payload = {
      date: dateStr,
      weight: weight === '' ? undefined : weight,
      steps: steps === '' ? undefined : steps,
      calories: calories === '' ? undefined : calories,
      sleepHours: sleepHours === '' ? undefined : sleepHours,
    };
    const hasAny = [payload.weight, payload.steps, payload.calories, payload.sleepHours].some(
      (v) => v != null && v !== ''
    );
    if (!hasAny) {
      setMessage({ type: 'error', text: 'Add at least one metric.' });
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/metrics', payload);
      setMessage({ type: 'success', text: 'Metrics saved for ' + formatDDMMYYYY(date) + '.' });
      setWeight('');
      setSteps('');
      setCalories('');
      setSleepHours('');
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save. Try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="metrics-page">
      <div className="metrics-header">
        <h1>Add metrics</h1>
        <p>Log weight, steps, calories, and sleep. All fields are optional. Pick a date to add past data.</p>
      </div>
      <form onSubmit={handleSubmit} className="metrics-form">
        {message.text && (
          <div className={`metrics-message metrics-message--${message.type}`}>{message.text}</div>
        )}
        <label>
          Date
          <DatePicker
            selected={date}
            onChange={(d) => setDate(d)}
            dateFormat="dd/MM/yyyy"
            maxDate={new Date()}
            className="metrics-date-input"
            required
            aria-label="Choose date"
          />
        </label>
        <label>
          Weight (kg)
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="e.g. 70"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </label>
        <label>
          Steps
          <input
            type="number"
            min="0"
            placeholder="e.g. 8000"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
          />
        </label>
        <label>
          Calories
          <input
            type="number"
            min="0"
            placeholder="e.g. 2000"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
        </label>
        <label>
          Sleep (hours)
          <input
            type="number"
            step="0.25"
            min="0"
            max="24"
            placeholder="e.g. 7.5"
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value)}
          />
        </label>
        <button type="submit" className="btn btn-submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save metrics'}
        </button>
      </form>
    </div>
  );
}
