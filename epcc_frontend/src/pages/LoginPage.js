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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError(t("fill_required"));
      return;
    }
    setLoading(true);
    try {
      const resp = await apiRequest("/auth/login", "POST", { email, password });
      saveAuthToken(resp.access_token);
      navigate("/");
    } catch (e) {
      setError(
        e?.error === "INVALID_CREDENTIALS"
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
