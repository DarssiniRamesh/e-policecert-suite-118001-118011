import React, { useEffect, useState } from "react";
import { apiRequest, getAuthToken } from "../api";
import { useLang } from "../i18n";

// PUBLIC_INTERFACE
/**
 * Admin User Management Page (EPCC Requirement)
 * - Shows user accounts in sortable, searchable, filterable table
 * - Allows admin to promote/demote users (PATCH /admin/users/{id})
 * - Allows activate/deactivate if supported (PATCH /admin/users/{id} with status)
 * - Shows audit log of changes (GET /admin/auditlog or similar if supported)
 * - Only visible to admin users
 */
export default function UserManagement() {
  const { t } = useLang();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [auditLog, setAuditLog] = useState([]);
  const [logLoading, setLogLoading] = useState(false);

  // For modal action for confirmation
  const [modalUser, setModalUser] = useState(null); // user object
  const [modalAction, setModalAction] = useState(""); // "promote"|"demote"|"activate"|"deactivate"|""

  // Fetch users and audit log on mount
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true); setErr(""); setActionMsg("");
      try {
        const resp = await apiRequest("/admin/users", "GET", null, getAuthToken());
        setUsers(Array.isArray(resp) ? resp : (resp.users || []));
      } catch {
        setErr("Failed to load users.");
        setUsers([]);
      }
      setLoading(false);
    }
    fetchUsers();
    fetchAuditLog();
    // eslint-disable-next-line
  }, []);

  const fetchAuditLog = async () => {
    setLogLoading(true);
    try {
      // Try standard auditlog endpoint, fallback to empty if not implemented
      const resp = await apiRequest("/admin/auditlog", "GET", null, getAuthToken());
      setAuditLog(Array.isArray(resp) ? resp : (resp.auditlog || []));
    } catch {
      setAuditLog([]);
    }
    setLogLoading(false);
  }

  // Table filtering
  let filtered = users;
  if (role) filtered = filtered.filter(u => (u.role || "").toLowerCase() === role.toLowerCase());
  if (status) filtered = filtered.filter(u => {
    if (status === "active") return u.is_active !== false;
    if (status === "inactive") return u.is_active === false;
    return true;
  });
  if (search) filtered = filtered.filter(u =>
    [u.id, u.email, u.full_name, u.role]
      .map(x => (x || "").toLowerCase())
      .some(v => v.includes(search.toLowerCase()))
  );

  // PATCH user handler (promote/demote/activate/deactivate)
  const handleAction = async (user, actionType) => {
    setActionMsg("");
    setLoading(true);
    setModalUser(null);
    let payload = {};
    if (actionType === "promote") payload = { role: "admin" };
    else if (actionType === "demote") payload = { role: "user" };
    else if (actionType === "activate") payload = { is_active: true };
    else if (actionType === "deactivate") payload = { is_active: false };
    try {
      await apiRequest(`/admin/users/${user.id}`, "PATCH", payload, getAuthToken());
      setActionMsg(`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} successful`);
      // Refresh users and log
      const upd = await apiRequest("/admin/users", "GET", null, getAuthToken());
      setUsers(Array.isArray(upd) ? upd : (upd.users || []));
      fetchAuditLog();
    } catch {
      setActionMsg("Action failed. (Not all endpoints supported?)");
    }
    setLoading(false);
  };

  // Helper: User status color
  function statusColor(active) {
    return active === false ? "#ce2b28" : "#43a047";
  }

  return (
    <div className="container" style={{
      margin: "32px auto", maxWidth: 1050, background: "#fff",
      borderRadius: 15, border: "2px solid #e3e8ef", boxShadow: "0 2px 12px #1e2a380A",
      padding: "34px 16px"
    }}>
      <h2 style={{ color: "#1E2A38", fontWeight: "bold", marginBottom: 14 }}>
        User Management
      </h2>
      <div style={{
        display: "flex", gap: 13, alignItems: "center", marginBottom: 9, flexWrap: "wrap"
      }}>
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search ID, Name, Email, Role…"
          style={{
            minWidth: 160, fontSize: 15, borderRadius: 7,
            border: "1px solid #e3e8ef", padding: "7px 10px", color: "#1E2A38"
          }}
          aria-label="Search users"
        />
        <select value={role} onChange={e => setRole(e.target.value)}
          style={{ minWidth: 88, fontSize: 15, borderRadius: 7, border: "1px solid #e3e8ef", padding: "7px 10px", color: "#1E2A38" }}
          aria-label="Filter by role"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="officer">Officer</option>
          <option value="user">User</option>
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}
          style={{ minWidth: 88, fontSize: 15, borderRadius: 7, border: "1px solid #e3e8ef", padding: "7px 10px", color: "#1E2A38" }}
          aria-label="Filter by status"
        >
          <option value="">Active & Inactive</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <span style={{ color: "#8c8c8c", fontSize: 13 }}>
          Showing {filtered.length} of {users.length}
        </span>
      </div>

      <div style={{
        border: "1.5px solid #e3e8ef", background: "#fff",
        borderRadius: 12, overflowX: "auto", marginBottom: 15
      }}>
        {err ? (
          <div style={{ color: "#ce2b28", padding: 10, fontWeight: 500 }}>{err}</div>
        ) : loading ? (
          <div style={{ color: "#1976D2", fontWeight: 600, fontSize: 16, padding: 26, textAlign: "center" }}>
            {t("loading")}
          </div>
        ) : (
          <table style={{ width: "100%", fontSize: 15, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{
                background: "#f9fafc", color: "#1E2A38", fontWeight: 700, fontSize: 16,
                borderBottom: "2px solid #e3e8ef"
              }}>
                <th style={{ padding: "8px 5px" }}>ID</th>
                <th style={{ padding: "8px 5px" }}>Name</th>
                <th style={{ padding: "8px 5px" }}>Email</th>
                <th style={{ padding: "8px 5px" }}>Role</th>
                <th style={{ padding: "8px 5px" }}>Status</th>
                <th style={{ padding: "8px 5px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "18px 0", color: "#888", textAlign: "center" }}>
                    No users found.
                  </td>
                </tr>
              ) : filtered.map((u, idx) => (
                <tr key={u.id || idx}
                  style={{ background: idx % 2 === 0 ? "#f9fafc" : "#e9f2fc" }}>
                  <td style={{ padding: "8px 5px" }}>{u.id}</td>
                  <td style={{ padding: "8px 5px" }}>{u.full_name || "-"}</td>
                  <td style={{ padding: "8px 5px" }}>{u.email || "-"}</td>
                  <td style={{ padding: "8px 5px", textTransform: "capitalize" }}>
                    {u.role}
                  </td>
                  <td style={{ padding: "8px 5px" }}>
                    <span style={{
                      background: statusColor(u.is_active),
                      color: "#fff", padding: "2px 11px",
                      borderRadius: 14, fontWeight: 700, fontSize: 13,
                      letterSpacing: 0.14, textTransform: "capitalize"
                    }}>{u.is_active === false ? "Inactive" : "Active"}</span>
                  </td>
                  <td style={{ padding: "8px 5px" }}>
                    {u.role !== "admin" && (
                      <button className="theme-toggle"
                        style={{ background: "#1976D2", marginRight: 3, fontSize: 14 }}
                        onClick={() => { setModalUser(u); setModalAction("promote"); }}
                        disabled={u.role === "admin" || loading}
                      >Promote to Admin</button>
                    )}
                    {u.role === "admin" && (
                      <button className="theme-toggle"
                        style={{ background: "#ce2b28", marginRight: 3, fontSize: 14 }}
                        onClick={() => { setModalUser(u); setModalAction("demote"); }}
                        disabled={u.role !== "admin" || loading}
                      >Demote to User</button>
                    )}
                    {u.is_active === false ? (
                      <button className="theme-toggle"
                        style={{ background: "#43a047", fontSize: 14 }}
                        onClick={() => { setModalUser(u); setModalAction("activate"); }}
                        disabled={loading}
                      >Activate</button>
                    ) : (
                      <button className="theme-toggle"
                        style={{ background: "#ce2b28", fontSize: 14 }}
                        onClick={() => { setModalUser(u); setModalAction("deactivate"); }}
                        disabled={loading}
                      >Deactivate</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Action/confirmation modal */}
      {modalUser && modalAction && (
        <div tabIndex={-1} style={{
          position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
          background: "#2229b633", zIndex: 1112, display: "flex", alignItems: "center", justifyContent: "center"
        }}
          aria-modal="true"
          role="dialog"
          onClick={e => { if (e.target === e.currentTarget) setModalUser(null); }}
        >
          <div style={{
            background: "#fff", minWidth: 270, maxWidth: 390, padding: 20,
            borderRadius: 12, boxShadow: "0 6px 28px #19356442"
          }}>
            <div style={{ marginBottom: 13, color: "#1E2A38", fontWeight: "bold" }}>
              Confirm {modalAction.charAt(0).toUpperCase() + modalAction.slice(1)}
            </div>
            <div style={{ marginBottom: 10, fontWeight: 500 }}>
              {modalAction} user <b>{modalUser.full_name || modalUser.email}</b>?
              <br />
              <span style={{ fontSize: 13, color: "#888" }}>
                (User ID: {modalUser.id})
              </span>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button
                className="theme-toggle"
                style={{ background: "#1976D2", color: "#fff" }}
                onClick={() => handleAction(modalUser, modalAction)}
                disabled={loading}
              >Yes</button>
              <button
                className="theme-toggle"
                style={{ background: "#e3e8ef", color: "#1E2A38" }}
                onClick={() => setModalUser(null)}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}

      {actionMsg && <div style={{
        marginTop: 10, marginBottom: 8,
        color: actionMsg.includes("failed") ? "#ce2b28" : "#43a047",
        fontWeight: 600, minHeight: 20
      }}>{actionMsg}</div>}

      {/* AUDIT LOG */}
      <section style={{
        marginTop: 30, background: "#f9fafc", borderRadius: 14,
        padding: 18, border: "1px solid #e3e8ef"
      }}>
        <div style={{
          color: "#1E2A38", fontWeight: 700, fontSize: 18,
          marginBottom: 8
        }}>User Audit Log</div>
        {logLoading ? (
          <div style={{ color: "#1976D2", fontWeight: 600 }}>{t("loading")}</div>
        ) : auditLog?.length === 0 ? (
          <div style={{ color: "#888" }}>No audit log entries available.</div>
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
    </div>
  );
}
