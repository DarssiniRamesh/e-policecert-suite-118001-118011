import React from "react";
import { useLang } from "../i18n";
import { useNavigate } from "react-router-dom";
import { getAuthToken, removeAuthToken } from "../api";

// PUBLIC_INTERFACE
export default function TopNavBar({ toggleTheme, theme, onSidebar }) {
  const { t, lang, setLang } = useLang();
  const token = getAuthToken();
  const navigate = useNavigate();

  const handleChangeLang = () => {
    setLang(lang === "en" ? "bi" : "en");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <nav
      style={{
        height: 60,
        background: "var(--bg-secondary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "fixed",
        width: "100%",
        zIndex: 100,
        boxShadow: "0 1px 4px #dedede90",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
        <button
          onClick={onSidebar}
          aria-label="Open sidebar"
          style={{
            margin: "0 16px",
            fontSize: 22,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-primary)",
          }}
        >
          ≡
        </button>
        <span
          style={{
            fontWeight: "bold",
            fontSize: 20,
            color: "var(--text-primary)",
            letterSpacing: "1px",
            cursor: "pointer",
          }}
          onClick={handleLogoClick}
        >
          EPCC
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
        <button
          style={{
            marginLeft: 16,
            padding: "8px 12px",
            borderRadius: 8,
            border: "none",
            background: "var(--border-color)",
            color: "var(--text-primary)",
            cursor: "pointer",
            fontWeight: 600,
          }}
          onClick={handleChangeLang}
        >
          {lang === "en" ? t("bislama") : t("english")}
        </button>
        {token && (
          <button
            style={{
              marginLeft: 16,
              padding: "8px 12px",
              borderRadius: 8,
              border: "none",
              background: "#ce2b28",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={() => {
              removeAuthToken();
              navigate("/login");
            }}
          >
            {t("logout")}
          </button>
        )}
      </div>
    </nav>
  );
}
