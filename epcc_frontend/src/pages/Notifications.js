import React, { useEffect, useState } from "react";
import { useLang } from "../i18n";
import { apiRequest, getAuthToken } from "../api";

// PUBLIC_INTERFACE
export default function Notifications() {
  const { t } = useLang();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getNotifs() {
      try {
        const data = await apiRequest(
          "/notifications",
          "GET",
          null,
          getAuthToken()
        );
        setNotifications(data.notifications || []);
      } catch {
        setNotifications([]);
      }
      setLoading(false);
    }
    getNotifs();
  }, []);

  return (
    <div className="container" style={{ maxWidth: 480, margin: "32px auto" }}>
      <h2>{t("notifications")}</h2>
      {loading ? (
        <div>{t("loading")}</div>
      ) : notifications.length > 0 ? (
        <ul>
          {notifications.map((n, idx) => (
            <li key={idx} style={{ margin: "8px 0" }}>
              {n.message}
            </li>
          ))}
        </ul>
      ) : (
        <div>No notifications.</div>
      )}
    </div>
  );
}
