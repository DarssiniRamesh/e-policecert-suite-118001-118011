import React, { useState } from "react";
import { useLang } from "../i18n";
import { apiRequest, saveAuthToken } from "../api";
import { useNavigate, Link } from "react-router-dom";

// PUBLIC_INTERFACE
export default function RegisterPage() {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // PUBLIC_INTERFACE
  // Registration handler: POST /register, expects { full_name, email, password }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password || !confirmPassword) {
      setError(t("fill_required"));
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      // Backend endpoint: POST /register, expects { full_name, email, password }
      const resp = await apiRequest("/register", "POST", {
        full_name: name,
        email,
        password,
      });
      // Backend may or may not return an access_token; if not, ask user to login.
      if (resp && resp.access_token) {
        saveAuthToken(resp.access_token);
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (e) {
      setError(t("general_error"));
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ maxWidth: 400, margin: "80px auto" }}>
      <h2>{t("register")}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            style={{ width: "100%", margin: "10px 0", padding: 8 }}
            type="text"
            placeholder={t("name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            style={{ width: "100%", margin: "10px 0", padding: 8 }}
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
        <div>
          <input
            style={{ width: "100%", margin: "10px 0", padding: 8 }}
            type="password"
            placeholder={t("confirmPassword")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? t("loading") : t("register")}
        </button>
      </form>
      <div style={{ marginTop: 16 }}>
        {t("login")}?{" "}
        <Link to="/login" style={{ color: "var(--text-secondary)" }}>
          {t("login")}
        </Link>
      </div>
    </div>
  );
}
