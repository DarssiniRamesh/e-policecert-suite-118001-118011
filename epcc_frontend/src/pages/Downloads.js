import React, { useEffect, useState } from "react";
import { useLang } from "../i18n";
import { apiRequest, getAuthToken } from "../api";

// PUBLIC_INTERFACE
/**
 * Certificate Downloads page:
 * - Fetches issued certificates from GET /certificates (requires Authorization: Bearer <token>)
 * - Response: { certificates: [...] } or array
 * - Download not supported (forwards user to in-person collection)
 */
export default function Downloads() {
  const { t } = useLang();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function fetchCerts() {
      setLoading(true);
      setErr("");
      try {
        const resp = await apiRequest(
          "/certificates",
          "GET",
          null,
          getAuthToken()
        );
        if (Array.isArray(resp)) {
          setCerts(resp);
        } else if (resp && Array.isArray(resp.certificates)) {
          setCerts(resp.certificates);
        } else {
          setCerts([]);
        }
      } catch {
        setErr("Failed to load certificates");
        setCerts([]);
      }
      setLoading(false);
    }
    fetchCerts();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="container" style={{ maxWidth: 480, margin: "32px auto" }}>
      <h2>{t("download_certificate")}</h2>
      <p>
        Issued police certificates cannot be downloaded online at this time.<br />
        Please collect your certificate in person at the police station.
      </p>
      {err && <div style={{ color: "#ce2b28", marginBottom: 10 }}>{err}</div>}
      {loading ? (
        <div>{t("loading")}</div>
      ) : certs.length > 0 ? (
        <ul>
          {certs.map((c, idx) => (
            <li key={c.id || idx} style={{ marginBottom: 12 }}>
              {c.file_name || c.name || `Certificate #${c.id || idx + 1}`}
              <span style={{ marginLeft: 10, color: "#1976D2", fontStyle: "italic" }}>
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
