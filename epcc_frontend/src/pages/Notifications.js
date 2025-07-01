import React, { useEffect, useState, useRef } from "react";
import { useLang } from "../i18n";
import { apiRequest, getAuthToken } from "../api";
import { Link } from "react-router-dom";

// PUBLIC_INTERFACE
/**
 * Enhanced Notifications page for EPCC:
 * - Shows read/unread status, supports mark-as-read, action links, and polling for real-time updates.
 * - Notifications: { id, message, is_read, is_actioned, action_url, created_at, ... }
 * - Allows both user and admin to action notifications.
 */
export default function Notifications() {
  const { t } = useLang();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [pending, setPending] = useState({});
  const [manualReload, setManualReload] = useState(0);
  const pollRef = useRef();

  // Helper: sort notifications newest-first, unread first
  function sortedNotifications(list) {
    return [...list].sort((a, b) => {
      if (a.is_read === b.is_read) {
        return (new Date(b.created_at || b.timestamp || 0)) - (new Date(a.created_at || a.timestamp || 0));
      }
      return a.is_read ? 1 : -1; // unread before read
    });
  }

  // Fetch notifications (can be initial or poll)
  const fetchNotifications = async () => {
    setLoading(true);
    setErr("");
    try {
      const resp = await apiRequest(
        "/notifications",
        "GET",
        null,
        getAuthToken()
      );
      let notifs =
        Array.isArray(resp) ? resp :
        (resp && Array.isArray(resp.notifications)) ? resp.notifications : [];
      setNotifications(notifs);
    } catch (e) {
      setNotifications([]);
      setErr("Failed to load notifications.");
    }
    setLoading(false);
  };

  // Polling for updates, every 25 sec; refresh manually also possible
  useEffect(() => {
    fetchNotifications();
    pollRef.current = setInterval(fetchNotifications, 25000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line
  }, [manualReload]);

  // Mark as read handler (optimistic update)
  async function handleMarkRead(id) {
    setPending(p => ({ ...p, [id]: true }));
    try {
      await apiRequest(`/notifications/${id}/markread`, "PATCH", null, getAuthToken());
      setNotifications(nots =>
        nots.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch {}
    setPending(p => {
      const np = { ...p };
      delete np[id];
      return np;
    });
  }

  // Mark as actioned handler (could be dismiss or take action, e.g., go to a link and mark as actioned)
  async function handleAction(id, actionUrl) {
    setPending(p => ({ ...p, ["a"+id]: true }));
    try {
      // Custom endpoint for actioning a notification if available
      await apiRequest(`/notifications/${id}/action`, "PATCH", null, getAuthToken());
      setNotifications(nots =>
        nots.map(n => n.id === id ? { ...n, is_actioned: true, is_read: true } : n)
      );
      // If action_url, go to it
      if (actionUrl) window.open(actionUrl, "_blank");
    } catch {}
    setPending(p => {
      const np = { ...p };
      delete np["a"+id];
      return np;
    });
  }

  // Visual badge (for unread)
  function badge(status) {
    return (
      <span style={{
        display: "inline-block",
        marginLeft: 8,
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: status ? "#43a047" : "#1e2a38",
        border: status ? "2px solid #1e88e5" : "2px solid #dedede"
      }} aria-label={status ? "Unread" : "Read"} />
    );
  }

  // Notification detail inline expander (if notification has details/JSON)
  function NotificationDetail({ notif }) {
    if (!notif.details && !notif.info) return null;
    return (
      <div style={{
        fontSize: 13,
        padding: "7px 12px",
        margin: "3px 0 3px 0",
        background: "#f6f8fa",
        border: "1px solid #e3e8ef",
        borderRadius: 7,
        color: "#222"
      }}>
        {typeof notif.details === "string" ? notif.details :
          <pre style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}>
            {JSON.stringify(notif.details || notif.info, null, 2)}
          </pre>
        }
      </div>
    );
  }

  // Render
  return (
    <div className="container" style={{ maxWidth: 540, margin: "32px auto" }}>
      <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {t("notifications")}
        <button className="theme-toggle" onClick={() => setManualReload(r => r + 1)}
          style={{ fontSize: 14, padding: "7px 13px", marginLeft: 13 }}>
          ⟳ Refresh
        </button>
      </h2>
      {loading ? (
        <div>{t("loading")}</div>
      ) : err ? (
        <div style={{ color: "#ce2b28", marginBottom: 10 }}>{err}</div>
      ) : notifications.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {sortedNotifications(notifications).map((n, idx) => (
            <li key={n.id || idx}
              style={{
                margin: "0 0 15px 0",
                padding: 0,
                background: n.is_read ? "#f6f8fa" : "#eaf1fe",
                borderRadius: 12,
                border: n.is_read ? "1.5px solid #d6e2f3" : "2.3px solid #1976d2",
                boxShadow: n.is_read ? "none" : "0 2px 6px #1976d211",
                position: "relative"
              }}>
              <div style={{
                padding: "15px 13px 10px 15px", fontWeight: n.is_read ? 400 : 600,
                color: n.is_read ? "#1a1a1a" : "#1976d2", fontSize: 15, display: "flex", alignItems: "center"
              }}>
                <span>
                  {n.message || n.text || n.detail || JSON.stringify(n)}
                  {!n.is_read && badge(true)}
                </span>
              </div>
              {/* Metadata */}
              <div style={{
                paddingLeft: 15, color: "#666", fontSize: 13, display: "flex", alignItems: "center", gap: 14
              }}>
                {n.created_at && (
                  <span style={{ color: "#888" }}>
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                )}
                {n.is_read && <span style={{ color: "#61b06b" }}>Read</span>}
                {n.is_actioned && <span style={{ color: "#1976d2" }}>Actioned</span>}
                {/* Extra info/badge if notification relates to an application/cert */}
                {n.related_application_id && (
                  <Link to="/applications" style={{ color: "#1565c0", marginLeft: 6 }}>View App</Link>
                )}
              </div>
              {/* Detail Payload */}
              <NotificationDetail notif={n} />
              {/* Action/Mark as Read Buttons */}
              <div style={{ padding: 0, margin: "0 0 13px 0", display: "flex", gap: 10, alignItems: "center", paddingLeft: 15 }}>
                {!n.is_read && (
                  <button
                    className="theme-toggle"
                    disabled={pending[n.id]}
                    style={{
                      background: "#1e88e5",
                      color: "#fff", minWidth: 70, fontSize: 13, 
                      padding: "4px 14px"
                    }}
                    onClick={() => handleMarkRead(n.id)}
                  >
                    {pending[n.id] ? "..." : "Mark as Read"}
                  </button>
                )}
                {!n.is_actioned && n.action_url && (
                  <button
                    className="theme-toggle"
                    style={{
                      background: "#43a047",
                      color: "#fff", minWidth: 92, fontSize: 13,
                      padding: "4px 14px"
                    }}
                    disabled={pending["a"+n.id]}
                    onClick={() => handleAction(n.id, n.action_url)}
                  >
                    {pending["a"+n.id] ? "..." : "Take Action"}
                  </button>
                )}
                {/* Extra link if notification implies navigation, as fallback */}
                {!n.is_actioned && !n.action_url && n.related_application_id && (
                  <Link
                    className="theme-toggle"
                    style={{
                      background: "#1976d2", color: "#fff",
                      minWidth: 92, fontSize: 13, padding: "4px 14px", display: "inline-block", textAlign: "center", textDecoration: "none"
                    }}
                    to="/applications"
                    onClick={() => handleMarkRead(n.id)}
                  >
                    View Application
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div>No notifications.</div>
      )}
    </div>
  );
}
