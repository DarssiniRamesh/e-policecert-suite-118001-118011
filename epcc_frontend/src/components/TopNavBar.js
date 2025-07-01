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
        background: "var(--nav-bg)",
        boxShadow: "var(--nav-shadow)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "fixed",
        width: "100%",
        zIndex: 100,
        borderBottom: "1.5px solid var(--border-color)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
        <button
          onClick={onSidebar}
          aria-label="Open sidebar"
          style={{
            margin: "0 16px 0 7px",
            fontSize: 23,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#fff",
          }}
        >
          ≡
        </button>
        <span
          style={{
            fontWeight: "bold",
            fontSize: 22,
            color: "#fff",
            letterSpacing: "1px",
            cursor: "pointer",
            fontFamily: "system-ui,sans-serif",
            textShadow: "0 1px 6px #1e2a3831",
            verticalAlign: "middle",
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
            background: "#ffffff15",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 15,
            boxShadow: "none"
          }}
          onClick={handleChangeLang}
        >
          {lang === "en" ? t("bislama") : t("english")}
        </button>
        {token && (
          <button
            style={{
              marginLeft: 16,
              padding: "8px 13px",
              borderRadius: 8,
              border: "none",
              background: "var(--epcc-danger)",
              color: "#fff",
              fontWeight: "bold",
              fontSize: 15.5,
              cursor: "pointer",
              boxShadow: "none",
              textTransform: "uppercase"
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
