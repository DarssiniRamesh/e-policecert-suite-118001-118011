import React, { useEffect, useState } from "react";
import { useLang } from "../i18n";
import { apiRequest, getAuthToken } from "../api";

// PUBLIC_INTERFACE
export default function AdminDashboard() {
  const { t } = useLang();
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionMsg, setActionMsg] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setErr(""); setLoading(true);
      try {
        const [u, a] = await Promise.all([
          apiRequest("/admin/users", "GET", null, getAuthToken()),
          apiRequest("/admin/applications", "GET", null, getAuthToken()),
        ]);
        setUsers(u.users || []);
        setApplications(a.applications || []);
      } catch { setErr("Failed to load admin data"); }
      setLoading(false);
    }
    fetchData();
    // eslint-disable-next-line
  }, [reload]);

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
      setReload((v) => v + 1);
      setSelectedApp(null);
    } catch {
      setActionMsg("Failed to update.");
    }
    setLoading(false);
  }

  return (
    <div className="container" style={{ padding: 24 }}>
      <h1>{t("adminDashboard")}</h1>
      {err && <div style={{ color: "#ce2b28", margin: 8 }}>{err}</div>}
      {loading ? (
        <div>{t("loading")}</div>
      ) : (
        <div>
          <h3>Users</h3>
          <table style={{ width: "100%", marginBottom: 24 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Admin</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.is_admin ? "✔️" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Certificate Applications</h3>
          <table style={{ width: "100%", marginBottom: 18 }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Type</th>
                <th>Status</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.user_email || a.user_name}</td>
                  <td>{a.type}</td>
                  <td>{a.status}</td>
                  <td>
                    <button
                      onClick={() => setSelectedApp(a)}
                      style={{
                        background: "#1976D2",
                        color: "white",
                        border: 0,
                        borderRadius: 5,
                        padding: "4px 10px",
                        cursor: "pointer",
                      }}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {selectedApp && (
            <div
              style={{
                border: "1px solid var(--border-color)",
                padding: 18,
                margin: "8px 0",
                background: "#fafbfc",
                borderRadius: 6,
              }}
            >
              <h4>Application #{selectedApp.id}</h4>
              <div>
                <b>User:</b>{" "}
                {selectedApp.user_email || selectedApp.user_name || "N/A"}
              </div>
              <div>
                <b>Status:</b> {selectedApp.status}
              </div>
              <div>
                <b>Type:</b> {selectedApp.type}
              </div>
              <div>
                <b>Info:</b> {selectedApp.info}
              </div>
              <div style={{ marginTop: 10 }}>
                <button
                  style={{
                    background: "#43A047",
                    color: "#fff",
                    border: 0,
                    borderRadius: 5,
                    padding: "6px 12px",
                    marginRight: 6,
                  }}
                  onClick={() => approveApp(selectedApp.id, "approved")}
                  disabled={loading}
                >
                  Approve
                </button>
                <button
                  style={{
                    background: "#ce2b28",
                    color: "white",
                    border: 0,
                    borderRadius: 5,
                    padding: "6px 12px",
                  }}
                  onClick={() => approveApp(selectedApp.id, "rejected")}
                  disabled={loading}
                >
                  Reject
                </button>
                <button
                  style={{
                    marginLeft: 10,
                    background: "var(--border-color)",
                    border: 0,
                    padding: "6px 12px",
                    borderRadius: 6,
                  }}
                  onClick={() => setSelectedApp(null)}
                >
                  Close
                </button>
              </div>
              {actionMsg && <div style={{ marginTop: 10 }}>{actionMsg}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
