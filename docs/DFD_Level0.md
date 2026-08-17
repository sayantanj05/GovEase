# GovEase AI – Level 0 Data Flow Diagram (Context Diagram)

## Overview
This document contains the Mermaid.js source code to render the Level 0 DFD for GovEase AI. The diagram illustrates the system boundary, external entities, and primary data flows.

---

## Rendering Instructions
1. Copy the Mermaid code block below.
2. Paste it into any Mermaid-supported renderer:
   - VS Code with **Markdown Preview Mermaid** extension
   - [Mermaid Live Editor](https://mermaid.live/)
   - GitHub/GitLab markdown renderer
   - [Mermaid CLI](https://github.com/mermaid-js/mermaid-cli)

---

## Mermaid.js Code

```mermaid
flowchart LR
    subgraph S [GovEase AI Platform]
        P1((Central Process))
    end

    EU[End User]
    GP[Government Portals & APIs]
    AD[Admin / Content Manager]
    NS[Notification Services]
    AI[AI / OCR Services]
    CS[Calendar Services]

    EU -->|Profile Data, Documents, Applications, Preferences| P1
    P1 -->|Recommendations, Eligibility Results, Pre-filled Forms, Status Updates| EU

    GP -->|Opportunities, Exams, Schemes, Official Links, Deadlines| P1
    P1 -->|Eligibility Checks, Data Verification Requests| GP

    AD -->|Manage Content, Verify Opportunities, Update Status, Resolve Disputes| P1
    P1 -->|Audit Logs, Reports, Verification Status| AD

    P1 -->|Notification Payloads (Email, Push)| NS
    NS -->|Delivery Confirmations, Bounces| P1

    P1 -->|Document Images, Profile Images| AI
    AI -->|Extracted Text, Structured Data, AI Responses| P1

    P1 -->|Calendar Events, Reminders| CS
    CS -->|Event Confirmations, Reminder Triggers| P1
```

---

## Legend & Explanation

| Element | Description |
|---------|-------------|
| **GovEase AI Platform** | The system boundary enclosing the central intelligent assistant process |
| **End User** | Individuals who create profiles, apply for opportunities, and track applications |
| **Government Portals & APIs** | Official sources providing jobs, exams, schemes, and application links |
| **Admin** | Internal users who manage, verify, and curate platform content |
| **Notification Services** | Email, WhatsApp, and push notification delivery channels |
| **AI Services** | Document processing, eligibility analysis|
| **Calendar Services** | Deadline reminders and calendar integration |

---

## Data Flow Descriptions

### Inbound Flows (Into the System)
- **Profile Data, Documents, Applications, Preferences** – User-submitted information for profile creation and maintenance
- **Opportunities, Exams, Schemes, Official Links, Deadlines** – Raw data ingested from government sources
- **Manage Content, Verify Opportunities, Update Status, Resolve Disputes** – Administrative actions and content curation
- **Delivery Confirmations, Bounces** – Feedback from notification channels
- **Extracted Text, Structured Data, AI Responses** – Processed outputs from AI/OCR pipelines
- **Event Confirmations, Reminder Triggers** – Responses from calendar integrations

### Outbound Flows (From the System)
- **Recommendations, Eligibility Results, Pre-filled Forms, Status Updates** – Personalized outputs delivered to users
- **Eligibility Checks, Data Verification Requests** – Validation queries sent to government sources
- **Audit Logs, Reports, Verification Status** – Administrative reporting and compliance data
- **Notification Payloads (Email,Push)** – Scheduled and triggered user notifications
- **Document Images, Profile Images** – Inputs sent to AI processing services
- **Calendar Events, Reminders** – Deadline and event data synced to external calendars

---

## Notes
- This is a **Level 0 (Context) DFD**. It does not show internal processes, data stores, or detailed sub-flows.
- Future Level 1 and Level 2 DFDs should decompose the central process into sub-processes (e.g., Profile Management, Eligibility Engine, Notification Service, Document Vault).
- All data flows are logical representations and do not imply specific protocols or APIs.
