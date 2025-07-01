import React, { createContext, useContext, useState } from "react";

// Supported languages and translations
const translations = {
  en: {
    login: "Login",
    register: "Register",
    logout: "Logout",
    dashboard: "Dashboard",
    userDashboard: "User Dashboard",
    adminDashboard: "Admin Dashboard",
    apply_certificate: "Apply for Certificate",
    certificate_status: "Certificate Status",
    certificate_history: "Certificate History",
    notifications: "Notifications",
    upload_documents: "Upload Documents",
    download_certificate: "Download Certificate",
    language: "Language",
    english: "English",
    bislama: "Bislama",
    submit: "Submit",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    name: "Full Name",
    status: "Status",
    history: "History",
    application: "Application",
    admin: "Admin",
    back: "Back",
    welcome: "Welcome",
    home: "Home",
    loading: "Loading...",
    invalid_credentials: "Invalid credentials. Please try again.",
    general_error: "An error occurred, please try again.",
    fill_required: "Please fill in all required fields.",
    certificate_no_applications: "You have no certificate applications.",
  },
  bi: {
    login: "Login",
    register: "Rejista",
    logout: "Laoat",
    dashboard: "Dasbot",
    userDashboard: "Dasbot Blong Yumi",
    adminDashboard: "Dasbot Blong Admin",
    apply_certificate: "Applaem Long Sertificate",
    certificate_status: "Status Blong Sertificate",
    certificate_history: "History Blong Sertificate",
    notifications: "Notifikesen",
    upload_documents: "Aploadem Dokument",
    download_certificate: "Daonlodem Sertificate",
    language: "Langwis",
    english: "Inglis",
    bislama: "Bislama",
    submit: "Submitem",
    email: "Imel",
    password: "Paswod",
    confirmPassword: "Konfem Paswod",
    name: "Nem",
    status: "Status",
    history: "History",
    application: "Applikesen",
    admin: "Admin",
    back: "Gobak",
    welcome: "Welkam",
    home: "Hom",
    loading: "I Loa...",
    invalid_credentials: "Imel mo paswod i no stret.",
    general_error: "I gat problem, traem bakegen.",
    fill_required: "Plis putum ol impoten infomesen.",
    certificate_no_applications: "Yu no gat eni applikesen yet.",
  },
};

const LanguageContext = createContext({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

// PUBLIC_INTERFACE
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");
  const t = (key) => translations[lang][key] || key;
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useLang() {
  return useContext(LanguageContext);
}
