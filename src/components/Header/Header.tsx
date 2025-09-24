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
    const menuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!showMenu) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showMenu]);

    return (
        <header className="header">
            {/* Logo */}
            <NavLink to="/dashboard" className="header__brand">
                <img src={logo} alt="SmartSign" className="header__logo" />
            </NavLink>

            {/* Navigation Links */}
            <nav className="header__nav">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        `header__link ${isActive ? "header__active" : ""}`
                    }
                >
                    Quản lý hợp đồng
                </NavLink>
                <NavLink
                    to="/signature"
                    className={({ isActive }) =>
                        `header__link ${isActive ? "header__active" : ""}`
                    }
                >
                    Trang Ký Tên
                </NavLink>
            </nav>

            {/* User Info and Dropdown */}
            <div className="header__information" ref={menuRef}>
                <button
                    className="header__btn"
                    onClick={() => setShowMenu((v) => !v)}
                    tabIndex={0}
                >
                    <img
                        src={avatarUrl || "/default-avatar.png"}
                        className="header__avatar"
                        alt="avatar"
                    />
                    <span className="header__username">
                        {userName || "User"}
                    </span>
                </button>
                {showMenu && (
                    <div className="header__menu">
                        <a href="#" className="header__menu-item">
                            Hồ sơ
                        </a>
                        <button
                            className="header__menu-item"
                            onClick={onLogout}
                        >
                            Đăng xuất
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};
export default Header;
