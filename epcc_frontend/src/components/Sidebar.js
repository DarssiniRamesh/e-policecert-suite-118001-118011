import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useLang } from "../i18n";
import { getAuthToken } from "../api";

// PUBLIC_INTERFACE
export default function Sidebar({ open, closeSidebar, handleLogout }) {
  const { t } = useLang();
  const location = useLocation();
  const token = getAuthToken();

  // TODO: replace with actual user/admin check
  const isAdmin = token != null; // in real app, fetch user and check isAdmin

  const links = [
    { path: "/", label: t("dashboard"), icon: "🏠" },
    { path: "/applications", label: t("certificate_history"), icon: "📄" },
    { path: "/apply", label: t("apply_certificate"), icon: "📝" },
    { path: "/notifications", label: t("notifications"), icon: "🔔" },
    { path: "/upload", label: t("upload_documents"), icon: "📎" },
    { path: "/downloads", label: t("download_certificate"), icon: "⬇️" },
    ...(isAdmin
      ? [
          { path: "/admin", label: t("adminDashboard"), icon: "🛠️" },
          { path: "/admin/users", label: "User Management", icon: "👥" }
        ]
      : []),
  ];

  return (
    <aside
      style={{
        width: open ? 220 : 0,
        background: "var(--sidebar-bg)",
        position: "fixed",
        height: "100vh",
        left: 0,
        top: 60,
        overflow: "hidden",
        transition: "width 0.21s cubic-bezier(.77,.32,.4,1.01)",
        boxShadow: open ? "2.5px 0 14px #1e2a3822" : "none",
        zIndex: 99,
        borderRight: open ? "1.5px solid var(--border-color)" : "none",
      }}
      aria-label="Sidebar"
    >
      <nav style={{
        padding: "18px 10px 10px 7px",
        minHeight: "92%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}>
        {links.map((l) => {
          const isActive = location.pathname === l.path;
          return (
            <Link
              to={l.path}
              key={l.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                background: isActive ? "var(--sidebar-active)" : "unset",
                color: isActive
                  ? "#fff"
                  : "var(--text-sidebar)",
                textDecoration: "none",
                fontWeight: isActive ? 700 : 500,
                margin: "5px 0",
                fontSize: 16,
                padding: "11px 18px",
                borderRadius: 7,
                opacity: isActive ? 1 : 0.90,
                outline: "none",
                border: "none",
                transition: "background 0.16s, color 0.14s",
                boxShadow: isActive ? "0 2px 9px #1e2a3810" : "none",
              }}
              onClick={closeSidebar}
              onMouseOver={e => {
                if (!isActive)
                  e.currentTarget.style.background = "var(--sidebar-hover)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseOut={e => {
                if (!isActive)
                  e.currentTarget.style.background = "unset";
                e.currentTarget.style.color = isActive ? "#fff" : "var(--text-sidebar)";
              }}
              tabIndex={open ? 0 : -1}
            >
              <span style={{ fontSize: 20 }}>
                {l.icon}
              </span>
              {l.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
