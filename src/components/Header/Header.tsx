import React from "react";
import { NavLink } from "react-router-dom";
import "./Header.css";
import logo from "../../assets/images/logo.png";

interface HeaderProps {
  userName?: string;
  avatarUrl?: string;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ userName, avatarUrl, onLogout }) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const currentPath = window.location.pathname;

  return (
    <header className="dash-header">
      <div className="dash-header-left">
        <img src={logo} alt="SmartSign" className="dash-logo" />
        <span className="dash-brand">SmartSign</span>
      </div>
      <nav className="dash-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `dash-link ${isActive ? 'dash-link-active' : ''}`}>
          Quản lý hợp đồng
        </NavLink>
        <NavLink to="/signature" className={({ isActive }) => `dash-link ${isActive ? 'dash-link-active' : ''}`}>
          Trang Ký Tên
        </NavLink>
        <button
          className="dash-avatar-btn"
          onClick={() => setShowMenu(v => !v)}
          tabIndex={0}
        >
          <img src={avatarUrl || "/default-avatar.png"} className="dash-avatar" alt="avatar" />
          <span className="dash-username">{userName || "User"}</span>
        </button>
        {showMenu && (
          <div className="dash-menu">
            <a href="#" className="dash-menu-item">Hồ sơ</a>
            <button className="dash-menu-item" onClick={onLogout}>Đăng xuất</button>
          </div>
        )}
      </nav>
    </header>
  );
};
export default Header;