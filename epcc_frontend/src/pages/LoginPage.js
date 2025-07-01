import React, { useState } from "react";
import { useLang } from "../i18n";
import { apiRequest, saveAuthToken } from "../api";
import { useNavigate, Link } from "react-router-dom";

// PUBLIC_INTERFACE
export default function LoginPage() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // PUBLIC_INTERFACE
  // Login handler: POST /token, expects username/password as application/x-www-form-urlencoded
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError(t("fill_required"));
      return;
    }
    setLoading(true);
    try {
      // Prepare login form data as x-www-form-urlencoded per OAuth2 spec
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const resp = await fetch(
        "https://vscode-internal-74-beta.beta01.cloud.kavia.ai:3001/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        }
      );
      let data;
      // Attempt to read JSON response regardless of ok/error for detailed error information
      try {
        data = await resp.json();
      } catch {
        data = {};
      }
      if (!resp.ok) {
        throw data;
      }
      if (data?.access_token) {
        saveAuthToken(data.access_token);
        navigate("/");
      } else {
        setError(t("invalid_credentials"));
      }
    } catch (e) {
      setError(
        (e && e.error === "INVALID_CREDENTIALS")
          ? t("invalid_credentials")
          : t("general_error")
      );
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ maxWidth: 400, margin: "80px auto" }}>
      <h2>{t("login")}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            style={{ width: "100%", margin: "10px 0", padding: 8 }}
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div>
          <input
            style={{ width: "100%", margin: "10px 0", padding: 8 }}
            type="password"
            placeholder={t("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && (
          <div style={{ color: "#ce2b28", marginBottom: 10, fontWeight: 500 }}>
            {error}
          </div>
        )}
        <button
          className="theme-toggle"
          style={{ marginTop: 10, width: "100%" }}
          type="submit"
          disabled={loading}
        >
          {loading ? t("loading") : t("login")}
        </button>
      </form>
      <div style={{ marginTop: 16 }}>
        {t("register")}?{" "}
        <Link to="/register" style={{ color: "var(--text-secondary)" }}>
          {t("register")}
        </Link>
      </div>
    </div>
  );
}
