import { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../api';
import './Blog.css';

const MAX_WORDS = 1000;

function toYYYYMMDD(d) {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  return date.toISOString().slice(0, 10);
}

function wordCount(str) {
  if (!str || typeof str !== 'string') return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

function formatDDMMYYYY(dateStrOrDate) {
  const d = dateStrOrDate instanceof Date ? dateStrOrDate : new Date(dateStrOrDate);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function Blog() {
  const [date, setDate] = useState(() => new Date());
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);

  const fetchBlogs = () => {
    api.get('/blogs').then((res) => setBlogs(res.data)).catch(() => setBlogs([])).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const words = wordCount(content);
  const overLimit = words > MAX_WORDS;

  const startEdit = (blog) => {
    setEditingId(blog._id);
    setDate(new Date(blog.date));
    setContent(blog.content || '');
    setMessage({ type: '', text: '' });
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDate(new Date());
    setContent('');
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    if (overLimit) {
      setMessage({ type: 'error', text: `Maximum ${MAX_WORDS} words allowed. You have ${words}.` });
      return;
    }
    if (!content.trim()) {
      setMessage({ type: 'error', text: 'Content is required.' });
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/blogs/${editingId}`, { content: content.trim() });
        setMessage({ type: 'success', text: 'Blog updated.' });
      } else {
        await api.post('/blogs', { date: toYYYYMMDD(date), content: content.trim() });
        setMessage({ type: 'success', text: 'Blog saved for ' + formatDDMMYYYY(date) + '.' });
      }
      setEditingId(null);
      setDate(new Date());
      setContent('');
      fetchBlogs();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || (editingId ? 'Failed to update.' : 'Failed to save.'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="blog-page">
      <div className="blog-header">
        <h1>Blog</h1>
        <p>Write a daily entry (max {MAX_WORDS} words). You can edit previous entries below.</p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="blog-form">
        {message.text && (
          <div className={`blog-message blog-message--${message.type}`}>{message.text}</div>
        )}
        {editingId ? (
          <p className="blog-editing-hint">Editing entry — <button type="button" className="blog-cancel-btn" onClick={cancelEdit}>Cancel</button></p>
        ) : null}
        <label>
          Date
          <DatePicker
            selected={date}
            onChange={(d) => setDate(d)}
            dateFormat="dd/MM/yyyy"
            maxDate={new Date()}
            className="blog-date-input"
            required
            disabled={!!editingId}
            aria-label="Choose date"
          />
        </label>
        <label>
          Entry
          <textarea
            className="blog-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your blog entry..."
            rows={8}
            maxLength={undefined}
          />
          <span className={`blog-wordcount ${overLimit ? 'blog-wordcount--over' : ''}`}>
            {words} / {MAX_WORDS} words
          </span>
        </label>
        <button type="submit" className="btn btn-submit" disabled={submitting || overLimit}>
          {submitting ? (editingId ? 'Updating...' : 'Saving...') : (editingId ? 'Update entry' : 'Save entry')}
        </button>
      </form>

      <section className="blog-list-section">
        <h2 className="blog-list-heading">Previous entries</h2>
        {loading ? (
          <p className="blog-loading">Loading...</p>
        ) : blogs.length === 0 ? (
          <p className="blog-empty">No entries yet. Write one above.</p>
        ) : (
          <ul className="blog-list">
            {blogs.map((b) => (
              <li key={b._id} className="blog-card">
                <div className="blog-card-header">
                  <time className="blog-card-date" dateTime={b.date}>{formatDDMMYYYY(b.date)}</time>
                  <button type="button" className="blog-edit-btn" onClick={() => startEdit(b)}>
                    Edit
                  </button>
                </div>
                <div className="blog-card-content">{b.content}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
