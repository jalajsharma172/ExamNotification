import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        Exam Intelligence
      </Link>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${pathname === '/' ? 'nav-active' : ''}`}>
          Dashboard
        </Link>
        <Link to="/frontend/history" className={`nav-link ${pathname === '/frontend/history' ? 'nav-active' : ''}`}>
          History Logs
        </Link>
        <Link to="/frontend/api-keys" className={`nav-link ${pathname === '/frontend/api-keys' ? 'nav-active' : ''}`}>
          API Keys
        </Link>
      </div>
    </nav>
  );
}
