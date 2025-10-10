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
    const [showMobileMenu, setShowMobileMenu] = React.useState(false);
    const [showUserMenu, setShowUserMenu] = React.useState(false);
    const [showProfile, setShowProfile] = React.useState(false);
    const userMenuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!showUserMenu) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target as Node)
            ) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showUserMenu]);

    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu);
    };

    const closeMobileMenu = () => {
        setShowMobileMenu(false);
    };

    return (
        <header className="header">
            {/* Logo */}
            <NavLink to="/dashboard" className="header__brand">
                <img src={logo} alt="SmartSign" className="header__logo" />
            </NavLink>

            {/* Hamburger Menu Button */}
            <button
                className="header__hamburger"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
            >
                <i
                    className={`header__hamburger-icon fa-solid ${
                        showMobileMenu ? "fa-xmark" : "fa-bars"
                    }`}
                ></i>
            </button>

            {/* Mobile Menu Overlay */}
            {showMobileMenu && (
                <div
                    className={`header__mobile-overlay ${
                        showMobileMenu ? "show" : ""
                    }`}
                    onClick={closeMobileMenu}
                >
                    <nav
                        className="header__mobile-nav"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="header__mobile-user">
                            <img
                                src={avatarUrl || "/default-avatar.png"}
                                className="header__mobile-avatar"
                                alt="avatar"
                            />
                            <span className="header__mobile-username">
                                {userName || "User"}
                            </span>
                        </div>

                        <div className="header__mobile-links">
                            <NavLink
                                to="/dashboard"
                                className={({ isActive }) =>
                                    `header__mobile-link ${
                                        isActive ? "header__mobile-active" : ""
                                    }`
                                }
                                onClick={closeMobileMenu}
                            >
                                Quản lý hợp đồng
                            </NavLink>
                            <NavLink
                                to="/signature"
                                className={({ isActive }) =>
                                    `header__mobile-link ${
                                        isActive ? "header__mobile-active" : ""
                                    }`
                                }
                                onClick={closeMobileMenu}
                            >
                                Trang Ký Tên
                            </NavLink>
                            <NavLink
                                to="/profile"
                                className="header__mobile-link"
                                onClick={closeMobileMenu}
                            >
                                Hồ sơ
                            </NavLink>
                            <button
                                className="header__mobile-link header__mobile-logout"
                                onClick={() => {
                                    closeMobileMenu();
                                    onLogout?.();
                                }}
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </nav>
                </div>
            )}

            {/* Desktop User Menu (hidden on mobile) */}
            <div className="header__desktop-user" ref={userMenuRef}>
                <button
                    className="header__user-btn"
                    onClick={() => setShowUserMenu((v) => !v)}
                    tabIndex={0}
                >
                    <img
                        src={avatarUrl || "/default-avatar.png"}
                        className="header__user-avatar"
                        alt="avatar"
                    />
                    <span className="header__user-name">
                        {userName || "User"}
                    </span>
                </button>
                {showUserMenu && (
                    <div className="header__user-menu">
                        <NavLink
                            to="/profile"
                            className="header__user-menu-item"
                            onClick={() => setShowUserMenu(false)}
                        >
                            Hồ sơ
                        </NavLink>
                        <button
                            className="header__user-menu-item"
                            onClick={onLogout}
                        >
                            Đăng xuất
                        </button>
                    </div>
                )}
            </div>

            {/* Profile Modal */}
            {showProfile && (
                <div
                    className="profile-modal-overlay"
                    onClick={() => setShowProfile(false)}
                >
                    <div
                        className="profile-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="profile-modal__close"
                            onClick={() => setShowProfile(false)}
                        >
                            ×
                        </button>
                        <img
                            src={avatarUrl || "/default-avatar.png"}
                            alt="avatar"
                            className="profile-modal__avatar"
                        />
                        <h2>{userName || "User"}</h2>
                        {/* Add more user details here */}
                        <p>Email: user@email.com</p>
                    </div>
                </div>
            )}
        </header>
    );
};
export default Header;
