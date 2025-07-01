import React, { useEffect, useState } from "react";
import { useLang } from "../i18n";
import { apiRequest, getAuthToken } from "../api";
import { Link } from "react-router-dom";

// PUBLIC_INTERFACE
/**
 * Shows user's applications, document upload status, certificate status, and links for uploading documents and downloading certificates.
 * Implements enhanced table with upload/certificate status indicators.
 */
export default function UserApplications() {
  const { t } = useLang();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docStatus, setDocStatus] = useState({});
  const [certStatus, setCertStatus] = useState({});

  // On mount, fetch user applications
  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true);
      try {
        const data = await apiRequest(
          "/applications",
          "GET",
          null,
          getAuthToken()
        );
        const apps = data.applications || [];
        setApplications(apps);

        // For each application, fetch document and certificate info if possible
        // Fake it here as "uploaded" or not - ideally API should have related docs metadata
        // Assume GET /certificates returns certificates array
        let certs = [];
        try {
          const certResp = await apiRequest("/certificates", "GET", null, getAuthToken());
          certs = Array.isArray(certResp)
            ? certResp
            : (certResp && Array.isArray(certResp.certificates)) ? certResp.certificates : [];
        } catch {
          certs = [];
        }
        // Map certified application ids
        const certByApp = {};
        certs.forEach((c) => {
          if (c.application_id) certByApp[c.application_id] = c;
        });
        setCertStatus(certByApp);

        // (Optional enhancement) - fetch document uploads if API exposes them
        // For frontend, just treat uploads as boolean from status or assume all "submitted"
        // Could use better logic if API exposes /documents?application_id= or similar
        const docObj = {};
        apps.forEach((app) => {
          docObj[app.id] = app.documents_uploaded ? "uploaded"
            : app.status === "pending" ? "not uploaded" : "unknown";
        });
        setDocStatus(docObj);
      } catch {
        setApplications([]);
        setDocStatus({});
        setCertStatus({});
      }
      setLoading(false);
    };
    fetchApps();
    // eslint-disable-next-line
  }, []);

  // Status badge styling
  const badge = (label, color) => (
    <span style={{
      background: color, color: "#fff", padding: "2px 10px", borderRadius: 12,
      fontWeight: 700, fontSize: 13, marginLeft: 7
    }}>{label}</span>
  );

  // Handlers for download (not implemented - navigates to Downloads page)
  // Assumes certificates cannot be downloaded directly here.

  return (
    <div className="container" style={{ maxWidth: 720, margin: "32px auto" }}>
      <h2>{t("certificate_history")}</h2>
      <div style={{ fontSize: 15, marginBottom: 10, color: "#1976D2" }}>
        Track your applications, see document and certificate status, and upload or collect documents as needed.
      </div>
      {loading ? (
        <div>{t("loading")}</div>
      ) : applications.length > 0 ? (
        <table style={{ width: "100%", margin: "18px 0" }}>
          <thead>
            <tr>
              <th>{t("application")}</th>
              <th>Type</th>
              <th>{t("status")}</th>
              <th>Upload Documents</th>
              <th>Certificate</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((a, idx) => {
              // Status/color
              let statusLabel = a.status || "-";
              let statusColor = "#888";
              switch ((a.status || "").toLowerCase()) {
                case "pending": statusColor = "#1976d2"; break;
                case "approved": statusColor = "#43a047"; break;
                case "issued": statusColor = "#1565c0"; break;
                case "rejected": statusColor = "#ce2b28"; break;
                default: statusColor = "#888";
              }
              // Doc status (fake: treat "not uploaded" unless issued/approved)
              let docVal = docStatus[a.id] || "unknown";
              let docColor = docVal === "uploaded" ? "#43a047" : "#888";
              if (a.status === "pending" || docVal === "not uploaded") docColor = "#e3e8ef";
              // Cert ready
              let cert = certStatus[a.id];
              let certReady = cert && (cert.status === "issued" || cert.status === "active" || a.status === "issued");
              let certColor = certReady ? "#1976d2" : "#ce2b28";
              return (
                <tr key={a.id || idx}>
                  <td>
                    {a.id}
                  </td>
                  <td>{a.type}</td>
                  <td>
                    {badge(statusLabel, statusColor)}
                  </td>
                  <td>
                    {/* Upload link always available if app is not issued/rejected */}
                    {["issued", "rejected"].includes((a.status || "").toLowerCase())
                      ? <span style={{ color: "#888" }}>N/A</span>
                      : (
                        <Link to="/upload" style={{ color: "#1976d2" }}>
                          Upload
                        </Link>
                      )
                    }
                    {" "}
                    {badge(docVal === "uploaded" ? "Uploaded" : "Not Yet", docColor)}
                  </td>
                  <td>
                    {certReady ? (
                      <>
                        <Link to="/downloads" style={{ color: "#1976d2" }}>
                          Download
                        </Link>
                        {badge("Ready", certColor)}
                      </>
                    ) : (
                      badge("Not Yet", "#888")
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div>{t("certificate_no_applications")}</div>
      )}
    </div>
  );
}
