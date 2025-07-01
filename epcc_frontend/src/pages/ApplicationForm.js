import React, { useState } from "react";
import { useLang } from "../i18n";
import { apiRequest, getAuthToken } from "../api";

// PUBLIC_INTERFACE
export default function ApplicationForm() {
  const { t } = useLang();
  const [type, setType] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!type) {
      setError(t("fill_required"));
      return;
    }
    setLoading(true);
    try {
      await apiRequest(
        "/applications",
        "POST",
        { type, info },
        getAuthToken()
      );
      setSuccess("Application submitted!");
      setType("");
      setInfo("");
    } catch {
      setError(t("general_error"));
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ maxWidth: 480, margin: "32px auto" }}>
      <h2>{t("apply_certificate")}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <select
            style={{ width: "100%", margin: "10px 0", padding: 8 }}
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="">--Select Type--</option>
            <option value="clearance">Police Clearance</option>
            <option value="record">Police Record</option>
          </select>
        </div>
        <div>
          <textarea
            style={{ width: "100%", margin: "10px 0", padding: 8 }}
            value={info}
            onChange={(e) => setInfo(e.target.value)}
            placeholder="Additional info (optional)"
          />
        </div>
        {error && (
          <div style={{ color: "#ce2b28", marginBottom: 10, fontWeight: 500 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ color: "#43a047", marginBottom: 10, fontWeight: 500 }}>
            {success}
          </div>
        )}
        <button
          className="theme-toggle"
          style={{ marginTop: 10, width: "100%" }}
          type="submit"
          disabled={loading}
        >
          {loading ? t("loading") : t("submit")}
        </button>
      </form>
    </div>
  );
}
