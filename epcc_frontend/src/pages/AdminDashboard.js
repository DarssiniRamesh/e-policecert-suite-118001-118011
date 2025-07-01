import React, { useEffect, useState } from "react";
import { useLang } from "../i18n";
import { apiRequest, getAuthToken } from "../api";

// PUBLIC_INTERFACE
/**
 * EPCC Admin Dashboard – Navy theme, full RFP compliance.
 * - Application management with table/list, search, filter, paging, review/approve/reject/issue
 * - Analytics/stat cards (apps/status/upserts/time, etc)
 * - Sidebar nav layout for Officer flow
 * - Strong accessible contrast, professional gov feel (navy blue, accent blue, white backgrounds)
 * - Export CSV
 * - Designed for desktop/tablet/mobile
 */
export default function AdminDashboard() {
  const { t } = useLang();
  // Data state
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [modalApp, setModalApp] = useState(null);
  const [modalAction, setModalAction] = useState(""); // "approve"|"reject"|""
  const [actionMsg, setActionMsg] = useState("");
  const [reload, setReload] = useState(0);

  // Filtering, search, paging
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 12;

  // Analytics
  const [stats, setStats] = useState({
    total: 0, pending: 0, approved: 0, rejected: 0, issued: 0,
  });

  const colors = {
    navy: "#1E2A38",
    blue: "#1976D2",
    blueAccent: "#1E88E5",
    green: "#43A047",
    gray: "#e3e8ef",
    light: "#f9fafc",
    white: "#fff",
    rejected: "#ce2b28"
  };

  // Mount/fetch effect
  useEffect(() => {
    async function fetchData() {
      setLoading(true); setErr(""); setActionMsg("");
      try {
        const resp = await apiRequest("/admin/applications", "GET", null, getAuthToken());
        const apps = Array.isArray(resp) ? resp : (resp.applications || []);
        setApplications(apps);

        // gather status breakdown
        const agg = { total: apps.length, pending: 0, approved: 0, rejected: 0, issued: 0 };
        apps.forEach(a => {
          const st = (a.status || "").toLowerCase();
          if (st in agg) agg[st]++;
          else agg[st] = 1;
        });
        setStats(agg);
      } catch (e) {
        setErr("Failed to load administrative data.");
        setApplications([]);
        setStats({ total: 0, pending: 0, approved: 0, rejected: 0, issued: 0 });
      }
      setLoading(false);
    }
    fetchData();
    // eslint-disable-next-line
  }, [reload]);

  // Table search/filter/page
  let filtered = applications;
  if (status)
    filtered = filtered.filter(a => (a.status || "").toLowerCase() === status.toLowerCase());
  if (search)
    filtered = filtered.filter(a =>
      [a.id, a.user_email, a.user_name, a.type, a.info]
        .map(x => (x || "").toLowerCase())
        .some(val => val.includes(search.toLowerCase()))
    );
  const pageCount = Math.ceil(filtered.length / rowsPerPage);
  const pageApps = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // CSV export
  function exportCSV() {
    const header = [
      "ID","Email","Type","Status","Info","Created At","Updated At"
    ];
    const rows = filtered.map(a => [
      a.id,
      a.user_email || a.user_name,
      a.type,
      a.status,
      (typeof a.info === "string" ? a.info : JSON.stringify(a.info || "")),
      a.created_at,
      a.updated_at
    ]);
    const csv = [header.join(",")]
      .concat(rows.map(row => row.map(f => `"${(f||"").replace(/"/g, '""')}"`).join(",")))
      .join("\r\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "admin_applications.csv";
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setActionMsg("Exported as CSV!");
  }

  // App status/row color
  function statusColor(s) {
    switch ((s || "").toLowerCase()) {
      case "pending": return colors.blue;
      case "approved": return colors.green;
      case "rejected": return colors.rejected;
      case "issued": return colors.blueAccent;
      default: return "#999";
    }
  }

  // Approve/reject/issue (PATCH admin/applications/:id)
  async function handleUpdateStatus(app, newStatus) {
    setActionMsg(""); setModalAction(""); setLoading(true);
    try {
      await apiRequest(`/admin/applications/${app.id}`, "PATCH", { status: newStatus }, getAuthToken());
      setActionMsg(`Application ${newStatus}`);
      setReload(v => v + 1);
    } catch {
      setActionMsg("Failed. Try again.");
    }
    setLoading(false);
    setModalApp(null);
  }

  // Table head configuration
  const columns = [
    { key: "id", label: "ID", width: 46 },
    { key: "user_email", label: "User Email", width: 160 },
    { key: "type", label: "Type", width: 80 },
    { key: "status", label: "Status", width: 88 },
    { key: "created_at", label: "Created", width: 80 },
    { key: "review", label: "Review", width: 96 }
  ];

  // Audit log state for admin visibility; fetched on mount
  const [auditLog, setAuditLog] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    async function fetchAudit() {
      setAuditLoading(true);
      try {
        let resp = [];
        try {
          // Try known auditlog endpoints
          resp = await apiRequest("/admin/auditlog", "GET", null, getAuthToken());
          setAuditLog(Array.isArray(resp) ? resp : (resp.auditlog || []));
        } catch {
          setAuditLog([]);
        }
      } catch { setAuditLog([]); }
      setAuditLoading(false);
    }
    fetchAudit();
    // eslint-disable-next-line
  }, [reload]);

  // Download button for documents (admin) — fetches file from backend and triggers download
  async function handleDownloadDocument(docId, fileName) {
    try {
      const token = getAuthToken();
      const resp = await fetch(
        `https://vscode-internal-74-beta.beta01.cloud.kavia.ai:3001/documents/download/${encodeURIComponent(fileName)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "document";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      alert("Failed to download document.");
    }
  }

  // Helper for review modal: fetch document and certificate info for application
  // Optionally, expects modalApp.documents and modalApp.certificates from backend
  // For now, use placeholder/fake logic

  // Render
  return (
    <div
      style={{
        padding: "30px 0 30px 0",
        background: colors.light,
        minHeight: "90vh",
        minWidth: 330,
      }}
    >
      <section
        style={{
          background: colors.white,
          boxShadow: "0 2px 12px #1E2A380A",
          borderRadius: 16,
          maxWidth: 1150,
          margin: "22px auto",
          padding: "32px 18px 20px 18px",
          border: `2px solid ${colors.gray}`,
        }}
      >
        {/* Header & CSV Export */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 16
        }}>
          <h1 style={{
            color: colors.navy,
            fontWeight: "bold",
            fontSize: 30,
            letterSpacing: 1,
            margin: 0,
          }}>{t("adminDashboard")}</h1>
          <button
            className="theme-toggle"
            onClick={exportCSV}
            disabled={loading || !filtered.length}
            style={{
              fontWeight: 600,
              background: colors.navy,
              color: "#fff",
              marginLeft: "auto"
            }}
          >Export CSV</button>
        </div>

        {/* Analytics widgets/widgets row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 18,
            marginBottom: 24,
            justifyContent: "flex-start",
          }}
        >
          <AdminStatCard label="Total Applications" value={stats.total} color={colors.navy} bg={colors.blueAccent} icon="📝"/>
          <AdminStatCard label="Pending" value={stats.pending} color="#fff" bg={colors.blue} icon="⏳"/>
          <AdminStatCard label="Approved" value={stats.approved} color="#fff" bg={colors.green} icon="✅"/>
          <AdminStatCard label="Rejected" value={stats.rejected} color="#fff" bg={colors.rejected} icon="❌"/>
          <AdminStatCard label="Issued" value={stats.issued} color="#fff" bg={colors.navy} icon="📄"/>
        </div>
        {/* Filters/search row */}
        <div style={{
          display: "flex", gap: 10, marginBottom: 13, flexWrap: "wrap", alignItems: "center"
        }}>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search ID, user, type, info…"
            style={{
              minWidth: 180, fontSize: 15, padding: "7px 10px",
              borderRadius: 7, border: `1px solid ${colors.gray}`,
              background: "#fff", color: colors.navy
            }}
            aria-label="Search (ID, user, info, etc.)"
          />
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            aria-label="Filter by status"
            style={{
              minWidth: 128, fontSize: 15, borderRadius: 7,
              border: `1px solid ${colors.gray}`, padding: "7px 10px",
              background: "#fff", color: colors.navy
            }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="issued">Issued</option>
          </select>
          <span style={{ color: "#8c8c8c", fontSize: 13 }}>
            Showing {filtered.length} of {applications.length}
          </span>
        </div>

        {/* Table/loader */}
        <div style={{
          border: `1.5px solid ${colors.gray}`,
          background: "#fff",
          borderRadius: 12,
          overflowX: "auto",
          marginBottom: 14,
        }}>
          {err &&
            (<div style={{ color: colors.rejected, margin: 12, fontWeight: 500 }}>{err}</div>)
          }
          {loading ? (
            <div style={{
              fontSize: 16,
              fontWeight: 600,
              color: colors.navy,
              padding: 32,
              textAlign: "center"
            }}>{t("loading")}</div>
          ) : (
            <table style={{ width: "100%", fontSize: 15, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{
                  background: colors.light,
                  color: colors.navy,
                  fontWeight: 700, fontSize: 16,
                  borderBottom: `2px solid ${colors.gray}`
                }}>
                  {columns.map(col =>
                    <th key={col.key} style={{ padding: "8px 5px", minWidth: col.width }}>
                      {col.label}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {pageApps.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} style={{ padding: "22px 0", color: "#888", textAlign: "center" }}>
                      No applications found. Search/modify filters.
                    </td>
                  </tr>
                ) : pageApps.map((a, idx) => (
                  <tr key={a.id || idx} style={{
                    background: idx % 2 === 0 ? "#f9fafc" : "#e9f2fc"
                  }}>
                    <td style={{ padding: "8px 5px" }}>{a.id}</td>
                    <td style={{ padding: "8px 5px" }}>{a.user_email || a.user_name || "N/A"}</td>
                    <td style={{ padding: "8px 5px" }}>{a.type}</td>
                    <td style={{ padding: "8px 5px" }}>
                      <span style={{
                        background: statusColor(a.status),
                        color: "#fff",
                        padding: "2px 13px",
                        borderRadius: 14,
                        fontWeight: 700,
                        fontSize: 13,
                        letterSpacing: 0.14,
                        textTransform: "capitalize"
                      }}>{a.status}</span>
                    </td>
                    <td style={{ padding: "8px 5px" }}>
                      {a.created_at ?
                        new Date(a.created_at).toLocaleDateString() : "-"}
                    </td>
                    <td style={{ padding: "8px 5px" }}>
                      <button
                        className="theme-toggle"
                        style={{
                          background: colors.blue,
                          color: "#fff", border: 0, borderRadius: 6,
                          padding: "6px 14px", fontWeight: 600, fontSize: 15
                        }}
                        onClick={() => { setModalApp(a); setModalAction(""); }}
                        aria-label={`Review/act on #${a.id}`}
                      >Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paging controls */}
        {pageCount > 1 &&
          <div style={{
            display: "flex", gap: 3, justifyContent: "center", margin: "12px 0"
          }}>
            {[...Array(pageCount)].map((_, i) =>
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                style={{
                  padding: "3px 11px",
                  margin: "0 1px",
                  background: page === i + 1 ? colors.blue : colors.gray,
                  color: page === i + 1 ? "#fff" : colors.navy,
                  border: 0,
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 14
                }}
                aria-label={`Page ${i + 1}`}
              >{i + 1}</button>
            )}
          </div>
        }

        {/* Review modal */}
        {modalApp && (
          <div
            tabIndex={-1}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: "100vw",
              height: "100vh",
              background: "#2229b633",
              zIndex: 1111,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            aria-modal="true"
            role="dialog"
            onClick={e => { if (e.target === e.currentTarget) setModalApp(null); }}
          >
            <div style={{
              background: "#fff",
              minWidth: 290, maxWidth: 490,
              padding: 24,
              borderRadius: 15,
              boxShadow: "0 12px 36px #19356442"
            }}>
              <h3 style={{
                color: colors.navy,
                fontWeight: "bold",
                marginBottom: 8
              }}>
                Application #{modalApp.id}
              </h3>
              <div style={{ marginBottom: 3 }}>
                <b>User: </b>{modalApp.user_email || modalApp.user_name || "?"}
              </div>
              <div style={{ marginBottom: 3 }}>
                <b>Status:</b>{" "}
                <span style={{
                  background: statusColor(modalApp.status),
                  color: "#fff",
                  padding: "1px 10px",
                  borderRadius: 11,
                  fontWeight: 700,
                  fontSize: 14,
                }}>{modalApp.status}</span>
              </div>
              <div style={{ marginBottom: 3 }}>
                <b>Type:</b> {modalApp.type}
              </div>
              <div style={{ marginBottom: 5 }}>
                <b>Info:</b>{" "}
                <span style={{ color: "#1e2a38cd", wordBreak: "break-word" }}>
                  {typeof modalApp.info === "string"
                    ? modalApp.info
                    : JSON.stringify(modalApp.info || "-")}
                </span>
              </div>

              {/* Document download / audit section */}
              <div style={{ marginTop: 12, marginBottom: 8, borderTop: "1px solid #e3e8ef", paddingTop: 8 }}>
                <b>Documents Submitted/Audited:</b><br />
                <span style={{ fontSize: 13, color: "#555" }}>
                  {/* Placeholder: link to download (if API/filename known), else N/A */}
                  {(modalApp.documents && Array.isArray(modalApp.documents) && modalApp.documents.length > 0) ? (
                    modalApp.documents.map(doc =>
                      <span key={doc.id || doc.file_name} style={{ marginRight: 9 }}>
                        <button style={{
                          background: colors.blue,
                          color: "#fff",
                          border: 0, borderRadius: 6, padding: "2px 8px", fontSize: 14, cursor: "pointer"
                        }}
                          onClick={() => handleDownloadDocument(doc.id, doc.file_name)}
                        >Download</button> {doc.file_name}
                      </span>
                    )
                  ) : (
                    <span style={{ color: "#888" }}>No documents submitted/found.</span>
                  )}
                </span>
              </div>

              {/* Certificate issued download section */}
              <div style={{ marginBottom: 8 }}>
                <b>Certificate:</b>{" "}
                {(modalApp.status === "issued" && modalApp.certificate_file) ? (
                  <button style={{
                    background: colors.navy, color: "#fff",
                    border: 0, borderRadius: 6, padding: "3px 12px", fontWeight: 600, fontSize: 15
                  }}
                    onClick={() => handleDownloadDocument("cert", modalApp.certificate_file)}
                  >
                    Download Certificate
                  </button>
                ) : (
                  <span style={{ color: "#888" }}>Not issued</span>
                )}
              </div>

              <div style={{ marginTop: 15, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(modalApp.status === "pending") && (
                  <>
                    <button
                      className="theme-toggle"
                      style={{
                        background: colors.green, color: "#fff",
                        fontWeight: 700
                      }}
                      onClick={() => handleUpdateStatus(modalApp, "approved")}
                      disabled={loading}
                    >Approve</button>
                    <button
                      className="theme-toggle"
                      style={{
                        background: colors.rejected, color: "#fff",
                        fontWeight: 700
                      }}
                      onClick={() => handleUpdateStatus(modalApp, "rejected")}
                      disabled={loading}
                    >Reject</button>
                  </>
                )}
                {(modalApp.status === "approved") && (
                  <>
                    <button
                      className="theme-toggle"
                      style={{
                        background: colors.navy, color: "#fff", fontWeight: 700
                      }}
                      onClick={() => handleUpdateStatus(modalApp, "issued")}
                      disabled={loading}
                    >Mark as Issued</button>
                  </>
                )}
                <button
                  className="theme-toggle"
                  style={{
                    background: colors.gray, color: colors.navy,
                    fontWeight: 600, marginLeft: "auto"
                  }}
                  onClick={() => setModalApp(null)}
                >Close</button>
              </div>
              {actionMsg && <div
                style={{
                  marginTop: 10,
                  color: actionMsg.includes("Failed") ? colors.rejected : colors.green,
                  fontWeight: 600,
                  minHeight: 20
                }}>{actionMsg}</div>}
            </div>
          </div>
        )}

        {actionMsg && (
          <div style={{
            marginTop: 12,
            color: actionMsg.includes("Failed") ? colors.rejected : colors.green,
            fontWeight: 600,
            textAlign: "left",
          }}>{actionMsg}</div>
        )}

        {/* Export line/footer */}
        <div style={{
          textAlign: "right",
          fontSize: 13,
          color: "#888",
          marginTop: 19
        }}>
          Officers: Bulk export for audit/reporting (CSV). All actions are role-protected.
        </div>

        {/* AUDIT LOG TABLE (if any) */}
        <section style={{
          marginTop: 40,
          background: "#f9fafc",
          borderRadius: 14,
          padding: 18,
          border: "1.5px solid #e3e8ef"
        }}>
          <div style={{
            color: "#1E2A38", fontWeight: 700, fontSize: 18, marginBottom: 8
          }}>Document/Certificate Audit Log</div>
          {auditLoading ? (
            <div style={{ color: "#1976D2", fontWeight: 600 }}>Loading logs...</div>
          ) : auditLog.length === 0 ? (
            <div style={{ color: "#888" }}>No audit log entries found.</div>
          ) : (
            <table style={{ width: "100%", fontSize: 14, marginTop: 6 }}>
              <thead>
                <tr style={{
                  background: "#e3e8ef", color: "#1E2A38", fontWeight: 700
                }}>
                  <th style={{ padding: "5px" }}>Time</th>
                  <th style={{ padding: "5px" }}>Actor</th>
                  <th style={{ padding: "5px" }}>Action</th>
                  <th style={{ padding: "5px" }}>Target</th>
                  <th style={{ padding: "5px" }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.map((l, idx) => (
                  <tr key={l.id || idx}
                    style={{ background: idx % 2 === 0 ? "#fff" : "#f9fafc" }}>
                    <td style={{ padding: "5px" }}>
                      {l.timestamp ? new Date(l.timestamp).toLocaleString() : ""}
                    </td>
                    <td style={{ padding: "5px" }}>
                      {l.actor_email || l.actor_name || "-"}
                    </td>
                    <td style={{ padding: "5px" }}>{l.action}</td>
                    <td style={{ padding: "5px" }}>{l.target}</td>
                    <td style={{ padding: "5px" }}>{l.details || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </section>
    </div>
  );
}

// Stat card for analytics row
function AdminStatCard({ label, value, icon, color, bg }) {
  return (
    <div
      style={{
        flex: "0 1 146px",
        minWidth: 110,
        background: bg,
        color,
        borderRadius: 12,
        padding: "14px 11px",
        boxShadow: "0 2px 7px #1e2a3812",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontWeight: 700,
        fontSize: 16,
        marginBottom: 4
      }}
    >
      <span style={{ fontSize: 23, marginBottom: 5 }}>{icon}</span>
      <span style={{
        fontSize: 23,
        fontWeight: "bold",
        marginBottom: 1,
        lineHeight: 1.08 }}>{value}</span>
      <span style={{
        fontSize: 12,
        fontWeight: 700,
        color: "#fff9",
        textAlign: "center",
        letterSpacing: 0.08,
        textShadow: "0 1px 2px #0001"
      }}>{label}</span>
    </div>
  );
}
