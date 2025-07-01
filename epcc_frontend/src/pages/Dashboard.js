import React from "react";
import { useLang } from "../i18n";

// PUBLIC_INTERFACE
export default function Dashboard() {
  const { t } = useLang();
  return (
    <div className="container" style={{ padding: 24 }}>
      <h1>{t("dashboard")}</h1>
      <div style={{ margin: "32px 0", fontSize: 20 }}>
        {t("welcome")} to E-Police Certificate system.
      </div>
      <ul style={{ listStyle: "none" }}>
        <li>• {t("apply_certificate")}</li>
        <li>• {t("certificate_history")}</li>
        <li>• {t("notifications")}</li>
        <li>• {t("upload_documents")}</li>
        <li>• {t("download_certificate")}</li>
      </ul>
    </div>
  );
}
