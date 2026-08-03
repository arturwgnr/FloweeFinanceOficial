import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import notifications from "../config/notifications";
import "../styles/components/Navbar.css";

const LAST_SEEN_KEY = "flowee_last_seen_notification_id";

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [lastSeenId, setLastSeenId] = useState(
    () => Number(localStorage.getItem(LAST_SEEN_KEY)) || 0
  );
  const wrapperRef = useRef(null);

  const sorted = [...notifications].sort((a, b) => b.id - a.id);
  const unseenCount = notifications.filter((n) => n.id > lastSeenId).length;

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleToggle() {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        const highestId = notifications.reduce((max, n) => Math.max(max, n.id), 0);
        localStorage.setItem(LAST_SEEN_KEY, String(highestId));
        setLastSeenId(highestId);
      }
      return next;
    });
  }

  return (
    <div className="navbar__notifications" ref={wrapperRef}>
      <button
        onClick={handleToggle}
        className="navbar__bell-btn"
        aria-label="Notifications"
      >
        <Bell className="navbar__bell-icon" />
        {unseenCount > 0 && (
          <span className="navbar__bell-badge">{unseenCount}</span>
        )}
      </button>

      {open && (
        <div className="navbar__notifications-dropdown">
          <div className="navbar__notifications-header">Updates</div>
          {sorted.length === 0 ? (
            <p className="navbar__notifications-empty">No updates yet.</p>
          ) : (
            <ul className="navbar__notifications-list">
              {sorted.map((n) => (
                <li key={n.id} className="navbar__notifications-item">
                  <p className="navbar__notifications-message">{n.message}</p>
                  <p className="navbar__notifications-date">
                    {new Date(n.date).toLocaleDateString("default", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

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
        <NotificationBell />
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
