import React from "react";

/**
 * Simple, reusable stat card for analytics widgets in Admin Dashboard.
 * Usage: <AdminAnalyticsWidget label="Total Applications" value={33} icon="📝" color="#1E2A38" bg="#e3e8ef" />
 */
// PUBLIC_INTERFACE
export default function AdminAnalyticsWidget({ label, value, icon, color, bg }) {
  return (
    <div
      style={{
        flex: "0 1 170px",
        minWidth: 120,
        background: bg,
        color,
        borderRadius: 13,
        padding: "18px 13px",
        marginBottom: 10,
        boxShadow: "0 2px 9px #1e2a3818",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontWeight: 700,
        fontSize: 18,
      }}
    >
      <span style={{ fontSize: 27, marginBottom: 4 }}>{icon}</span>
      <span
        style={{
          fontSize: 27,
          fontWeight: "bold",
          marginBottom: 2,
          lineHeight: 1.02,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: 15,
          fontWeight: 500,
          color: "#fff9",
          marginTop: 2,
          textAlign: "center",
          letterSpacing: 0.1,
          textShadow: "0 1px 2px #0001",
        }}
      >
        {label}
      </span>
    </div>
  );
}
