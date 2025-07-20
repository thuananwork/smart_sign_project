import React from "react";
import "./Header.css";
import logo from "../../assets/images/logo.png";

interface HeaderProps {
  userName?: string;
  userAvatar?: string;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ userName, userAvatar, onLogout }) => {
  const [showMenu, setShowMenu] = React.useState(false);
  return (
    <header className="dash-header">
      <div className="dash-header-left">
        <img src={logo} alt="SmartSign" className="dash-logo" />
        <span className="dash-brand">SmartSign</span>
      </div>
      <nav className="dash-nav">
        <a href="/dashboard" className="dash-link dash-link-active">Quản lý hợp đồng</a>
        <a href="#" className="dash-link">Hồ sơ</a>
        <button
          className="dash-avatar-btn"
          onClick={() => setShowMenu(v => !v)}
          tabIndex={0}
        >
          <img src={userAvatar || "/default-avatar.png"} className="dash-avatar" alt="avatar" />
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
