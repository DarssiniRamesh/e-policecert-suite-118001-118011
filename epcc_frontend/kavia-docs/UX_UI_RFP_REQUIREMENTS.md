# EPCC (E-Police Certificate) UI/UX, Dashboard, Admin, Analytics, and Theme Requirements – Extracted from RFP

_This document summarizes all relevant user interface, user experience, dashboard features, admin capabilities, analytics, and visual theming requirements from the 2021 RFP for the Vanuatu Police Force E-Police Certificate project. The aim is to provide clear design and feature constraints for the frontend/admin and user dashboard redesign phase._

---

## 1. Platform Scope & Intended Users

### Web and Mobile
- The system must be delivered as both a web-based application, usable via modern browsers (including on low-powered and feature phones), and an Android smartphone application.
- Both platforms should provide equivalent core functionality.
- Platform to enable digital delivery and fully online processing for Police Clearance Certificate (PCC) applications.

### Core Stakeholders/Roles
- **Applicants/Regular Users:** Vanuatu residents using the service to request, pay for, and receive police certificates, especially for overseas employment.
- **Administrators/Officers:** Staff from Vanuatu Police Force (VPF), OGCIO, Department of Finance and Treasury (DoFT), and other trusted roles for administrative access, processing, and oversight.
- **External Recipients:** Agents/employers and immigration officers who may be direct recipients of certificates via digital delivery.

---

## 2. Functional & UX Requirements

### For All Users (Applicants)
- **Dashboard Access & Visibility**
  - Users must have access to a personal dashboard after authentication, presenting an overview of their certificate applications, statuses, recent activity, and notifications.
  - Submission and status tracking for new PCC applications must be available at any time (“24/7 Availability”).
  - Ability to view/download digital copies of issued e-PCC, if eligible.

- **Application Submission Workflow**
  - Online PCC application through a streamlined web/mobile interface.
  - Users must be able to upload required supporting documents electronically.
  - The system must allow applicants to supply delivery preferences (e.g., PDF via email, direct to agent).
  - Clear feedback, validation, and stepwise progress within the submission process.

- **Notifications & Status Updates**
  - Real-time or near-real-time notification of application status changes (pending, approved, rejected, issued).
  - Visual indicators or notification center within dashboard.

- **Multilingual Interface**
  - Full bilingual support required; Bislama (default) and English must be available throughout the interface.
  - Users must be able to toggle languages via a clearly visible control in the UI (navbar/side-menu preferred).

- **Fee Payment Integration**
  - Secure, digital payment flows for PCC fees: integration with local banks’ mobile channels, mobile money, or e-wallet services.
  - No hidden or “platform” fees; only official government PCC fees should be communicated at all stages of the user journey.
  - Visual clarity around amounts due and payment confirmation.

- **Document & Data Management**
  - Users have access to their history of applications and uploaded documents, with each file linked to the respective application.
  - Download links for all documents after successful submission or issuing.

- **Accessibility & Device Compatibility**
  - Responsive layout supporting desktop, tablet, and mobile devices, including low-end smartphones and feature phones (web browser).
  - Font sizes, contrasts, and color use must ensure readability for all user groups.

---

### For Administrators & Officers

- **Admin Dashboard**
  - Comprehensive dashboard to view, filter, and search all PCC applications across users.
  - Summary tables, charts, and analytics for key system metrics:
    - Number of applications in various statuses (pending, approved, etc.)
    - Historical trends (e.g., by month)
    - Payment statistics (total collected, payment methods utilized)
    - System usage and user activity indicators

- **Full Access to User Data & Applications**
  - Listings for all user accounts and applications (including ability to drill down into any specific record).
  - Viewing of all uploaded documentation associated with an application.
  - Ability to approve, reject, or otherwise process applications, including issuing or revoking certificates.

- **Digital Certificate Issuance & Delivery**
  - Admins must be able to issue digitally signed PDF e-PCCs and arrange direct digital delivery to users and/or 3rd parties (e.g., agents, employers).

- **System Management Tools**
  - Capabilities for managing user roles, overall system configuration, and audit controls.
  - Audit log feature for tracking significant actions (application editing, approval/rejection, user management).
  - Technical documentation and admin training materials to be made available as part of the software delivery.

- **Security and Data Integrity**
  - Collaboration with VPF and OGCIO for hosting, security hardening, and compliance.
  - Secure handling of digital documents, user data, and application processing.

---

## 3. Analytics Requirements

- **Visual Analytics**
  - Graphical or tabular representations of both user and system-wide metrics (applications per status, payment volumes, application durations, monthly or regional trend charts).
- **Reporting and Export**
  - Admin dashboards must support data export for management or regulatory reporting.

---

## 4. Theme, Branding, and Visual Design Guidelines

- **General Visual Style**
  - Simple, modern, clean, and professional user interface emphasizing trust and credibility for a government service.
  - Branding must center around a navy blue color scheme, with possible hex colors in the range #1E2A38 to #1976D2.
  - Minimal cartoonish icons—visuals should be official and institutional rather than playful.

- **Color & Layout**
  - Primary: Navy Blue (for headers/nav/sidebar), with appropriate accent and link colors (e.g., blue, green for positive actions).
  - Secondary: Light greys and whites for clean content areas, ensuring high contrast and legibility.
  - All content, buttons, and form controls must meet WCAG accessibility standards.

- **Layout and Navigation**
  - Top navigation bar for major sections (dashboard, applications, notifications, etc.).
  - Sidebar (on desktop or large tablet) for quick navigation relevant to user role; mobile-friendly collapsible menu.
  - Dashboard landing pages for both users and admins; visually rich with analytics and immediate actions.

- **Language Toggle**
  - Prominent and quick-to-access UI element for switching between Bislama and English.

- **Minimalistic Sidebar/Menu**
  - Side navigation should be grouped logically by workflow/use case; avoid clutter.

---

## 5. Other Technical and User-Support Requirements

- **Digital Delivery Options**
  - UI must allow users/admins to select delivery options for certificates, including secure email or direct submission to agent/employer.
- **Payment Transparency**
  - All payment flows, including external digital payment integrations, must clearly display the official fee and that no additional platform charges exist.
- **Support, Training, and Handover**
  - Technical manuals for admin/support and end-user guides with step-by-step visuals.
  - Staff handover and training to be considered as part of rollout.

---

## 6. Deliverables From RFP

_Note: Not all are UI, but they constrain documentation and UX:_
- ePCC web and Android app prototypes discussed and agreed with OGCIO/VPF.
- Complete documentation, user/admin training, and awareness guides with visuals.
- Bi-weekly reporting structure (feedback loops).
- Security, user privacy, and compliance requirements to be met.

---

## 7. Summary Checklist for Frontend & Admin Dashboard

- [x] Modern navy blue-based theme.
- [x] Responsive, accessible layouts for user and admin dashboards.
- [x] User dashboard: application status, analytics, activity, notifications.
- [x] Admin dashboard: all users, all applications, filter/search, analytics, audit trails.
- [x] Integration with mobile money/bank payment flows—no extra charges.
- [x] Digital upload and delivery (PDF/email/agent).
- [x] Multilingual/Bislama & English support.
- [x] Prominent language toggle, clear navigation.
- [x] Admin/user documentation and UAT/feedback cycles included.

---

_Last updated: Extracted from RFP/FJI10-017-2021 Vanuatu Police Force ePCC web/mobile application (UNDP/UNCDF, 2021)._

