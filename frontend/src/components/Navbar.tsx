import { Link } from "react-router-dom";
import "../Styles/Navbar.css";

function Navbar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>Algo Queue</h2>
      </div>

      <nav className="sidebar-nav">
        <Link to="/">📊 Dashboard</Link>
        <Link to="/problems">📝 Problems</Link>
        <Link to="/categories">🏷️ Categories</Link>
        <Link to="/history">📈 History</Link>
        <Link to="/settings">⚙️ Settings</Link>
      </nav>
    </aside>
  );
}

export default Navbar;
