import React, { useEffect, useState } from "react";
import { useLang } from "../i18n";
import { apiRequest, getAuthToken } from "../api";

/**
 * ADMIN DASHBOARD – Responsive, analytics-focused, navy blue themed.
 * - Applications analytics row (status metrics: pending, approved, rejected, issued, total)
 * - Applications table: filter/search by status/user/email/type
 * - Application review modal (approve/reject)
 * - Navy blue, modern gov theme, strong contrast & accessibility
 * - User list intentionally omitted (not available in backend)
 * - Responsive and accessible for all admin/officer use cases
 * - CSV export available for application data
 */
// PUBLIC_INTERFACE
export default function AdminDashboard() {
  const { t } = useLang();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionMsg, setActionMsg] = useState("");
  const [reload, setReload] = useState(0);

  // FILTER & SEARCH STATE
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  // Analytics state
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    issued: 0, // assuming 'issued' maybe in status
  });

  // Color palette – navy blue theme
  const colors = {
    navy: "#1E2A38",
    blue: "#1976D2",
    blueAccent: "#1E88E5",
    green: "#43A047",
    light: "#f9fafc",
    white: "#fff",
    gray: "#e3e8ef",
    rejected: "#ce2b28",
  };

  useEffect(() => {
    async function fetchData() {
      setErr(""); setLoading(true);
      try {
        const a = await apiRequest("/admin/applications", "GET", null, getAuthToken());
        const apps = a.applications || [];
        setApplications(apps);

        // Analytics calculation
        const s = { total: apps.length };
        for (const app of apps) {
          const st = app.status?.toLowerCase();
          if (s[st]) s[st]++; else s[st] = 1;
        }
        setStats({
          ...s,
          pending: s.pending || 0,
          approved: s.approved || 0,
          rejected: s.rejected || 0,
          issued: s.issued || 0,
        });

      } catch {
        setErr("Failed to load admin data");
        setApplications([]);
        setStats({ total: 0, pending: 0, approved: 0, rejected: 0, issued: 0 });
      }
      setLoading(false);
    }
    fetchData();
    // eslint-disable-next-line
  }, [reload]);

  // Approve/reject controls
  async function approveApp(appId, status) {
    setActionMsg(""); setLoading(true);
    try {
      await apiRequest(
        `/admin/applications/${appId}`,
        "PATCH",
        { status },
        getAuthToken()
      );
      setActionMsg("Updated!");
      setReload(v => v + 1);
      setSelectedApp(null);
    } catch {
      setActionMsg("Failed to update.");
    }
    setLoading(false);
  }

  // CSV Export for analytics/reporting
  function handleExportCSV() {
    const header = ["ID","User","Type","Status","Info","Created At","Updated At"];
    const rows = displayedApplications.map(
      (a) => [
        a.id || "",
        a.user_email || a.user_name || "",
        a.type || "",
        a.status || "",
        a.info ? (typeof a.info === "string" ? a.info : JSON.stringify(a.info)) : "",
        a.created_at || "",
        a.updated_at || "",
      ]
    );
    const csv = [
      header.join(","),
      ...rows.map(r => r.map(field => `"${(field+"").replace(/"/g, '""')}"`).join(",")),
    ].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "applications_export.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActionMsg("Exported as CSV!");
  }

  // Filtered and searched applications
  let displayedApplications = applications;
  if (statusFilter) {
    displayedApplications = displayedApplications.filter(a =>
      (a.status || "")
        .toLowerCase()
        .includes((statusFilter || "").toLowerCase())
    );
  }
  if (search) {
    displayedApplications = displayedApplications.filter(a =>
      [a.user_email, a.user_name, a.type, a.info, a.id]
        .map(x => (x || "").toString().toLowerCase())
        .some(field => field.includes(search.toLowerCase()))
    );
  }

  // Status color for analytics/stat chips
  function statusColor(status) {
    switch ((status || "").toLowerCase()) {
      case "pending": return colors.blue;
      case "approved": return colors.green;
      case "rejected": return colors.rejected;
      case "issued": return colors.blueAccent;
      default: return "#8a8a8a";
    }
  }

  return (
    <div
      className="container"
      style={{
        padding: "24px 8px",
        maxWidth: 1050,
        margin: "40px auto",
        background: colors.light,
        border: `2px solid ${colors.gray}`,
        borderRadius: 18,
        boxShadow: "0 2px 16px #1e2a3812",
      }}
    >
      {/* HEADER */}
      <div style={{
        display: "flex",
        alignItems: "baseline",
        gap: 20,
        marginBottom: 10,
        justifyContent: "space-between",
      }}>
        <h1 style={{
          color: colors.navy,
          marginBottom: 2,
          fontWeight: "bold",
          fontSize: 30,
          letterSpacing: 1,
        }}>
          {t("adminDashboard")}
        </h1>
        <button
          onClick={handleExportCSV}
          disabled={loading || !applications.length}
          className="theme-toggle"
          style={{
            fontSize: 15,
            fontWeight: 600,
            padding: "7px 18px",
            background: colors.blue,
            marginLeft: "auto",
            marginRight: 0,
          }}
        >
          📤 Export CSV
        </button>
      </div>
      <div style={{
        color: colors.blue,
        fontWeight: 500,
        marginBottom: 22,
        fontSize: 19,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <span role="img" aria-label="officer" style={{ fontSize: 27 }}>
          👮‍♂️
        </span>
        Administrative Analytics & Certificate Management Suite
      </div>
      {/* Analytics widgets row */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 15,
          marginBottom: 30,
          justifyContent: "flex-start",
        }}
      >
        <StatCard label="Total Applications" value={stats.total} color={colors.navy} bg={colors.blueAccent} icon="📝" />
        <StatCard label="Pending" value={stats.pending} color="#fff" bg={colors.blue} icon="⏳" />
        <StatCard label="Approved" value={stats.approved} color="#fff" bg={colors.green} icon="✅" />
        <StatCard label="Rejected" value={stats.rejected} color="#fff" bg={colors.rejected} icon="❌" />
        {stats.issued !== undefined && <StatCard label="Issued" value={stats.issued} color="#fff" bg={colors.navy} icon="📄" />}
      </div>
      {/* FILTERS & SEARCH */}
      <div style={{
        display: "flex",
        gap: 10,
        marginBottom: 10,
        flexWrap: "wrap",
        alignItems: "center",
      }}>
        <input
          type="search"
          aria-label="Search application, user or info"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search ID, email, type, more..."
          style={{
            minWidth: 180,
            fontSize: 15,
            padding: "7px 10px",
            borderRadius: 7,
            border: `1px solid ${colors.gray}`,
            background: "#fff",
            color: colors.navy,
          }}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
          style={{
            minWidth: 130,
            fontSize: 15,
            padding: "7px 10px",
            borderRadius: 7,
            border: `1px solid ${colors.gray}`,
            background: "#fff",
            color: colors.navy,
          }}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          {stats.issued !== undefined && <option value="issued">Issued</option>}
        </select>
        <span style={{ color: "#888", fontSize: 13 }}>
          Showing {displayedApplications.length} of {applications.length} records
        </span>
      </div>
      {/* MAIN APPLICATIONS TABLE */}
      <div style={{
        border: `1px solid ${colors.gray}`,
        borderRadius: 13,
        background: "#fff",
        overflow: "auto",
        marginBottom: 18,
        boxShadow: "0 2px 8px #1e2a3810",
      }}>
        {err && (
          <div style={{ color: colors.rejected, margin: 12, fontWeight: 500 }}>
            {err}
          </div>
        )}
        {loading ? (
          <div style={{
            fontSize: 17,
            textAlign: "center",
            padding: 32,
            color: colors.navy,
            fontWeight: 600,
          }}>
            {t("loading")}
          </div>
        ) : (
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 15,
          }}>
            <thead>
              <tr style={{
                background: colors.light,
                color: colors.navy,
                fontWeight: 800,
                fontSize: 16,
                borderBottom: `2px solid ${colors.gray}`
              }}>
                <th style={{ padding: "7px 4px" }}>ID</th>
                <th style={{ padding: "7px 4px" }}>User Email</th>
                <th style={{ padding: "7px 4px" }}>Type</th>
                <th style={{ padding: "7px 4px" }}>Status</th>
                <th style={{ padding: "7px 4px" }}>Submitted</th>
                <th style={{ padding: "7px 4px" }}>Review</th>
              </tr>
            </thead>
            <tbody>
              {displayedApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "22px 0", color: "#888", textAlign: "center" }}>
                    No applications found for search/filter.
                  </td>
                </tr>
              ) : (
                displayedApplications.map((a, idx) => (
                  <tr
                    key={a.id || idx}
                    style={{
                      background: idx % 2 === 0 ? "#f9fafc" : "#e9f2fc",
                      fontWeight: 400,
                    }}
                  >
                    <td style={{ padding: "7px 4px" }}>{a.id}</td>
                    <td style={{ padding: "7px 4px" }}>{a.user_email || a.user_name || "N/A"}</td>
                    <td style={{ padding: "7px 4px" }}>{a.type || "-"}</td>
                    <td style={{ padding: "7px 4px" }}>
                      <span
                        style={{
                          background: statusColor(a.status),
                          padding: "2px 11px",
                          borderRadius: 13,
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 14,
                          letterSpacing: 0.2,
                          textTransform: "capitalize"
                        }}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td style={{ padding: "7px 4px" }}>
                      {a.created_at
                        ? new Date(a.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td style={{ padding: "7px 4px" }}>
                      <button
                        onClick={() => setSelectedApp(a)}
                        style={{
                          background: colors.blue,
                          color: "#fff",
                          border: 0,
                          borderRadius: 7,
                          padding: "6px 14px",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                        aria-label={`Review application ${a.id}`}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      {selectedApp && (
        <div
          tabIndex={-1}
          style={{
            border: `2px solid ${colors.blueAccent}`,
            padding: 21,
            margin: "15px 0",
            background: "#eef5fc",
            borderRadius: 13,
            boxShadow: "0 3px 20px #1e2a3825",
            maxWidth: 530,
            marginLeft: "auto",
            marginRight: "auto",
            position: "relative"
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`Review application #${selectedApp.id}`}
        >
          <h3 style={{ color: colors.navy, fontWeight: "bold", marginBottom: 8 }}>
            Application #{selectedApp.id}
          </h3>
          <div style={{ margin: "7px 0" }}>
            <b>User:</b> {selectedApp.user_email || selectedApp.user_name || "N/A"}
          </div>
          <div style={{ margin: "7px 0" }}>
            <b>Status:</b>{" "}
            <span
              style={{
                background: statusColor(selectedApp.status),
                color: "#fff",
                padding: "2px 14px",
                borderRadius: 11,
                fontWeight: 700
              }}
            >
              {selectedApp.status}
            </span>
          </div>
          <div style={{ margin: "7px 0" }}>
            <b>Type:</b> {selectedApp.type}
          </div>
          <div style={{ margin: "7px 0" }}>
            <b>Info:</b>{" "}
            {selectedApp.info
              ? typeof selectedApp.info === "string"
                ? selectedApp.info
                : JSON.stringify(selectedApp.info)
              : "-"}
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button
              style={{
                background: colors.green,
                color: "#fff",
                border: 0,
                borderRadius: 5,
                padding: "7px 14px",
                fontWeight: 700,
              }}
              onClick={() => approveApp(selectedApp.id, "approved")}
              disabled={loading}
            >
              Approve
            </button>
            <button
              style={{
                background: colors.rejected,
                color: "#fff",
                border: 0,
                borderRadius: 5,
                padding: "7px 14px",
                fontWeight: 700,
              }}
              onClick={() => approveApp(selectedApp.id, "rejected")}
              disabled={loading}
            >
              Reject
            </button>
            <button
              style={{
                marginLeft: "auto",
                background: colors.gray,
                color: colors.navy,
                border: 0,
                padding: "7px 12px",
                borderRadius: 7,
                fontWeight: 600
              }}
              onClick={() => setSelectedApp(null)}
            >
              Close
            </button>
          </div>
          {actionMsg && (
            <div
              style={{
                marginTop: 14,
                color: actionMsg === "Updated!" ? colors.green : colors.rejected,
                fontWeight: 600
              }}
            >
              {actionMsg}
            </div>
          )}
        </div>
      )}
      <div style={{
        textAlign: "right",
        fontSize: 13,
        color: "#888",
        marginTop: 21
      }}>
        Admin officers: export analytics to CSV for reporting management use.
      </div>
    </div>
  );
}

// Analytics/stat card component
function StatCard({ label, value, icon, color, bg }) {
  return (
    <div
      style={{
        flex: "0 1 138px",
        minWidth: 106,
        background: bg,
        color,
        borderRadius: 11,
        padding: "13px 12px",
        boxShadow: "0 2px 8px #1e2a3810",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontWeight: 700,
        fontSize: 16,
        marginBottom: 3,
      }}
    >
      <span style={{ fontSize: 23, marginBottom: 5 }}>{icon}</span>
      <span style={{
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 0.5,
        lineHeight: 1.05
      }}>
        {value}
      </span>
      <span style={{
        fontSize: 13,
        fontWeight: 600,
        color: "#fff9",
        textAlign: "center",
        letterSpacing: 0.08,
        textShadow: "0 1px 2px #0001"
      }}>
        {label}
      </span>
    </div>
  );
}
