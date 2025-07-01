import React, { useEffect, useState } from "react";
import { useLang } from "../i18n";
import { apiRequest, getAuthToken } from "../api";

// PUBLIC_INTERFACE
export default function Downloads() {
  const { t } = useLang();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [dlId, setDlId] = useState(null);

  useEffect(() => {
    async function fetchCerts() {
      setLoading(true);
      setErr("");
      try {
        const res = await apiRequest(
          "/certificates",
          "GET",
          null,
          getAuthToken()
        );
        setCerts(res.certificates || []);
      } catch {
        setErr("Failed to load certificates");
      }
      setLoading(false);
    }
    fetchCerts();
  }, []);

  async function handleDownload(id, filename) {
    setDlId(id);
    setErr("Download not available. Please contact the police station for your issued certificate.");
    setDlId(null);
  }

  return (
    <div className="container" style={{ maxWidth: 480, margin: "32px auto" }}>
      <h2>{t("download_certificate")}</h2>
      <p>Download your issued police certificates here when available.</p>
      {err && <div style={{ color: "#ce2b28", marginBottom: 10 }}>{err}</div>}
      {loading ? (
        <div>{t("loading")}</div>
      ) : certs.length > 0 ? (
        <ul>
          {certs.map((c) => (
            <li key={c.id} style={{ marginBottom: 12 }}>
              {c.file_name || `Certificate #${c.id}`}
              {/* Download not available since endpoint missing in backend */}
              <span style={{ marginLeft: 10, color: "#1976D2" }}>
                (In person collection only)
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div>{t("certificate_no_applications")}</div>
      )}
    </div>
  );
}
