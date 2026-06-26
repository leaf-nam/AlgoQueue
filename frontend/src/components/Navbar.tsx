import { Link } from "react-router-dom";
import "../Styles/Navbar.css";
import logo from "../assets/algoqueue.png";

function Navbar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Link to="/" className="logo-link">
          <img src={logo} alt="Algo Queue" className="logo-img" />
          <h2 className="logo-text">Algo Queue</h2>
        </Link>
      </div>

      <nav className="sidebar-nav">
        <Link to="/history">📈 큐</Link>
        <Link to="/">📊 대시보드</Link>
        <Link to="/problems">📝 문제</Link>
        <Link to="/categories">🏷️ 카테고리</Link>
        <Link to="/settings">⚙️ 설정</Link>
      </nav>
    </aside>
  );
}

export default Navbar;
