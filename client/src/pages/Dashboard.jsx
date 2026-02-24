import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './Dashboard.css';

export default function Dashboard() {
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="welcome">Hello, {user?.name}. Track your health metrics here.</p>
      </div>
      <div className="dashboard-grid">
        <Link to="/metrics" className="card card-placeholder card-link">
          <span className="card-icon">📊</span>
          <h3>Metrics</h3>
          <p>Log your daily metrics: weight, steps, calories & sleep.</p>
        </Link>
        <Link to="/history" className="card card-placeholder card-link">
          <span className="card-icon">📅</span>
          <h3>History</h3>
          <p>View all your past metric entries.</p>
        </Link>
        <Link to="/blog" className="card card-placeholder card-link">
          <span className="card-icon">✏️</span>
          <h3>Blog</h3>
          <p>Write your daily entries to keep track of your progress.</p>
        </Link>
      </div>
    </div>
  );
}
