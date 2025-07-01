# EPCC (E-Police Certificate) UI/UX, Dashboard, Admin, Analytics, and Theme Requirements – Extracted from RFP

_This document summarizes all relevant user interface, user experience, dashboard features, admin capabilities, analytics, and visual theming requirements directly extracted from the official RFP for the Vanuatu Police Force E-Police Certificate project. The aim is to provide clear, foundational requirements and design guidelines for the frontend/admin and user dashboard implementation and refinement phase._

---

## 1. Platform Scope & Intended Users

### Platforms
- The solution must encompass both a web-based application (accessible on any modern browser, including low-powered and feature phones) and an Android smartphone application.
- Both frontend platforms are required to deliver equivalent core features and user experience.

### User Roles and Stakeholders
- **Applicants/Regular Users:** Vanuatu residents or anyone corresponding with the Vanuatu Police Force for a Police Clearance Certificate (PCC) application. Users may include overseas employment seekers.
- **Administrators/Officers:** Designated staff from the Vanuatu Police Force (VPF), OGCIO, Department of Finance and Treasury (DoFT), and other trusted governmental actors with admin capabilities for processing, system configuration, and oversight.
- **External Certificate Recipients:** Approved third-parties (e.g., agents, overseas employers, immigration authorities) who may receive vetted e-PCCs.

---

## 2. Functional & User Experience Requirements

### General Requirements for All Users
- **Dashboard Access:** Authenticated users are presented with a dashboard that summarizes their in-progress and past applications, statuses, document access, and notification center.
- **24/7 Submission & Status Tracking:** Permit round-the-clock PCC submissions and real-time status tracking.
- **Digital Document Handling:** Users can upload all required application documents electronically and, upon eligibility, view/download issued e-PCCs in digital/PDF format.
- **Delivery Preferences:** Users may specify how and where digital PCCs are delivered, including by secure email or direct to an agent/employer.
- **Process Feedback:** Form submission provides step-specific feedback and validation, making application progress visibly clear.
- **Real-time Notifications:** Immediate or near-immediate notification and dashboard indications for any application status change (pending, approved, rejected, issued).
- **Payment Integration:** Secure, cashless payments for PCC fees via local banks' mobile channels, mobile wallets, and e-money providers; exclude any additional charges beyond the prevailing official PCC fee.
- **Multilingual/Bilingual UI:** Full interface support for both Bislama (default) and English. Users must be able to easily toggle the language from a prominent component (ideally in the navbar or sidebar).
- **Document & History Access:** Historical access to application records and uploaded documents, with well-organized download links.
- **Accessibility & Responsiveness:** Highly responsive, touch-friendly layout that also reads well on desktops, tablets, and the lowest-end smartphones and feature phones. Font sizing, contrast, and all UI patterns must suit users with varying needs.
- **No Hidden Fees:** The UI must make explicit that there are no platform or unofficial surcharges at any stage.

---

### Additional Admin and Officer Requirements

- **Comprehensive Admin Dashboard:** A centralized, powerful dashboard providing:
  - full visibility into all applications (with advanced filtering and search)
  - summary tables, metrics, and analytics visualizations: application statuses, historical trends, payment statistics, and overall engagement indicators.
  - access to all user accounts and their applications, in-depth record details/drilldown, and document management.
  - Application decision tools for approve/reject/issue/revoke processes.
- **Certificate Issuance & Digital Delivery:** Ability for admins to issue digitally signed PDF PCCs, with workflow to deliver them directly to the user and/or any designated third party.
- **Role-Based Controls:** Full capability for admin/officer role management, audit logging, and system configuration. This includes tracking significant actions like application updates and user management.
- **System Auditing:** Clear audit trails and logs of all sensitive and system-level actions.

---

## 3. Analytics, Reporting and Export

- Provide graphical/tabular analytics for core system metrics: applications per status, payment volumes, average processing times, and time-series trends (e.g., monthly/region breakdowns).
- Admin interfaces must allow export (CSV or similar) for reporting to management and regulatory authorities.

---

## 4. Theme, Branding, and Visual Design

- **Professional Navy Blue Theme:** Brand and base theme should emphasize official navy blue colors—reference hex range: #1E2A38 to #1976D2 (best practice: select a primary navy blue plus one lighter blue accent).
- **Minimalist, Modern, Gov-Institutional Aesthetic:** Layout should be clean, simple, and suit governmental credibility (avoid playful/cartoon elements).
- **Color Usage and Layout Standards:**
  - Navy blue for headers/nav/sidebar and action buttons
  - Light greys and whites for main content backgrounds, with clearly differentiated accent and link colors (e.g., green for positive actions)
  - All backgrounds, text, buttons, and controls must meet at least AA WCAG accessibility standards for color contrast.
- **Navigation and Layout:**
  - Top navigation bar must provide access to dashboard, applications, notifications, and account features.
  - Sidebar navigation should group functions by workflow and role, and should collapse for mobile.
  - Dashboard landing page (distinct for both user and admin) should present analytics and immediate actions in a visually engaging way.
- **Prominent Language Toggle:** Always-visible, easy-to-use switch for Bislama/English in a consistent navbar or menu location.
- **Consistency and Legibility:** All icons, buttons, and input elements should be harmonized to promote usability.

---

## 5. Technical, Security, and Support Requirements

- **Digital Delivery Flexibility:** User/admin interface must let users select how certificates are distributed (e.g., via secure email, direct agent/employer transfer).
- **Payment Transparency:** UI must reinforce that only the official government fee is ever collected.
- **User/Admin Training and Documentation:** The delivered solution must include both technical admin manuals and visual end-user guides. Staff training and handover should be designed into the launch/rollout plan, documented with step-by-step visuals.
- **Security:** System must be designed and administered in close consultation with VPF and OGCIO to ensure resilient hosting, data integrity, applicant privacy, and secure document handling.
- **Maintenance and Handover:** Ongoing updates/maintenance for 8 months post launch, and full handover to local experts (incl. docs).

---

## 6. Deliverables (Summary for UI/UX Designers and Developers)

- **Wireframes and Prototypes:** Multiple iterative prototypes (minimum three) tested with stakeholders—covering all principal user and admin flows, dashboard, document upload/download, payment, notification, and certificate issuance.
- **Documentation:** Full technical and end-user documentation, including visual guides, system architecture, and troubleshooting.
- **Staff Training Manuals:** Training content for hands-on walkthroughs.
- **Reporting Structures:** Bi-weekly report cycles and feedback integration.

---

## 7. Summary Checklist

- [x] Navy blue government theme, no cartoonish elements.
- [x] Responsive, accessible layouts (desktop, tablet, mobile, feature phone).
- [x] User dashboard: applications, status, activity, notifications.
- [x] Admin dashboard: all user applications, search/filter, analytics, audit logs.
- [x] Digital payments, no unofficial or hidden charges, payment via local/online channels.
- [x] Secure document upload/download and digital delivery choices.
- [x] Bislama/English switch prompt and always available.
- [x] Full user and admin documentation with step visuals.
- [x] Quick onboarding, staff handover, and training supported.

---

_Last updated: Directly extracted and interpreted from RFP/FJI10-017-2021 Vanuatu Police Force ePCC web/mobile application, UNDP/UNCDF, 2021._

