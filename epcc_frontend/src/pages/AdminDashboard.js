import React from "react";
import { useLang } from "../i18n";

// PUBLIC_INTERFACE
export default function AdminDashboard() {
  const { t } = useLang();
  return (
    <div className="container" style={{ padding: 24 }}>
      <h1>{t("adminDashboard")}</h1>
      <p>Admin features: manage users, review applications, metrics, audit log.</p>
      <ul>
        <li>User Management</li>
        <li>Certificate Review/Approval</li>
        <li>Notifications</li>
        <li>Audit Logs</li>
      </ul>
    </div>
  );
}
