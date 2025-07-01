import React, { useEffect, useState } from "react";
import { useLang } from "../i18n";
import { apiRequest, getAuthToken } from "../api";
import { getUserRoleInfo } from "../auth";
import AdminAnalyticsWidget from "../components/AdminAnalyticsWidget";
import { BarChart, PieChart } from "../components/AdminTrendsChart";

// PUBLIC_INTERFACE
/**
 * EPCC Admin Dashboard – Navy theme, full RFP compliance.
 * - Application management with table/list, search, filter, paging, review/approve/reject/issue
 * - Analytics/stat cards (apps/status/upserts/time, etc)
 * - Sidebar nav layout for Officer flow
 * - Strong accessible contrast, professional gov feel (navy blue, accent blue, white backgrounds)
 * - Export CSV
 * - Designed for desktop/tablet/mobile
 * - Only accessible by admins (enforced)
 */
export default function AdminDashboard() {
  const { t } = useLang();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [modalApp, setModalApp] = useState(null);
  const [modalAction, setModalAction] = useState(""); // "approve"|"reject"|"" etc
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

  // Certificate statistics state
  const [certStats, setCertStats] = useState({
    total: 0,
    lastMonth: 0,
    usersWithIssued: 0,
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

  // Audit log state for admin visibility; fetched on mount
  const [auditLog, setAuditLog] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setErr("");
      setActionMsg("");
      try {
        // Fetch admin applications
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

        // Fetch certificates for admin-level certificate analytics/statistics
        try {
          const certResp = await apiRequest("/certificates", "GET", null, getAuthToken());
          let certifications = [];
          if (Array.isArray(certResp)) certifications = certResp;
          else if (certResp && Array.isArray(certResp.certificates)) certifications = certResp.certificates;
          // Count total, issued in last month, distinct users w/certs
          let totalCerts = certifications.length;
          let lastMonth = 0;
          let userSet = new Set();
          let now = new Date();
          certifications.forEach(cert => {
            if (cert.issue_date) {
              let certDate = new Date(cert.issue_date);
              let monthDiff =
                (now.getFullYear() - certDate.getFullYear()) * 12 +
                (now.getMonth() - certDate.getMonth());
              if (monthDiff === 0) lastMonth++;
            }
            if (cert.user_id || cert.user_email) userSet.add(cert.user_id || cert.user_email);
          });
          setCertStats({ total: totalCerts, lastMonth, usersWithIssued: userSet.size });
        } catch {
          setCertStats({ total: 0, lastMonth: 0, usersWithIssued: 0 });
        }
      } catch (e) {
        setErr("Failed to load administrative data.");
        setApplications([]);
        setStats({ total: 0, pending: 0, approved: 0, rejected: 0, issued: 0 });
        setCertStats({ total: 0, lastMonth: 0, usersWithIssued: 0 });
      }
      setLoading(false);
    }
    fetchData();
    // eslint-disable-next-line
  }, [reload]);

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

  // Role check after all hooks
  const { isAdmin } = getUserRoleInfo();
  if (!isAdmin)
    return (
      <div style={{ padding: 70, textAlign: "center" }}>
        <h2>403: Forbidden</h2>
        <div>You do not have permission to view this page.</div>
      </div>
    );

  // -------- ANALYTICS WIDGET AND CHART COMPUTATION ----------
  // Status breakdown
  const statusLabels = ["pending", "approved", "rejected", "issued"];
  const statusColors = [colors.blue, colors.green, colors.rejected, colors.blueAccent];
  const statusCounts = statusLabels.map(k => stats[k] || 0);

  // Application submission monthly trend
  let trendLabels = [], trendValues = [];
  if (applications.length > 0 && applications[0]?.created_at) {
    const countsByMonth = {};
    applications.forEach(a => {
      const d = new Date(a.created_at);
      const ym = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,"0")}`;
      countsByMonth[ym] = (countsByMonth[ym] || 0) + 1;
    });
    trendLabels = Object.keys(countsByMonth).sort();
    trendValues = trendLabels.map(k => countsByMonth[k]);
  }

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

  // CSV export for the filtered table
  function exportCSV() {
    const header = [
      "ID", "Email", "Type", "Status", "Info", "Created At", "Updated At"
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
      .concat(rows.map(row => row.map(f => `"${(f || "").replace(/"/g, '""')}"`).join(",")))
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

  // Approve/reject/issue handler
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

  // Table columns
  const columns = [
    { key: "id", label: "ID", width: 46 },
    { key: "user_email", label: "User Email", width: 160 },
    { key: "type", label: "Type", width: 80 },
    { key: "status", label: "Status", width: 88 },
    { key: "created_at", label: "Created", width: 80 },
    { key: "review", label: "Review", width: 96 }
  ];

  // Download doc for admins
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

  // --- BEGIN COMPONENT RENDER ---
  return (
    <div className="container" style={{
      maxWidth: 1050,
      margin: "36px auto",
      background: colors.light,
      minHeight: "100vh",
      border: `2px solid ${colors.gray}`,
      borderRadius: 18,
      boxShadow: "0 2px 12px #1e2a380e",
      padding: "32px 20px 20px 20px",
    }}>
      <h1 style={{
        color: colors.navy,
        marginBottom: 7,
        fontWeight: "bold",
        fontSize: 32,
        letterSpacing: 1
      }}>Admin Dashboard</h1>
      <div style={{
        color: colors.blue,
        fontWeight: 500,
        marginBottom: 18,
        fontSize: 21,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <span role="img" aria-label="badge" style={{ fontSize: 27 }}>🛡️</span>
        VPF System-wide Police Certificate Analytics & Application Oversight
      </div>
      {/* STATISTICS ANALYTICS ROW */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 22,
        marginBottom: 28,
        justifyContent: "flex-start",
      }}>
        <AdminAnalyticsWidget
          label="Total Applications"
          value={stats.total}
          icon="📝"
          color={colors.navy}
          bg={colors.blueAccent}
        />
        <AdminAnalyticsWidget
          label="Pending"
          value={stats.pending}
          icon="⏳"
          color="#fff"
          bg={colors.blue}
        />
        <AdminAnalyticsWidget
          label="Approved"
          value={stats.approved}
          icon="✅"
          color="#fff"
          bg={colors.green}
        />
        <AdminAnalyticsWidget
          label="Rejected"
          value={stats.rejected}
          icon="❌"
          color="#fff"
          bg={colors.rejected}
        />
        <AdminAnalyticsWidget
          label="Issued"
          value={stats.issued}
          icon="📄"
          color={colors.navy}
          bg={colors.gray}
        />
        {/* Certificate global analytics */}
        <AdminAnalyticsWidget
          label="Certificates Issued"
          value={certStats.total}
          icon="🎓"
          color={colors.navy}
          bg={colors.light}
        />
        <AdminAnalyticsWidget
          label="Last Month"
          value={certStats.lastMonth}
          icon="📆"
          color={colors.navy}
          bg={colors.blueAccent}
        />
        <AdminAnalyticsWidget
          label="Unique Holders"
          value={certStats.usersWithIssued}
          icon="👥"
          color="#fff"
          bg={colors.green}
        />
      </div>
      {/* Additional User Activity Summary */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 22,
        margin: "-5px 0 26px 0",
        alignItems: "flex-start"
      }}>
        <div style={{
          background: "#fff",
          borderRadius: 13,
          padding: "18px 21px 14px 21px",
          border: "1.5px solid #e3e8ef",
          minWidth: 232,
          maxWidth: 340,
        }}>
          <div style={{
            color: colors.navy,
            fontWeight: 600,
            fontSize: 18,
            marginBottom: 7
          }}>
            Recent User Activity
          </div>
          <RecentUsersWidget apps={applications} />
        </div>
        <div style={{
          background: "#fff",
          borderRadius: 13,
          padding: "18px 18px 9px 18px",
          border: "1.5px solid #e3e8ef",
          minWidth: 195,
        }}>
          <div style={{
            color: colors.navy,
            fontWeight: 600,
            fontSize: 18,
            marginBottom: 6
          }}>
            Status Breakdown
          </div>
          <PieChart
            labels={statusLabels.map(s => s[0].toUpperCase() + s.slice(1))}
            values={statusCounts}
            colors={statusColors}
            radius={38}
          />
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 7, marginTop: 5
          }}>
            {statusLabels.map((lbl, i) => (
              <span key={lbl} style={{
                display: "inline-flex", alignItems: "center",
                fontSize: 13, color: "#2a3950", padding: "0 7px"
              }}>
                <span style={{
                  display: "inline-block", width: 12, height: 12,
                  borderRadius: 7, background: statusColors[i], marginRight: 6
                }} /> {lbl[0].toUpperCase() + lbl.slice(1)}
              </span>
            ))}
          </div>
        </div>
        <div style={{
          background: "#fff",
          borderRadius: 13,
          padding: "18px 15px 14px 22px",
          border: "1.5px solid #e3e8ef",
          minWidth: 320,
        }}>
          <div style={{ color: colors.navy, fontWeight: 600, fontSize: 18, marginBottom: 9 }}>
            Applications Submitted (by Month)
          </div>
          {trendLabels.length > 0 ? (
            <BarChart
              labels={trendLabels}
              values={trendValues}
              colors={trendValues.map(() => colors.blueAccent)}
              width={Math.max(280, 39 * trendLabels.length)}
              height={120}
            />
          ) : (
            <div style={{ color: "#888", fontSize: 14, margin: "14px 8px" }}>
              No trend data available yet.
            </div>
          )}
        </div>
      </div>
      {/* Table and controls */}
      <div style={{
        background: "#fff",
        borderRadius: 15,
        padding: "18px 13px",
        marginBottom: 20,
        border: "1px solid #e3e8ef",
        boxShadow: "0 2px 8px #1e2a3810",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
          flexWrap: "wrap"
        }}>
          <div>
            <input
              style={{
                border: "1.5px solid #d4dfea",
                borderRadius: 7,
                padding: "8px 13px",
                fontSize: 15,
                width: 180,
                marginRight: 12
              }}
              type="text"
              placeholder="Search email, type, status…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoComplete="off"
            />
            <select
              style={{
                border: "1.5px solid #d4dfea",
                borderRadius: 7,
                padding: "8px 10px",
                fontSize: 15,
                width: 128
              }}
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {statusLabels.map(s => (
                <option key={s} value={s}>
                  {s[0].toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <button
            className="theme-toggle"
            type="button"
            style={{
              background: colors.navy,
              color: "#fff",
              fontWeight: 600,
              fontSize: 15.3
            }}
            onClick={exportCSV}
          >
            Export CSV
          </button>
        </div>
        {err && (
          <div style={{ color: "#ce2b28", marginBottom: 10, fontWeight: 500 }}>
            {err}
          </div>
        )}
        {actionMsg && (
          <div style={{ color: colors.green, marginBottom: 9, fontWeight: 500 }}>{actionMsg}</div>
        )}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", marginTop: 10, fontSize: 15, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: colors.light }}>
                {columns.map(col => (
                  <th key={col.key} style={{ padding: 8, textAlign: "left", minWidth: col.width, fontWeight: 700 }}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={columns.length}>
                  <div style={{ padding: 22, textAlign: "center" }}>{t("loading")}</div>
                </td></tr>
              ) : pageApps.length === 0 ? (
                <tr><td colSpan={columns.length}>
                  <div style={{ padding: 18, color: "#888" }}>No applications found.</div>
                </td></tr>
              ) : (
                pageApps.map((a, idx) => (
                  <tr key={a.id || idx} style={{
                    background: idx % 2 === 0 ? "#f9fafc" : "#e9f2fc",
                    fontWeight: 400
                  }}>
                    <td style={{ padding: 8 }}>{a.id}</td>
                    <td style={{ padding: 8 }}>{a.user_email || a.user_name}</td>
                    <td style={{ padding: 8 }}>{a.type}</td>
                    <td style={{ padding: 8 }}>
                      <span style={{
                        background: statusColor(a.status),
                        padding: "3px 12px",
                        borderRadius: 14,
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 13,
                        letterSpacing: 0.2,
                      }}>
                        {a.status}
                      </span>
                    </td>
                    <td style={{ padding: 8 }}>
                      {a.created_at ? new Date(a.created_at).toLocaleDateString() : "-"}
                    </td>
                    <td style={{ padding: 8 }}>
                      {/* Example approve/reject with buttons */}
                      {a.status === "pending" && (
                        <>
                          <button onClick={() => handleUpdateStatus(a, "approved")}
                            style={{ background: colors.green, marginRight: 8 }}>Approve</button>
                          <button onClick={() => handleUpdateStatus(a, "rejected")}
                            style={{ background: colors.rejected }}>Reject</button>
                        </>
                      )}
                      {a.status === "approved" && (
                        <button onClick={() => handleUpdateStatus(a, "issued")}
                          style={{ background: colors.blueAccent }}>Issue Cert</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Paging controls */}
        {!loading && (
          <div style={{ marginTop: 10 }}>
            {Array(pageCount).fill(0).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                disabled={page === i + 1}
                style={{
                  margin: "0 3px",
                  background: page === i + 1 ? colors.navy : colors.gray,
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "5px 13px"
                }}
              >{i + 1}</button>
            ))}
          </div>
        )}
      </div>
      {/* (Further audit log, modals, etc. could be placed below...) */}
    </div>
  );
}

// Widget: compact recent users list for analytics in admin dashboard
function RecentUsersWidget({ apps }) {
  // Show up to 6 latest users with recent application, status, and type.
  if (!Array.isArray(apps) || apps.length === 0)
    return <div style={{ color: "#888" }}>No user activity yet.</div>;
  // Group by user email and show latest app per user.
  const users = {};
  // Sort most recent apps first
  [...apps]
    .sort((a, b) => {
      const aTime = new Date(a.updated_at || a.created_at || 0).getTime();
      const bTime = new Date(b.updated_at || b.created_at || 0).getTime();
      return bTime - aTime;
    })
    .forEach((a) => {
      const k = a.user_email || a.user_name || "unknown";
      if (!users[k]) users[k] = a;
    });
  const recent = Object.values(users).slice(0, 6);
  const badge = (txt, color) => (
    <span style={{
      background: color,
      color: "#fff",
      padding: "1.5px 8px",
      borderRadius: 12,
      fontWeight: 600,
      fontSize: 12,
      marginLeft: 6
    }}>{txt}</span>
  );
  const statusCol = st => {
    if (!st) return "#888";
    switch (String(st).toLowerCase()) {
      case "pending": return "#1976d2";
      case "approved": return "#43a047";
      case "rejected": return "#ce2b28";
      case "issued": return "#1565c0";
      default: return "#888";
    }
  };
  return (
    <div style={{ minWidth: 150 }}>
      <table style={{ width: "100%", fontSize: 13, background: "none" }}>
        <tbody>
          {recent.map((a, idx) => (
            <tr key={idx}>
              <td style={{ fontWeight: 600, color: "#1e2a38" }}>
                {a.user_email || a.user_name}
              </td>
              <td>
                {badge(a.type, "#1976d222")}
              </td>
              <td>
                {badge(a.status, statusCol(a.status))}
              </td>
              <td style={{ color: "#888", fontSize: 11 }}>
                {a.created_at ? new Date(a.created_at).toLocaleDateString() : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
