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
    try {
      const token = getAuthToken();
      const resp = await fetch(
        process.env.REACT_APP_EPCC_BACKEND_URL
          ? process.env.REACT_APP_EPCC_BACKEND_URL + `/certificates/${id}/download`
          : `http://localhost:3001/certificates/${id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!resp.ok) throw new Error("Failed to download");
      const blob = await resp.blob();
      const href = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.setAttribute("download", filename || "certificate.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(href);
    } catch {
      setErr("Download failed.");
    }
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
              {c.file_name || `Certificate #${c.id}`}{" "}
              <button
                className="theme-toggle"
                style={{
                  marginLeft: 8,
                  fontSize: 14,
                  padding: "4px 18px",
                  minWidth: 88,
                }}
                onClick={() => handleDownload(c.id, c.file_name)}
                disabled={dlId === c.id}
              >
                {dlId === c.id ? t("loading") : t("download_certificate")}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div>{t("certificate_no_applications")}</div>
      )}
    </div>
  );
}
