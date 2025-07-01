import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useLang } from "../i18n";
import { getUserRoleInfo } from "../auth";
import { getAuthToken } from "../api";

// PUBLIC_INTERFACE
export default function Sidebar({ open, closeSidebar, handleLogout }) {
  const { t } = useLang();
  const location = useLocation();
  const token = getAuthToken();
  // Always evaluate fresh on render
  const { isAdmin } = getUserRoleInfo();

  // Only show links if user is authenticated
  if (!token) return null;

  // Each link can be marked for admin (so we can harden further)
  const allLinks = [
    { path: "/", label: t("dashboard"), icon: "🏠", admin: false },
    { path: "/applications", label: t("certificate_history"), icon: "📄", admin: false },
    { path: "/apply", label: t("apply_certificate"), icon: "📝", admin: false },
    { path: "/verify", label: "Verify Certificate", icon: "🔎", admin: false },
    { path: "/notifications", label: t("notifications"), icon: "🔔", admin: false },
    { path: "/upload", label: t("upload_documents"), icon: "📎", admin: false },
    { path: "/downloads", label: t("download_certificate"), icon: "⬇️", admin: false },
    // Admin UI
    { path: "/admin", label: t("adminDashboard"), icon: "🛠️", admin: true },
    { path: "/admin/users", label: "User Management", icon: "👥", admin: true },
  ];

  // Final filtered links for this user
  const navLinks = allLinks.filter(l =>
    !l.admin || (l.admin && isAdmin)
  );

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
        {navLinks.map((l) => {
          const isActive = location.pathname === l.path;
          return (
            <Link
              to={l.path}
              key={l.path}
              aria-label={l.label}
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
        {/* Always show a logout shortcut at the end for authenticated users */}
        <button
          onClick={handleLogout}
          style={{
            margin: "30px 0 8px 8px",
            background: "var(--epcc-danger)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            padding: "11px 18px",
            fontSize: 15,
            cursor: "pointer"
          }}
        >
          {t("logout")}
        </button>
      </nav>
    </aside>
  );
}
