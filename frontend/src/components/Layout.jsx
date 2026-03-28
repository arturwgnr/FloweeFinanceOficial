import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useModal } from "../context/ModalContext";
import "../styles/components/Layout.css";

function useIsIPad() {
  const [isIPad, setIsIPad] = useState(
    () => window.innerWidth >= 768 && window.innerWidth < 1024
  );

  useEffect(() => {
    function handleResize() {
      setIsIPad(window.innerWidth >= 768 && window.innerWidth < 1024);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isIPad;
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ipadCollapsed, setIpadCollapsed] = useState(true);
  const { isAnyModalOpen } = useModal();
  const isIPad = useIsIPad();

  // When resizing from mobile to iPad, reset overlay sidebar state
  useEffect(() => {
    if (isIPad) setSidebarOpen(false);
  }, [isIPad]);

  const sidebarCollapsed = isIPad ? ipadCollapsed : false;
  const ipadExpanded = isIPad && !ipadCollapsed;

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && !isIPad && (
        <div
          className="layout__overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* iPad expanded overlay */}
      {ipadExpanded && (
        <div
          className="layout__overlay layout__overlay--ipad"
          onClick={() => setIpadCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "layout__sidebar",
          isIPad ? "layout__sidebar--ipad" : "",
          isIPad && !ipadCollapsed ? "layout__sidebar--ipad-expanded" : "",
          !isIPad && sidebarOpen ? "layout__sidebar--mobile-open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <Sidebar
          onClose={() => {
            setSidebarOpen(false);
            setIpadCollapsed(true);
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setIpadCollapsed((v) => !v)}
          isIPad={isIPad}
        />
      </aside>

      {/* Main content */}
      <div
        className={`layout__content${isAnyModalOpen ? " layout__content--blurred" : ""}`}
      >
        <Navbar onMenuClick={() => {
          if (isIPad) {
            setIpadCollapsed((v) => !v);
          } else {
            setSidebarOpen(true);
          }
        }} />
        <main className="layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
