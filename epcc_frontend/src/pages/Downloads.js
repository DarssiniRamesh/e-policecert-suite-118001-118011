import React from "react";
import { useLang } from "../i18n";

// PUBLIC_INTERFACE
export default function Downloads() {
  const { t } = useLang();
  // Ideally would fetch/download from backend
  return (
    <div className="container" style={{ maxWidth: 480, margin: "32px auto" }}>
      <h2>{t("download_certificate")}</h2>
      <p>Download your issued police certificates here when available.</p>
      {/* TODO: List/download links from backend */}
      <ul>
        <li>
          <a href="#" onClick={(e) => e.preventDefault()}>
            Police Certificate example.pdf
          </a>
        </li>
      </ul>
    </div>
  );
}
