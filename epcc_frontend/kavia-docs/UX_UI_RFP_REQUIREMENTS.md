# Extracted RFP Requirements for E-Police Certificate System 
*Based on RFP/FJI10-017-2021 for Vanuatu Police Force e-PCC Web & Mobile Applications*

---

## 1. Context and System Scope

The E-Police Certificate (e-PCC) solution is intended to expedite and digitize the process of Police Clearance Certificates (PCC) for Vanuatu residents—especially seasonal workers required to provide this documentation to employers abroad. The system addresses pain points in the current manual process, such as high cost, significant travel, single-location access, and bureaucracy.

The e-PCC project requires both a **web-based portal** and an **Android smartphone application**. This document focuses on the UI/UX, functional, dashboard, and role-based requirements derived from the RFP for system design.

---

## 2. Functional Requirements (from RFP)

### 2.1 For All Users (Applicants)
- **Web-based Application Access:** The system must provide a simple web interface, usable on modern browsers and low-powered mobile devices (including feature phones with browsers).
- **PCC Application Submission:** Users can apply for their Police Clearance Certificate (PCC) online.
- **Document Upload:** Users must be able to upload required documents as part of their PCC application, eliminating the need for in-person visits.
- **24/7 Availability:** Platform is accessible at any time from home or elsewhere with internet.
- **Multilingual Content:** Application content should be available in both Bislama (default) and English.
- **e-PCC Delivery:** Applicants can request the approved, digitally signed PDF e-PCC be sent via email. Optionally, it can also be sent directly to an Agent/Employer.
- **Progress/View:** Users can track the status of their application with clear updates (through notifications or dashboard indicators).
- **Fee Payment Integration:** Users can pay the prevailing PCC fees online, ideally integrated with local bank mobile channels, mobile money, or other e-payment services.
- **No Additional Charges:** Users pay only the established PCC fees; no hidden or extra platform charges.
- **Notifications:** Users receive status updates throughout the certificate application lifecycle.

### 2.2 For Administrators (VPF, OGCIO, Officers) 
- **Admin Dashboard:** Admins can view all user applications, uploaded documents, and system analytics/data. (Includes ability to search, filter by status, view detailed records, etc.)
- **User List and Management:** Admins/Officers see a list of all users, certificates, and related data for verification and processing actions.
- **Certificate Verification and Processing:** Admins can review, verify, approve, or reject PCC applications and uploaded documents.
- **Direct Communication:** Admins can issue or verify certificates, sending approved certificates directly to users or agencies.
- **Audit Trail & Analytics:** The platform includes a digital document manager for the VPF to securely store, reuse, and analyze user and certificate data (for efficiency, integrity, and reporting).
- **System Maintenance:** Admins/technical users are responsible for maintenance, documentation, and handover as part of system operations.

---

## 3. Roles and Access

### 3.1 Role Types
- **Regular User (Applicant):**
  - Can register, login, apply, upload documents, pay, track status, ask for digital delivery.
  - Sees a dashboard focused on application analytics, recent activity, notifications, and certificate/download status.

- **Administrator/Officer:**
  - Sees all users and all applications, including audit trail and analytics.
  - Can approve/reject/verifying applications, view and manage uploads, handle direct e-mail/PDF delivery, and provide audit/reporting oversight.
  - Can manage user roles and system configuration (as needed by VPF).

---

## 4. Dashboard Features

### 4.1 Admin Dashboard
- **Full User List:** All registered users are visible, filterable, and actionable from the admin panel.
- **Applications Overview:** Detailed and summary views of all PCC applications (pending, approved, rejected, etc.).
- **Actions:** Ability to approve/reject/verify submissions, review uploaded documents, send notifications, and issue e-PCCs.
- **Analytics:** System should visualize data/metrics like number of applications, approval/rejection rates, in-progress vs. completed applications, payment stats, and other key performance indicators useful to VPF and OGCIO.
- **Audit Trails:** Ability to review a chronological log of certificate processing, user actions, and admin interventions.

### 4.2 User Dashboard
- **Summary/Analytics:** Displays counts of submitted applications, current statuses (e.g., pending, approved), and quick-glance activity history.
- **Application Statuses:** Recent activity list/log (e.g., submissions, uploads, notification events, certificate issued, etc.)
- **Document Management:** List and status of uploaded documents per application.
- **Certificate Details:** View/download links for certificates, if eligible, and delivery statuses.
- **Notifications:** All status and administrative updates appear in the dashboard or a notification panel.

---

## 5. Analytics & Data

- **Dashboard Charts/Stats:** Both admin and users benefit from graphical or tabular representations of their activities (totals, monthly trends, etc.).
- **Admin Analytics:** System-wide statistics for reporting to management or government (volumes, types, payment stats, application durations, etc.).
- **Data Storage:** Digital document management for records retention, reuse, and analysis.

---

## 6. UI/UX and Visual/Theme Guidelines

### 6.1 General
- **Simple, Modern, and Professional UI:** Visual design must inspire trust with a professional, institutional look and feel.
- **Navy Blue Theme:** The primary branding should use navy blue, with clean, minimal accents and layouts suited for police/government context.
- **Accessibility:** The design must be responsive and function well across desktop and low-end mobile devices.
- **Color Accessibility:** Good contrast and readable fonts.
- **Clear Layout:** Use of clear top navigation and sidebars as needed; data-rich dashboard views for both roles.
- **Minimalistic Sidebar:** An improved sidebar with logically grouped navigation relevant to the user role.
- **Language Toggle:** Frontend should provide a visible switch for Bislama and English.

### 6.2 Color & Theme (from RFP and container configs)
- **Primary:** Navy Blue (Suggested hex: #1E2A38 to #1976D2 or similar)
- **Secondary/Accents:** Use soft/light greys, white backgrounds, with blue/green action colors if needed.
- **User-Facing:** Icons and indicators should be minimal, not cartoonish, and in a style suitable for an official government portal.

---

## 7. Additional Notes

- **Direct PDF Delivery Options:** Delivery methods for the signed e-PCC include user email and sending direct to agent/employer.
- **Integration with Payment Services:** UI must accommodate or guide users through digital payment flows (via mobile banking or eMoney services).
- **No Hidden Charges:** Transparent UI around payments.
- **Support & Handover:** Documentation and staff/admin training must accompany the software.

---

## 8. Requirements Checklist (for Design/Dev Reference)
- [x] Web dashboard(s) for user and admin, platform-appropriate and device responsive
- [x] Clean navy blue (police/professional) color theme across all visual components
- [x] Separate role-based dashboards: analytics-rich for users, full control for admins
- [x] Notification functionality for status and system updates
- [x] Document upload and management features included in application and dashboard flows
- [x] Direct download and/or email/PDF certificate delivery
- [x] Integrated digital payment support
- [x] Language switcher prominently available (Bislama/English)
- [x] Visual analytics and status indicators for both user and admin dashboards

---

_Last updated: Extracted from 2021 RFP for e-PCC (Vanuatu Police Force) by UNDP/UNCDF_

