import React, { useState } from "react";
import { useLang } from "../i18n";
import { apiRequest, getAuthToken } from "../api";

// PUBLIC_INTERFACE
export default function DocumentUpload() {
  const { t } = useLang();
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    setMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMsg("No file selected");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("document", file);
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
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="*"
          onChange={handleChange}
          style={{ margin: "10px 0" }}
        />
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
