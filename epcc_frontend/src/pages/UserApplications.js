import React, { useEffect, useState } from "react";
import { useLang } from "../i18n";
import { apiRequest, getAuthToken } from "../api";

// PUBLIC_INTERFACE
export default function UserApplications() {
  const { t } = useLang();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const data = await apiRequest(
          "/applications",
          "GET",
          null,
          getAuthToken()
        );
        setApplications(data.applications || []);
      } catch {
        setApplications([]);
      }
      setLoading(false);
    };
    fetchApps();
  }, []);

  return (
    <div className="container" style={{ maxWidth: 600, margin: "32px auto" }}>
      <h2>{t("certificate_history")}</h2>
      {loading ? (
        <div>{t("loading")}</div>
      ) : applications.length > 0 ? (
        <table style={{ width: "100%", margin: "18px 0" }}>
          <thead>
            <tr>
              <th>{t("application")}</th>
              <th>{t("status")}</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((a, idx) => (
              <tr key={idx}>
                <td>
                  {a.id}: {a.type}
                </td>
                <td>{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>{t("certificate_no_applications")}</div>
      )}
    </div>
  );
}
