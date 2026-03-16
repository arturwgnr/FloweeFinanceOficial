import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/components/Navbar.css";

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="navbar__left">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="navbar__menu-btn"
          aria-label="Open menu"
        >
          <svg
            className="navbar__menu-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <span className="navbar__mobile-logo">Flowee</span>
      </div>

      <div className="navbar__right">
        {user && (
          <div className="navbar__user">
            <div className="navbar__avatar">
              <span className="navbar__avatar-initial">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="navbar__username">{user.name}</span>
          </div>
        )}
        <button onClick={handleLogout} className="navbar__logout">
          Logout
        </button>
      </div>
    </header>
  );
}
