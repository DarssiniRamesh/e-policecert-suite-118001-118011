import React, { useState } from "react";
import { useLang } from "../i18n";
import { apiRequest, getAuthToken } from "../api";

// PUBLIC_INTERFACE
/**
 * Document upload form page. Correctly sends 'application_id' and 'file' in multipart/form-data format.
 * Requires a valid application ID (string or number). On success, shows a confirmation message.
 */
export default function DocumentUpload() {
  const { t } = useLang();
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [appId, setAppId] = useState("");

  // Handle file input change
  const handleFileChange = (e) => {
    setFile(e.target.files && e.target.files.length ? e.target.files[0] : null);
    setMsg("");
  };

  // Handle form submit: send FormData { application_id, file } to backend
  // PUBLIC_INTERFACE
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMsg("No file selected");
      return;
    }
    if (!appId) {
      setMsg("Application ID required");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("application_id", appId);
    formData.append("file", file);
    try {
      await apiRequest("/documents/upload", "POST", null, getAuthToken(), formData);
      setMsg("File uploaded!");
      setFile(null);
    } catch {
      setMsg("Failed to upload.");
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ maxWidth: 460, margin: "32px auto" }}>
      <h2>{t("upload_documents")}</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          {/* Application ID input */}
          <label htmlFor="app-id-field" style={{ display: "block", marginBottom: 4 }}>
            Application ID
          </label>
          <input
            id="app-id-field"
            type="text"
            style={{ width: "100%", margin: "10px 0", padding: 8 }}
            placeholder="Enter Application ID"
            value={appId}
            onChange={e => setAppId(e.target.value)}
            required
            autoComplete="off"
          />
        </div>
        <div>
          {/* File picker */}
          <label htmlFor="file-input" style={{ display: "block", marginBottom: 4 }}>
            Select Document
          </label>
          <input
            id="file-input"
            type="file"
            accept="*"
            onChange={handleFileChange}
            style={{ margin: "10px 0" }}
            required
          />
        </div>
        <button
          className="theme-toggle"
          style={{ margin: "10px 0", width: "100%" }}
          type="submit"
          disabled={loading}
        >
          {loading ? t("loading") : "Upload"}
        </button>
        {msg && (
          <div style={{ color: "#1a1a1a", marginTop: 12, minHeight: 24 }}>
            {msg}
          </div>
        )}
      </form>
    </div>
  );
}
