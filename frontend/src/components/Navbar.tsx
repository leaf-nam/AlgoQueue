import { Link } from "react-router-dom";
import "../Styles/Navbar.css";
import logo from "../assets/algoqueue.png";

import {
  MdDashboard,
  MdHistory,
  MdOutlineAssignment,
  MdLabel,
  MdSettings,
  MdCode,
} from "react-icons/md";

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
        <Link to="/solve" className="nav-item">
          <MdCode className="nav-icon" />
          문제 풀이
        </Link>

        <Link to="/queue" className="nav-item">
          <MdHistory className="nav-icon" />
          알고리즘 큐
        </Link>

        <Link to="/" className="nav-item">
          <MdDashboard className="nav-icon" />
          대시보드
        </Link>

        <Link to="/problems" className="nav-item">
          <MdOutlineAssignment className="nav-icon" />
          문제
        </Link>

        <Link to="/categories" className="nav-item">
          <MdLabel className="nav-icon" />
          카테고리
        </Link>

        <Link to="/settings" className="nav-item">
          <MdSettings className="nav-icon" />
          설정
        </Link>
      </nav>
    </aside>
  );
}

export default Navbar;
