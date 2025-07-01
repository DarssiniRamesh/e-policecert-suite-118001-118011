import React, { useEffect, useState, useRef } from "react";
import { useLang } from "../i18n";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { getAuthToken, removeAuthToken, apiRequest } from "../api";

// PUBLIC_INTERFACE
export default function TopNavBar({ toggleTheme, theme, onSidebar }) {
  const { t, lang, setLang } = useLang();
  const token = getAuthToken();
  const navigate = useNavigate();
  const location = useLocation();

  // Notifications quick badge+popover
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifs, setRecentNotifs] = useState([]);
  const [showPopover, setShowPopover] = useState(false);
  const pollRef = useRef();
  const popoverRef = useRef();

  // Only poll if logged in
  useEffect(() => {
    let ignore = false;
    async function loadNotifs() {
      if (!token) {
        setUnreadCount(0);
        setRecentNotifs([]);
        return;
      }
      try {
        const resp = await apiRequest("/notifications", "GET", null, token);
        let notifs =
          Array.isArray(resp) ? resp :
          (resp && Array.isArray(resp.notifications)) ? resp.notifications : [];
        setRecentNotifs(notifs.slice(0, 5));
        setUnreadCount(notifs.filter(n => !n.is_read).length);
      } catch {
        setRecentNotifs([]);
        setUnreadCount(0);
      }
    }
    loadNotifs();
    if (token) {
      pollRef.current = setInterval(loadNotifs, 22000);
    }
    return () => {
      ignore = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [token, location.pathname]);

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setShowPopover(false);
      }
    }
    if (showPopover) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPopover]);

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
        {/* Notifications badge for logged in */}
        {token && (
          <div style={{ position: "relative", marginRight: 15 }}>
            <button
              aria-label={t("notifications")}
              style={{
                background: "none",
                border: "none",
                position: "relative",
                fontSize: 23,
                cursor: "pointer",
                color: "#fff",
                margin: "0 5px"
              }}
              onClick={() => setShowPopover((s) => !s)}
              tabIndex={0}
            >
              <span role="img" aria-label="notif">🔔</span>
              {unreadCount > 0 && (
                <sup style={{
                  position: "absolute",
                  top: -6,
                  right: -2,
                  background: "#43a047",
                  color: "#fff",
                  borderRadius: "40%",
                  padding: "1.5px 6px",
                  fontSize: 13,
                  fontWeight: 700,
                  boxShadow: "0 1px 4px #1e2a3845"
                }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </sup>
              )}
            </button>
            {showPopover && (
              <div
                ref={popoverRef}
                style={{
                  position: "absolute",
                  top: 38,
                  right: 1,
                  background: "#fff",
                  color: "#1a1a1a",
                  minWidth: 255,
                  maxWidth: 330,
                  boxShadow: "0 4px 36px #1e2a3831",
                  borderRadius: 13,
                  border: "1.5px solid #e3e8ef",
                  zIndex: 101,
                }}
              >
                <div style={{
                  fontWeight: 700,
                  fontSize: 16,
                  color: "#1976D2",
                  padding: "8px 15px 6px 15px",
                  borderBottom: "1px solid #e3e8ef",
                  background: "#eaf1fe",
                  borderTopLeftRadius: 13,
                  borderTopRightRadius: 13
                }}>
                  {t("notifications")}
                </div>
                <div style={{ maxHeight: 240, overflowY: "auto" }}>
                  {recentNotifs.length === 0 ? (
                    <div style={{ padding: "13px 15px", color: "#888" }}>
                      No notifications.
                    </div>
                  ) : (
                    recentNotifs.map((n, i) => (
                      <div
                        key={n.id || i}
                        style={{
                          padding: "10px 14px",
                          background: !n.is_read ? "#eaf1fe" : "transparent",
                          color: !n.is_read ? "#1976d2" : "#222",
                          fontWeight: n.is_read ? 400 : 600,
                          borderBottom: i < recentNotifs.length - 1 ? "1px dashed #e3e8ef" : "none",
                          fontSize: 15,
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        <span style={{
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {n.message || n.text || n.detail || JSON.stringify(n)}
                        </span>
                        {!n.is_read && (
                          <span style={{
                            display: "inline-block", marginLeft: 7, width: 9, height: 9, borderRadius: "50%",
                            background: "#43a047", border: "2px solid #1e88e5"
                          }} aria-label="Unread" />
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div style={{
                  padding: "9px 16px 11px 16px", background: "#f6f8fa",
                  borderBottomLeftRadius: 13, borderBottomRightRadius: 13,
                  textAlign: "right"
                }}>
                  <Link to="/notifications" style={{
                    color: "#1976d2", fontWeight: 700, fontSize: 14,
                    textDecoration: "underline", letterSpacing: 0
                  }}
                    onClick={() => setShowPopover(false)}
                  >
                    See all →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
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
