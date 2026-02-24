import { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { setTheme } from '../store/themeSlice';
import './Layout.css';

export default function Layout() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const theme = useSelector((state) => state.theme.theme);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="logo">
          <span className="logo-icon">◆</span>
          Health Tracker
        </Link>
        <nav className="nav">
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/metrics">Metrics</Link>
              <Link to="/history">History</Link>
              <Link to="/blog">Blog</Link>
              <div className="nav-user-wrap" ref={dropdownRef}>
                <button
                  type="button"
                  className="nav-user-trigger"
                  onClick={() => setDropdownOpen((o) => !o)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                  aria-label="User menu"
                >
                  <span className="user-name">{user.name}</span>
                  <span className="nav-user-chevron" aria-hidden>▼</span>
                </button>
                {dropdownOpen && (
                  <div className="nav-user-dropdown" role="menu">
                    <div className="nav-user-dropdown-heading">Theme</div>
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={theme === 'light'}
                      className="nav-user-dropdown-item"
                      onClick={() => {
                        dispatch(setTheme('light'));
                        setDropdownOpen(false);
                      }}
                    >
                      <span className="nav-user-dropdown-check">{theme === 'light' ? '✓' : ''}</span>
                      Light
                    </button>
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={theme === 'dark'}
                      className="nav-user-dropdown-item"
                      onClick={() => {
                        dispatch(setTheme('dark'));
                        setDropdownOpen(false);
                      }}
                    >
                      <span className="nav-user-dropdown-check">{theme === 'dark' ? '✓' : ''}</span>
                      Dark
                    </button>
                    <div className="nav-user-dropdown-divider" />
                    <button
                      type="button"
                      role="menuitem"
                      className="nav-user-dropdown-item nav-user-dropdown-item--logout"
                      onClick={handleLogout}
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register" className="btn btn-primary">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className={`main ${isAuthPage ? 'main--auth' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
