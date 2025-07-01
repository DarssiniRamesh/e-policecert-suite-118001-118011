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
      ? [{ path: "/admin", label: t("adminDashboard"), icon: "🛠️" }]
      : []),
  ];

  return (
    <aside
      style={{
        width: open ? 200 : 0,
        background: "var(--bg-secondary)",
        position: "fixed",
        height: "100vh",
        left: 0,
        top: 60,
        overflow: "hidden",
        transition: "width 0.2s",
        boxShadow: open ? "2px 0 4px #dedede90" : "none",
        zIndex: 99,
      }}
      aria-label="Sidebar"
    >
      <nav style={{ padding: 12, minHeight: "90%" }}>
        {links.map((l) => (
          <Link
            to={l.path}
            key={l.path}
            style={{
              display: "flex",
              alignItems: "center",
              background:
                location.pathname === l.path ? "var(--border-color)" : "",
              color:
                location.pathname === l.path
                  ? "var(--text-secondary)"
                  : "var(--text-primary)",
              textDecoration: "none",
              fontWeight: 600,
              margin: "6px 0",
              fontSize: 15,
              padding: "10px 8px",
              borderRadius: 7,
              gap: 8,
              transition: "background 0.17s",
            }}
            onClick={closeSidebar}
          >
            <span style={{ fontSize: 18 }}>{l.icon}</span> {l.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
