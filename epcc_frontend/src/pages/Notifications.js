import React, { useEffect, useState } from "react";
import { useLang } from "../i18n";
import { apiRequest, getAuthToken } from "../api";

// PUBLIC_INTERFACE
/**
 * Notifications page
 * - Fetches notifications from backend: GET /notifications
 * - Requires JWT in Authorization header ("Bearer <token>")
 * - Expects response: { notifications: [...] }
 */
export default function Notifications() {
  const { t } = useLang();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function getNotifs() {
      setLoading(true);
      setErr("");
      try {
        const resp = await apiRequest(
          "/notifications",
          "GET",
          null,
          getAuthToken()
        );
        // Ensure compatibility even if backend response is just a list
        if (Array.isArray(resp)) {
          setNotifications(resp);
        } else if (resp && Array.isArray(resp.notifications)) {
          setNotifications(resp.notifications);
        } else {
          setNotifications([]);
        }
      } catch (e) {
        setNotifications([]);
        setErr("Failed to load notifications.");
      }
      setLoading(false);
    }
    getNotifs();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="container" style={{ maxWidth: 480, margin: "32px auto" }}>
      <h2>{t("notifications")}</h2>
      {loading ? (
        <div>{t("loading")}</div>
      ) : err ? (
        <div style={{ color: "#ce2b28", marginBottom: 10 }}>{err}</div>
      ) : notifications.length > 0 ? (
        <ul>
          {notifications.map((n, idx) => (
            <li key={n.id || idx} style={{ margin: "8px 0" }}>
              {n.message || n.text || n.detail || JSON.stringify(n)}
            </li>
          ))}
        </ul>
      ) : (
        <div>No notifications.</div>
      )}
    </div>
  );
}
