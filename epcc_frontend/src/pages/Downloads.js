import React, { useEffect, useState } from "react";
import { useLang } from "../i18n";
import { apiRequest, getAuthToken } from "../api";

// PUBLIC_INTERFACE
/**
 * Certificate Downloads page: Fetches issued certificates but disables downloads since the endpoint doesn't exist in backend.
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
          {certs.map((c) => (
            <li key={c.id} style={{ marginBottom: 12 }}>
              {c.file_name || `Certificate #${c.id}`}
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
