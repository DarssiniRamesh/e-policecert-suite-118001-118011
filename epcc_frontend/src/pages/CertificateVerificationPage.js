import React, { useState } from "react";
import { useLang } from "../i18n";
import { apiRequest, getAuthToken } from "../api";

/**
 * Certificate Verification Page
 * Allows public or admin users to check certificate validity by reference number.
 * - Admins see extra metadata (user/channel, date, detail, revoked/reason) if logged in.
 * - Public: result = valid/invalid/revoked & summary details.
 * Styling matches navy government/accessible aesthetic.
 */
export default function CertificateVerificationPage() {
  const { t } = useLang();
  const [ref, setRef] = useState("");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // Quick check for admin JWT (real app: check user context/profile)
  const isAdmin = !!getAuthToken();

  // Handler for form submission
  async function handleSubmit(e) {
    e.preventDefault();
    setResult(null);
    setErr("");
    if (!ref.trim()) {
      setErr("Please enter a certificate reference number.");
      return;
    }
    setLoading(true);
    try {
      // Try GET /certificates/verify/{ref} (preferred); fallback: /certificates/verify?ref=
      let data;
      try {
        data = await apiRequest(`/certificates/verify/${encodeURIComponent(ref)}`, "GET", null, isAdmin ? getAuthToken() : null);
      } catch {
        data = await apiRequest(`/certificates/verify?ref=${encodeURIComponent(ref)}`, "GET", null, isAdmin ? getAuthToken() : null);
      }
      setResult(data);
      setErr("");
    } catch (e) {
      setResult(null);
      if (e && e.detail) setErr(e.detail);
      else if (e && e.error) setErr(e.error);
      else setErr("Certificate not found or verification failed.");
    }
    setLoading(false);
  }

  // Helper: Status badge styling
  function statusBadge(status) {
    let color = "#888";
    if (!status) status = "";
    const st = status.toString().toLowerCase();
    if (st === "valid" || st === "active" || st === "issued") color = "#43a047";
    if (st === "revoked" || st === "invalid") color = "#ce2b28";
    if (st === "pending") color = "#1976d2";
    return (
      <span style={{
        background: color,
        color: "#fff",
        padding: "3px 16px",
        borderRadius: 15,
        marginLeft: 3,
        fontWeight: 700,
        fontSize: 15,
        textTransform: "capitalize"
      }}>{status}</span>
    );
  }

  // Core UI rendering
  return (
    <div className="container" style={{ margin: "32px auto", maxWidth: 455 }}>
      <h2 style={{ color: "#1E2A38", fontWeight: "bold", marginBottom: 8 }}>
        Verify Police Certificate
      </h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 22 }}>
        <label htmlFor="cert-ref-input" style={{ color: "#1976D2", fontWeight: 600 }}>
          Certificate Reference / Serial Number:
        </label>
        <input
          id="cert-ref-input"
          value={ref}
          onChange={e => setRef(e.target.value)}
          placeholder="Enter certificate reference number"
          autoFocus
          style={{ margin: "8px 0 16px 0", fontSize: 16 }}
        />
        <button className="theme-toggle" type="submit" style={{ width: "100%" }} disabled={loading}>
          {loading ? t("loading") : "Verify Certificate"}
        </button>
      </form>
      {err && <div style={{ color: "#ce2b28", fontWeight: 600, marginBottom: 12 }}>{err}</div>}
      {result && (
        <div style={{
          marginTop: 18,
          padding: 22,
          borderRadius: 12,
          background: "#fff",
          border: "2px solid #e3e8ef",
          boxShadow: "0 1px 9px #1e2a381c"
        }}>
          <div style={{
            fontWeight: "bold",
            color: "#1E2A38",
            fontSize: 18,
            marginBottom: 6
          }}>
            Certificate Status: {statusBadge(result.status || result.valid_status || result.state)}
          </div>
          <div style={{ margin: "7px 0", color: "#1976d2", fontWeight: 600 }}>
            Reference: <span style={{ color: "#1E2A38" }}>{result.reference || result.id || result.ref_no || ref}</span>
          </div>
          {(result.status === "revoked" || result.revoked) && (
            <div style={{ color: "#ce2b28", fontWeight: 600, margin: "4px 0" }}>
              Revoked Reason: {result.revoked_reason || result.reason || "Revoked"}
            </div>
          )}
          <div style={{ marginBottom: 7 }}>
            {result.issued_to && (
              <span>
                Issued To:&nbsp;<b>{result.issued_to}</b><br />
              </span>
            )}
            {result.issued_date && (
              <span>
                Issued Date:&nbsp;<b>{(new Date(result.issued_date)).toLocaleDateString()}</b><br />
              </span>
            )}
            {result.valid_until && (
              <span>
                Valid Until:&nbsp;<b>{(new Date(result.valid_until)).toLocaleDateString()}</b><br />
              </span>
            )}
            {result.type && (
              <span>
                Type:&nbsp;<b>{result.type}</b>
              </span>
            )}
          </div>

          {/* Admin details, only if admin is logged in */}
          {isAdmin && (
            <div style={{
              borderTop: "1px dashed #e3e8ef",
              marginTop: 10,
              paddingTop: 9,
              fontSize: 15,
              color: "#333"
            }}>
              <div><b>Record ID:</b> {result.id}</div>
              {result.created_by && <div><b>Issued by:</b> {result.created_by}</div>}
              {result.created_at && (
                <div>
                  <b>Created:</b>{" "}
                  {new Date(result.created_at).toLocaleString()}
                </div>
              )}
              {result.revoked_at && (
                <div>
                  <b>Revoked At:</b>{" "}
                  {new Date(result.revoked_at).toLocaleString()}
                </div>
              )}
              {result.detail && (
                <div>
                  <b>Extra Detail:</b> {result.detail}
                </div>
              )}
              <div style={{ marginTop: 7, fontSize: 13, color: "#888" }}>
                (Admin view: full audit details visible)
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
