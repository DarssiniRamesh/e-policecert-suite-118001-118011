import React, { useEffect, useState } from "react";
import { useLang } from "../i18n";
import { apiRequest, getAuthToken } from "../api";

// PUBLIC_INTERFACE
/**
 * Redesigned User Dashboard matching RFP requirements:
 * - Analytics widgets (application stats, status breakdown)
 * - Recent actions summary (applications, activities)
 * - Issued certificates summary
 * - Navy blue, modern professional layout
 */
export default function Dashboard() {
  const { t } = useLang();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function fetchDashboardData() {
      setLoading(true); setLoadErr("");
      try {
        const token = getAuthToken();
        // Fetch applications
        const appsResp = await apiRequest("/applications", "GET", null, token);
        const applications = appsResp.applications || [];
        // Stats: count by status
        const statsObj = {};
        applications.forEach((a) => {
          statsObj[a.status] = (statsObj[a.status] || 0) + 1;
        });

        // Sort by updated/created (assuming 'created_at'| 'updated_at' or fallback to id desc)
        const recentApps = [...applications]
          .sort((a, b) =>
            (b.updated_at || b.created_at || b.id) - (a.updated_at || a.created_at || a.id)
          )
          .slice(0, 4);

        // Fetch certificates summary
        let certResp = [];
        try {
          const certResult = await apiRequest("/certificates", "GET", null, token);
          if (Array.isArray(certResult)) {
            certResp = certResult;
          } else if (certResult && Array.isArray(certResult.certificates)) {
            certResp = certResult.certificates;
          }
        } catch { certResp = []; }

        if (!isMounted) return;
        setStats({
          total: applications.length,
          ...statsObj,
        });
        setRecent(recentApps);
        setCerts(certResp || []);
        setLoading(false);
      } catch (e) {
        if (!isMounted) return;
        setLoading(false);
        setLoadErr("Failed to load dashboard data.");
      }
    }
    fetchDashboardData();
    return () => { isMounted = false; };
  }, []);

  // Color palette for navy blue theme
  const colors = {
    navy: "#1E2A38",
    blue: "#1976D2",
    blueAccent: "#1E88E5",
    green: "#43A047",
    light: "#f9fafc",
    white: "#fff",
    gray: "#e3e8ef",
  };

  // Helper for status color
  const statusColor = (status) => {
    switch (status) {
      case "pending": return "#1976D2";
      case "approved": return "#43A047";
      case "issued": return "#1565c0";
      case "rejected": return "#ce2b28";
      default: return "#555";
    }
  };

  return (
    <div
      className="container"
      style={{
        padding: "24px 12px",
        maxWidth: 850,
        margin: "30px auto",
        background: colors.light,
        minHeight: "100vh",
        border: `2px solid ${colors.gray}`,
        borderRadius: 18,
        boxShadow: "0 2px 12px #1e2a380e",
      }}
    >
      <h1
        style={{
          color: colors.navy,
          marginBottom: 5,
          fontWeight: "bold",
          fontSize: 32,
          letterSpacing: 1
        }}
      >
        {t("dashboard")}
      </h1>
      <div
        style={{
          color: colors.blue,
          fontWeight: 500,
          marginBottom: 18,
          fontSize: 21,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span role="img" aria-label="badge" style={{ fontSize: 27 }}>
          🛡️
        </span>
        Welcome to your E-Police Certificate Dashboard
      </div>
      {loadErr && (
        <div style={{ color: "#ce2b28", marginBottom: 20, fontWeight: 500 }}>{loadErr}</div>
      )}
      {loading ? (
        <div style={{ fontSize: 18, margin: "16px 0" }}>{t("loading")}</div>
      ) : (
        <>
          {/* ANALYTICS ROW */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 18,
              marginBottom: 24,
              justifyContent: "space-between",
            }}
          >
            <DashboardStat
              label="Total Applications"
              value={stats?.total || 0}
              icon="📝"
              color={colors.navy}
              bg={colors.blueAccent}
            />
            <DashboardStat
              label="Pending"
              value={stats?.pending || 0}
              icon="⏳"
              color="#fff"
              bg={colors.blue}
            />
            <DashboardStat
              label="Approved"
              value={stats?.approved || 0}
              icon="✅"
              color="#fff"
              bg={colors.green}
            />
            <DashboardStat
              label="Rejected"
              value={stats?.rejected || 0}
              icon="❌"
              color="#fff"
              bg="#ce2b28"
            />
            <DashboardStat
              label="Certificates Issued"
              value={certs.length}
              icon="📃"
              color={colors.navy}
              bg={colors.gray}
            />
          </div>
          {/* RECENT APPLICATIONS */}
          <section
            style={{
              border: `1px solid ${colors.gray}`,
              background: "#fff",
              borderRadius: 12,
              marginBottom: 26,
              padding: "22px 16px 13px 16px",
              boxShadow: "0 2px 8px #1e2a3810",
            }}
          >
            <div style={{ fontWeight: 600, color: colors.navy, fontSize: 20, marginBottom: 10 }}>
              Recent Applications
            </div>
            {recent?.length === 0 ? (
              <div style={{ color: "#888" }}>You have no recent applications.</div>
            ) : (
              <table style={{ width: "100%", fontSize: 15, marginBottom: 5 }}>
                <thead>
                  <tr style={{ background: colors.light }}>
                    <th style={{ padding: 7, textAlign: "left" }}>ID</th>
                    <th style={{ padding: 7, textAlign: "left" }}>Type</th>
                    <th style={{ padding: 7, textAlign: "left" }}>Status</th>
                    <th style={{ padding: 7, textAlign: "left" }}>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((a, idx) => (
                    <tr
                      key={a.id || idx}
                      style={{
                        background: idx % 2 === 0 ? "#f9fafc" : "#e9f2fc",
                        fontWeight: 400,
                      }}
                    >
                      <td style={{ padding: 7 }}>{a.id}</td>
                      <td style={{ padding: 7 }}>{a.type || "-"}</td>
                      <td style={{ padding: 7 }}>
                        <span
                          style={{
                            background: statusColor(a.status),
                            padding: "3px 12px",
                            borderRadius: 14,
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 13,
                            letterSpacing: 0.2,
                          }}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td style={{ padding: 7 }}>
                        {a.created_at
                          ? new Date(a.created_at).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
          {/* ISSUED CERTIFICATES WIDGET */}
          <section
            style={{
              border: `1px solid ${colors.gray}`,
              background: "#fff",
              borderRadius: 12,
              marginBottom: 18,
              padding: "22px 16px 14px 16px",
              boxShadow: "0 2px 8px #1e2a3810",
            }}
          >
            <div
              style={{
                fontWeight: 600,
                color: colors.navy,
                fontSize: 20,
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <span role="img" aria-label="cert">🎓</span>
              Issued Certificates
            </div>
            {certs.length === 0 ? (
              <div style={{ color: "#888", marginBottom: 8 }}>
                No certificate has been issued yet.
              </div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {certs.slice(0, 4).map((c, idx) => (
                  <li
                    key={c.id || idx}
                    style={{
                      marginBottom: 10,
                      padding: "5px 2px",
                      fontSize: 15,
                      borderBottom:
                        idx !== certs.length - 1 ? `1px solid ${colors.gray}` : "none",
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    <span
                      style={{
                        marginRight: 10,
                        background: colors.blueAccent,
                        color: "#fff",
                        borderRadius: 16,
                        width: 22,
                        height: 22,
                        display: "inline-block",
                        textAlign: "center",
                        fontSize: 15,
                        fontWeight: 700,
                        lineHeight: "22px"
                      }}
                    >
                      📄
                    </span>
                    <span style={{ flex: 1, color: colors.navy }}>
                      {c.file_name || c.name || "PCC Certificate"}
                      {c.issue_date ? (
                        <span style={{ color: "#1976D2", fontSize: 12, marginLeft: 10 }}>
                          [{new Date(c.issue_date).toLocaleDateString()}]
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div style={{ textAlign: "right", marginTop: 7 }}>
              <a
                href="/downloads"
                style={{
                  color: colors.blue,
                  textDecoration: "underline",
                  fontWeight: 500,
                  fontSize: 14,
                  marginLeft: 10,
                }}
              >
                View all certificates &rarr;
              </a>
            </div>
          </section>
          {/* ACTIONS SHORTCUTS */}
          <div
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              justifyContent: "flex-end",
              marginTop: 12,
              marginBottom: 2
            }}
          >
            <Shortcut
              label={t("apply_certificate")}
              href="/apply"
              bg={colors.blue}
            />
            <Shortcut
              label={t("certificate_history")}
              href="/applications"
              bg={colors.navy}
            />
            <Shortcut
              label={t("notifications")}
              href="/notifications"
              bg={colors.blueAccent}
            />
            <Shortcut
              label={t("upload_documents")}
              href="/upload"
              bg={colors.green}
            />
            <Shortcut
              label={t("download_certificate")}
              href="/downloads"
              bg={colors.gray}
            />
          </div>
        </>
      )}
    </div>
  );
}

// Analytics widget/stat component
function DashboardStat({ label, value, icon, color, bg }) {
  return (
    <div
      style={{
        flex: "0 1 148px",
        minWidth: 120,
        background: bg,
        color,
        borderRadius: 12,
        padding: "16px 12px",
        boxShadow: "0 2px 8px #1e2a3817",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontWeight: 700,
        fontSize: 18
      }}
    >
      <span style={{ fontSize: 26, marginBottom: 6 }}>{icon}</span>
      <span style={{
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 2,
        lineHeight: 1.05
      }}>
        {value}
      </span>
      <span style={{
        fontSize: 14,
        fontWeight: 500,
        color: "#fff9",
        marginTop: 2,
        textAlign: "center",
        letterSpacing: 0.1,
        textShadow: "0 1px 2px #0001"
      }}>
        {label}
      </span>
    </div>
  );
}

// Shortcut button component
function Shortcut({ label, href, bg }) {
  return (
    <a
      href={href}
      style={{
        display: "inline-block",
        background: bg,
        color: "#fff",
        padding: "9px 14px",
        borderRadius: 10,
        fontWeight: 600,
        textDecoration: "none",
        fontSize: 15,
        letterSpacing: 0.2,
        marginRight: 4,
        transition: "opacity 0.15s",
      }}
      tabIndex={0}
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          window.location.href = href;
        }
      }}
    >
      {label}
    </a>
  );
}
