(function () {
  "use strict";

  const STORAGE_KEYS = {
    workspace: "ztaWorkspaceContent",
    theme: "ztaTheme",
    readOnly: "ztaReadOnly",
    autocomplete: "ztaAutocomplete",
    apiKey: "ztaGeminiApiKey",
    chatMessages: "ztaChatMessages",
    chatConversation: "ztaChatConversation",
    attachments: "ztaAttachmentSummaries",
    chatVisible: "ztaChatVisible",
    sessions: "ztaChatSessions",
    activeSessionId: "ztaActiveChatSessionId",
    lastProfileId: "ztaLastProfileId"
  };
  const GUEST_PROFILE_ID = "guest";
  const PROFILES = [
    { id: GUEST_PROFILE_ID, name: "Guest", displayName: "Guest", supportAgent: "", guest: true, accent: "linear-gradient(135deg, #29434e 0%, #6d8891 100%)" },
    { id: "arthur-mejia", name: "Arthur Mejia", displayName: "Arthur", supportAgent: "Arthur Mejia", accent: "linear-gradient(135deg, #2374e1 0%, #5aa0ff 100%)", image: "images/csarth.png", position: "center 62%" },
    { id: "carl-angelo-cequena", name: "Carl Angelo Cequena", displayName: "Carl", supportAgent: "Carl Angelo Cequena", accent: "linear-gradient(135deg, #f4b400 0%, #ffd65a 100%)", image: "images/brimstone.png", position: "center 36%" },
    { id: "jacob-labor", name: "Jacob Labor", displayName: "Jacob", supportAgent: "Jacob Labor", accent: "linear-gradient(135deg, #e53935 0%, #ff6d6a 100%)", image: "images/sova.png", position: "center 34%" },
    { id: "john-axel-acal", name: "John Axel Acal", displayName: "Axel", supportAgent: "John Axel Acal", accent: "linear-gradient(135deg, #00695c 0%, #4db6ac 100%)", image: "images/csaxel.png", position: "center 60%" },
    { id: "john-vincent-anis", name: "John Vincent Anis", displayName: "JV", supportAgent: "John Vincent Anis", accent: "linear-gradient(135deg, #6a1b9a 0%, #9c4dcc 100%)", image: "images/phoenix.png", position: "center 40%" },
    { id: "mauris-mananzan", name: "Mauris Mananzan", displayName: "Mauris", supportAgent: "Mauris Mananzan", accent: "linear-gradient(135deg, #3949ab 0%, #7986cb 100%)", image: "images/kayo.png", position: "center 40%" },
    { id: "ramuel-panganiban", name: "Ramuel Panganiban", displayName: "Ramuel", supportAgent: "Ramuel Panganiban", accent: "linear-gradient(135deg, #ef6c00 0%, #ffb74d 100%)", image: "images/chamber.png", position: "center 38%" },
    { id: "romnick-catap", name: "Romnick Catap", displayName: "Nick", supportAgent: "Romnick Catap", accent: "linear-gradient(135deg, #00838f 0%, #4dd0e1 100%)", image: "images/sfnick.png", position: "center 58%" }
  ];
  const PROFILE_SCOPED_STORAGE_KEYS = new Set([
    STORAGE_KEYS.workspace,
    STORAGE_KEYS.theme,
    STORAGE_KEYS.readOnly,
    STORAGE_KEYS.autocomplete,
    STORAGE_KEYS.chatMessages,
    STORAGE_KEYS.chatConversation,
    STORAGE_KEYS.attachments,
    STORAGE_KEYS.chatVisible,
    STORAGE_KEYS.sessions,
    STORAGE_KEYS.activeSessionId
  ]);

  const DEFAULT_THEME = "ace/theme/github_light_default";
  const DEFAULT_WORKSPACE = `Paste the ticket details, email content, monitoring alert, customer request, images, or bridge-call notes here.

Example input:
- customer/company name
- ticket number
- affected host, VM, IP, job, or application
- exact error or alert
- impact and urgency
- images

The assistant will generate:
1. Zoho ticket auto-fill
2. Viber Details/Zoho Comment on Ticket for initial troubleshooting
`;
  const EMPTY_INCIDENT_PROMPT = "Please paste the ticket details, email content, alert, request, images, or bridge-call notes so I can generate the Zoho ticket auto-fill.";
  const BRIDGE_TRIGGER_PATTERNS = [
    /bridge call/i,
    /screensharing/i,
    /screen sharing/i,
    /what should i ask\/open\/click next/i,
    /what should i ask next/i,
    /help me identify the next step/i,
    /here is the next screenshot/i,
    /can l1\/l1\.5 still continue triage/i,
    /is this for l1\/l1\.5 or escalate to l2/i
  ];
  const QA_TRIGGER_PATTERNS = [
    /^\s*(why|how|what|which|when|where|who|is|are|do|does|can|should|could|would|explain|clarify)\b/i,
    /\?\s*$/,
    /\bwhy\b/i,
    /\bexplain\b/i,
    /\bclarify\b/i,
    /\bwhat do you mean\b/i,
    /\bis this\b/i,
    /\bshould this\b/i
  ];
  const GENERATION_TRIGGER_PATTERNS = [
    /\bcreate ticket\b/i,
    /\bgenerate\b.*\bticket\b/i,
    /\bupdate\b.*\bticket\b/i,
    /\bregenerate\b/i,
    /\bmake\b.*\bzoho\b/i,
    /\bconvert\b.*\bticket\b/i,
    /\bdraft\b.*\bticket\b/i
  ];
  const PROMPT_ONLY_MARKERS = [
    "execution instruction — do not review this prompt",
    "zoho desk ticket auto-fill assistant — production system prompt",
    "required output format",
    "embedded customer database — may 2026",
    "[paste incident details here]"
  ];
  const ZOHO_GENERATOR_PROMPT = String.raw`# EXECUTION INSTRUCTION — DO NOT REVIEW THIS PROMPT

This text is not a prompt review request.

When this prompt is pasted, immediately act as the Zoho Desk Ticket Auto-Fill Assistant.

Goal: Automatically generate a Zoho ticket auto-fill from the provided ticket details, email content, monitoring alert, customer request, images, or bridge-call notes.

Do not ask what the user wants to do.
Do not offer options.
Do not explain, review, rate, summarize, or improve this prompt unless the user explicitly asks for prompt editing.
Do not say the prompt is solid, production-ready, or ask what the goal is.

If ticket details are included, immediately generate:

1. Zoho ticket auto-fill
2. Viber Details/Zoho Comment on Ticket for initial troubleshooting

If no ticket details are included, ask only this exact question:

Please paste the ticket details, email content, alert, request, images, or bridge-call notes so I can generate the Zoho ticket auto-fill.

You are a production-grade Zoho Desk ticket auto-fill assistant.

Required behavior:
- Extract only supported fields.
- Use the embedded customer databases below as authoritative.
- Never invent customer, account, SE, PM/SD, severity, priority, or category values.
- Follow the severity matrix in this prompt.
- Return deterministic structured output.

Required standard output:
- Return only one Markdown text code block.
- Keep the exact field order:
Customer Company Name:
Account Name:
Subject:
Description:
Ticket Category:
Issue Category:
Issue Subcategory:
Severity:
Priority:
Supported Portfolio:
Solutions:
SE's that can handle this ticket:
PM/SD of this account:

Viber Details/Zoho Comment on Ticket for initial troubleshooting:
- The Viber Details/Zoho Comment output must use a full structured block, not a short bullet-only summary.
- Use this exact subsection shape inside the same code block:
  Viber Details/Zoho Comment on Ticket for initial troubleshooting:
  New <Incident/Request> Ticket
  Issue/Request: <clear operational summary>
  Initial Troubleshooting:
  • <L1/L1.5-safe action actually based on visible ticket, screenshot, or alert details>
  • <L1/L1.5-safe action actually based on visible ticket, screenshot, or alert details>
  Next Action: <single escalation or monitoring sentence>
  Possible Triage:
  • <source or screenshot review instruction>
  • <if/then decision instruction>
  • <client confirmation or recent-change question>
  • <Teams/Zoom or screenshot instruction when more visibility is needed>
  • <L2/assigned SE initial-assistance instruction>
  • <stop-and-escalate boundary>
- Do not end the Viber section after 2 or 3 short bullets.
- Do not replace the named subsections with flat top-level bullets for normal ticket generation.

Solutions rules:
- Use Solutions: SI for implementation, migration, deployment, project activity, maintenance activity, and scheduled technical work.
- Use Solutions: MS for managed support, monitoring, backup operations, storage incidents, and other operational support tickets.

Bridge call / screenshot triage mode:
- If the user explicitly asks for live triage help during a bridge call, screenshot review, or asks what to open/click next, return only:
Bridge Call / Screenshot Triage:
Observed Issue:
Next Safe Step for L1/L1.5:
Capture/Document:
Escalation Decision:

If no usable incident or request details are present, return only:
Please paste the ticket details, email content, alert, request, images, or bridge-call notes so I can generate the Zoho ticket auto-fill.

Use these customer/account alias mappings when applicable:
- EWB -> East West Bank
- BPITC -> BPI Tokyo Century
- PSE -> Philippine Stock Exchange
- GMA / GMA (ICT) / GMA (MAMS) -> GMA Network Inc.
- SunLife -> Sunlife
- Radius -> RADIUS TELECOMS INC.
- CebAir -> Cebu Air, Inc.
- NatRe / Natre -> National Reinsurance Corp.
- Honda Cars / Honda Phils. Inc -> HONDA
- First Sumiden Circuits Inc. -> First Sumiden
- COL Financial -> COL
- Department of Energy -> DOE
- PHIC -> PhilHealth
- Okada -> Okada Manila
- Angeles Electric Corp / AEC -> ANGELES ELECTRIC
- AMDOCS / AMDOCS-SMART -> Amdocs Philippines, Inc.
- Smart -> SMART
- PLDT / ePLDT -> ePLDT
- UHRI -> Universal Hotels and Resorts Inc.
- SMIC -> SM Investment
- EMD Technology Philippines Inc. -> EMD
- Watsons -> WATSONS
- Bureau of the Treasury -> BOTR

Customer/company output rules:
- Resolve only one customer/company label in the final workspace output when one account is clearly identified.
- Do not emit combined labels such as SMART/E-PLDT/AMDOCS in final output.
- If the source input points to AMDOCS, output Customer Company Name: Amdocs Philippines, Inc.
- If the source input points to SMART, output Customer Company Name: SMART.
- If the source input points to PLDT or ePLDT, output Customer Company Name: ePLDT.
- For database matching only, you may still use the embedded account aliases and enrolled-account rows to find the correct SE and PM/SD.

Account Name rule:
- Use <Customer Company Name> - Sandz when a customer is identified.
- For AMDOCS-specific cases, output Account Name: AMDOCS - Sandz.
- Build Account Name from the resolved single customer/company label, not from a combined alias.
- Account Name remains part of the workspace output for reference, but the Create Ticket autofill does not populate manual-only Zoho fields such as Department, Account Name, Contact Name, Email, Phone, or Mobile Number.

SE and PM/SD matching rules:
- Resolve SE's that can handle this ticket from the SI and MS Customer Database.
- Resolve PM/SD of this account only from the Enrolled Accounts Database.
- Match Account + Product/Project first before Account-only matching.
- For generic, informational, or documentation requests with no clear product/project clue, fall back to the most consistent Primary SE / Secondary SE pair for the matched account.
- Prefer MS rows for managed support, monitoring, backup operations, storage incidents, and other operational support tickets.
- Prefer SI rows for implementation, migration, deployment, and one-time project delivery work.
- Use newest year only as a tie-breaker after Account + Product/Project + SI/MS relevance.
- Use account-level fallback before outputting N/A when the embedded SI/MS data contains a consistent SE pair for the matched account.
- Do not output SE's that can handle this ticket: N/A when a valid matching SI/MS row exists in the embedded database.
- For GMA backup or storage-capacity incidents, select the best matching GMA SI/MS row from the embedded database instead of defaulting to N/A.

Subject rules:
- If the ticket is SI-classified, use subject prefix SANDZ-SI.
- Otherwise, use subject prefix SANDZ-MSDCO.
- Resolve one subject customer label only; do not combine SMART, ePLDT, and AMDOCS in one subject when one account is clearly identified.
- Do not wrap the customer label or SubjectName in parentheses.
- If ticket number exists:
<Subject Prefix>-<Subject Customer Label>-<SubjectName>. Ticket No. #<ticket number>
- Otherwise:
<Subject Prefix>-<Subject Customer Label>-<SubjectName>.
- For scheduled activities and other date-sensitive planned work, include the schedule in the subject when it is clearly stated and operationally important.
- Scheduled activity base format:
<Subject Prefix>-<Subject Customer Label>-<Activity Name>.
- Scheduled activity dated format:
<Subject Prefix>-<Subject Customer Label>-Activity | <Activity Name> (<date/time window>)
- Example AMDOCS output:
Customer Company Name: Amdocs Philippines, Inc.
Account Name: AMDOCS - Sandz
Subject: SANDZ-SI-AMDOCS-Power Drain Activity.
- Example AMDOCS output with schedule:
Subject: SANDZ-SI-AMDOCS-Activity | Power Drain Activity (May 25, 2026 10PM-5AM)
- Build SubjectName from the main issue pattern, not from a generic backup phrase.
- Prefer the clearest technical symptom first, then the most useful named object if it materially improves clarity.
- If one named job, repository, policy, SOBR, tier, or protected object is clearly central to the issue, include it in SubjectName.
- If two closely related named jobs or repositories are clearly central and still fit cleanly, include both, such as SOBR_ISCSI and SOBR_ISCSI2 Offload Failure.
- If many jobs, servers, or workloads share the same failure mode, summarize the scope instead of listing hosts one by one.
- Do not enumerate long server lists in SubjectName; keep host-by-host detail in Description.
- Avoid vague SubjectName values such as Backup Issue, Backup Failure, or Capacity Tier Issue when the ticket shows a more precise failure pattern.
- Keep SubjectName concise, formal, and usually around 6 to 12 words when possible.
- Prefer this subject construction order:
  primary failure mode
  most relevant named backup object, repository, or tier
  summarized scope only when multiple workloads are affected
- For backup offload or capacity-tier incidents:
  - if local repository pressure or near-full storage is the strongest visible cause, prefer wording around repository capacity or offload blockage
  - if S3-compatible or capacity-tier connection failure is the strongest visible cause, prefer wording around capacity-tier or S3 offload connection failure
  - if both are clearly present, combine them concisely instead of listing every affected host
- Preferred subject examples:
  - SOBR_ISCSI and SOBR_ISCSI2 Capacity Tier Offload Failure
  - Multiple Backup Offload Failures Due to Repository Capacity
  - Capacity Tier Offload Failure with S3-Compatible Connection Errors

Always classify Ticket Category as Incident by default; use Request only for clear service/work requests.

Scheduled maintenance mapping rules:
- When the ticket clearly describes planned maintenance work such as power drain activity, maintenance activity, scheduled activity, maintenance window work, or dated planned technical work, output Ticket Category: Request.
- For that same planned-work pattern, output Issue Category: Server - Request.
- For that same planned-work pattern, output Issue Subcategory: Status / Health Report.
- Use the exact Zoho option texts Server - Request and Status / Health Report when generating those values.
- Continue accepting both field labels Issue Subcategory and Issue Sub-Category in the workspace format.

SI classification rules:
- Classify as SI when the request is clearly about implementation, migration, deployment, project activity, maintenance activity, cabling activity, refresh activity, upgrade activity, scheduled technical work, or other one-time delivery work.
- For SI-classified tickets, keep Supported Portfolio aligned to (SI) System Integration when the ticket content supports it.
- For SI-classified tickets, output Solutions: SI and use the SANDZ-SI subject prefix.

Backup incident mapping rules:
- For backup offload failures caused by repository pressure, capacity tier problems, local repository nearly full state, or S3-compatible offload failures, output Supported Portfolio: (BaaS) Backup as a Service.
- For that same incident type, output Issue Category: Storage - Incident.
- For that same incident type, output Issue Subcategory: Capacity Issue.
- Do not classify that incident type as Backup - Incident.
- Do not output raw Issue Subcategory: Offload Failure / Capacity Tier.
- Do not suggest or include retrigger failed backup as a default action phrase for backup incidents.

Global subcategory bans:
- Never use Issue Subcategory: Monitoring in the final workspace output.
- Never use Issue Subcategory: Retrigger failed backup in the final workspace output.
- For planned maintenance, maintenance windows, power drain activity, and other scheduled technical work, use Status / Health Report instead of Monitoring.
- For backup failure-style tickets that would otherwise use Retrigger failed backup, use Reliability Issue instead.

Viber Details / Zoho Comment rules:
- Write the Viber Details/Zoho Comment section from an L1/L1.5-safe perspective only.
- Do not claim direct investigation, direct validation inside the customer environment, or root-cause confirmation unless the ticket explicitly states that L1/L1.5 already performed that action.
- This is a style override, not a field-logic override:
  - keep the current app logic for Issue Category, Issue Subcategory, Severity, Priority, SE mapping, and PM/SD mapping
  - do not revert Storage - Incident / Capacity Issue backup-offload incidents back to Backup - Incident
  - do not change Sev2 priority back to High if current app rules map Sev2 to Medium
  - do not output N/A for SE or PM/SD when the embedded workbook/prompt can resolve them
- Prefer wording such as:
  - Reviewed the ticket-visible alert details
  - Recorded the visible S3-compatible offload errors
  - Noted the visible repository free-space or capacity condition
  - No client-side or console-side changes were performed by L1
- Avoid wording such as:
  - Investigation:
  - Investigated connectivity
  - Determined root cause
  - Verified inside the console
  - Opened the backup console
- For backup offload or capacity-tier incidents, separate visible evidence from likely cause:
  - if repository pressure or near-full capacity is explicitly shown in the alert, state it as visible evidence
  - if S3-compatible connection errors are explicitly shown, state them as visible evidence
  - if the deeper cause is not directly proven, present it as a likely cause or escalation focus, not as an L1-confirmed finding
- If the matched enrolled account does not show Remote Support enabled, do not assume direct console access. Tell L1/L1.5 to ask the client to join Teams/Zoom or provide screenshots of the exact read-only screens needed.
- For GMA / GMA Network Inc., the enrolled account line does not show Remote Support enabled, so default the Possible Triage wording to client-guided screenshare or screenshot collection unless the ticket explicitly states otherwise.
- For backup offload, repository-pressure, S3-compatible, or capacity-tier incidents, prefer a fuller ChatGPT-web-style Viber structure:
  - write Issue/Request as a concise but complete operational summary of the visible issue
  - write Initial Troubleshooting as 3 to 4 bullets based only on visible ticket details, screenshots, alerts, or customer-provided statements
  - write Next Action as one clear escalation sentence to L2/assigned SE
  - write Possible Triage as 5 to 6 operational bullets with similar density to the preferred web output
- For these incidents, Possible Triage should usually include:
  - one screenshot/source review instruction
  - one if/then decision bullet
  - one client confirmation or recent-change question
  - one Teams/Zoom screenshare instruction when more visibility is needed
  - one L2/assigned SE initial-assistance bullet
  - one clear stop-and-escalate boundary
- For GMA backup offload, repository-pressure, S3-compatible, or capacity-tier incidents, prefer Possible Triage wording such as:
  - Ask the client to screenshare the Veeam SOBR/offload session details, exact S3-compatible error, and storage/repository capacity view
  - Ask the client to open read-only History, Session Details, Statistics, Alerts, or Capacity screens without clicking Retry, Apply, Save, or changing settings
  - If multiple offload jobs or repeated runs show the same failure, document broader backup-service degradation and escalate faster
  - Ask L2/assigned SE whether L1/L1.5 should collect more screenshots/logs or escalate immediately
  - Stop L1/L1.5 triage and escalate before any retry, offload rerun, repository change, storage cleanup, policy change, service restart, or console-side remediation

Supported Portfolio keyword guidance:
- backup, acronis, atempo, veeam, arcserve, rubrik -> (BaaS) Backup as a Service
- storage, nas, san, powerstore, unity, netapp, synology -> (ESTaaS) Enterprise Storage as a Service
- compute, server, node -> (CaaS) Compute as a Service
- disaster, dr, draas, replication, failover, zerto -> (DRaaS) Disaster Recovery as a Service
- archive -> (AraaS) Archive as a Service
- on prem -> (OPaaS) On Prem as a Service
- integration, implementation -> (SI) System Integration
- poc -> POC (Proof of Concept)
- otherwise -> (IaaS) Infrastructure as a Service

Severity matrix:
- Sev1 / High:
  Choose Sev1 only when the visible ticket details clearly show production down, backup infrastructure failure, storage or repository inaccessible, DR not functioning, multiple critical systems affected, or no workaround available.
- Sev2 / Medium:
  Choose Sev2 only when the visible ticket details clearly show multiple systems affected, repeated instability across workloads, major degradation of backup/replication/storage service, or meaningful risk to business continuity without full outage.
- Sev3 / Medium:
  Choose Sev3 when the visible ticket details show an isolated issue affecting one host, one source machine, one job, one VM, or one protected asset, while overall service continues and broader impact is not shown.
- Sev4 / Low:
  Choose Sev4 for requests, informational tickets, reports, administrative work, or cases with no service impact.

Severity decision rules:
- Do not raise severity just to be safe.
- Choose the highest severity clearly supported by the visible ticket details only.
- If business impact or affected scope is unknown, do not assume multiple-system impact.
- If the incident shows Failed to connect to source machine and only one source machine or one protected asset is shown, default to Sev3 unless the ticket also shows multiple affected systems, service-wide instability, production outage, or no workaround.
- If multiple source machines, multiple backup jobs, or broader backup-service instability are clearly shown, use Sev2.
- If the backup infrastructure is down, the repository or storage is inaccessible, or multiple critical systems are unprotected with no workaround, use Sev1.

Priority consistency rules:
- When Severity is Sev1, output Priority: High.
- When Severity is Sev2, output Priority: Medium.
- When Severity is Sev3, output Priority: Medium.
- When Severity is Sev4, output Priority: Low.

Embedded Customer Database — May 2026

SI and MS Customer Database:
BCDA | BCDA / Integrated Cloud Backup Project Phase 2 | 2025 | MS | Atempo / Acronis | Aeron Villanueva | EJ Remolona
Honda Cars | Honda Cars / Backup and DR Infra | 2025 | SI | Veeam | CJ Tecson | Aeron Villanueva
PSE | PSE / Data Storage Refresh | 2024 | SI | Dell | Danilo Damiles | JP Doblado
First Sumiden Circuits Inc. | NAS Storage Project Phase 2 | 2025 | SI | Synology | Danilo Damiles | JP Doblado
SunLife | Sunlife / PowerStore Upgrade for WMS | 2025 | SI | Dell | Danilo Damiles | JP Doblado
Angeles Electric Corp | AEC Veeam Subscription License Renewal | 2025 | SI | Veeam | EJ Remolona | Lery Ponce
First Sumiden Circuits Inc. | Supply and Service of CCTV NAS Storage Project Phase 1 | 2025 | SI | Synology | Danilo Damiles | JP Doblado
Orix | Orix - Zerto Back up and Replication | 2024 | SI | Zerto | Lery Ponce | EJ Remolona
SunLife | SUNLIFE / CRS | 2024 | SI | Dell | Danilo Damiles | JP Doblado
GMA (ICT) | GMA AMS Server | 2024 | SI | HPE | CJ Tecson | Aeron Villanueva
Smart | Smart Cloud Tech Refresh | 2022 | SI | HPE | Danilo Damiles | JP Doblado
PLDT | PLDT Cloud Tech Refresh | 2022 | SI | HPE | Danilo Damiles | JP Doblado
Okada | Dell EMC Unity 480F | 2022 | SI | DellEMC | Danilo Damiles | JP Doblado
Okada | Dell EMC Maintinance | 2022 | SI | DellEMC | Danilo Damiles | JP Doblado
Okada | Arcserve | 2022 | SI | DellEMC | Danilo Damiles | JP Doblado
SunLife | Sunlife - IDPA Upgrade | 2022 | SI | DellEMC | Danilo Damiles | JP Doblado
Okada | Netapp MA 2022 | 2023 | SI | WSI | Danilo Damiles | JP Doblado
Okada | Dell VPlex and MDS MA | 2023 | SI | DellEMC | Danilo Damiles | JP Doblado
Okada | Okada Arcserve MA |  | SI |  | Danilo Damiles | JP Doblado
NatRe | NatRe BaaS | 2025 | MS | Veeam | CJ Tecson | EJ Remolona
Radius | Radius BSC Site Prod | 2022 | MS | BaaS (Veeam & Zadara) | CJ Tecson | Aeron Villanueva
Radius | Radius TIM Site DR | 2022 | MS | BaaS (Veeam & Zadara) | CJ Tecson | Aeron Villanueva
Honda Phils. Inc | Honda Phils. Inc IaaS |  | MS | Zadara | Edmund Malpas | Mike Coloma
EWB | EWB MA Renewal w/ Expansion and Enhancement |  | MS | Zadara | Lery Ponce | Aeron Villanueva
EWB | EWB 70TB Rental - TIM |  | MS |  | Lery Ponce | Aeron Villanueva
GMA (ICT) | GMA 10G Switch |  | SI |  | CJ Tecson | EJ Remolona
SunLife | Sun Life Unity Upgrade VMK 30TB | 2022 | SI | DELLEMC | Danilo Damiles | Carl Bautista
SunLife | Sun Life IDPA 5800 VMK 45TB | 2023 | SI | Dell IDPA 5800 Drives | Danilo Damiles | Carl Bautista
OCD NDRRMC | OCD NDRRMC IaaS POC |  |  | IAAS POC | Danilo Damiles | JP Doblado
PSE | PSE VMax DR Drill Activity | 2023 | MS | DR Drill Activity | Danilo Damiles | JP Doblado
SunLife | Sun Life Airgap/CRS | 2022 | SI | Dell: VXrail, IDPA | Danilo Damiles | Carl Bautista
Smart | Smart DMS Expansion | 2022 | SI |  | Danilo Damiles | Carl Bautista
GMA (MAMS) | GMA Quantum StoreNext Migration |  | SI |  | CJ Tecson | EJ Remolona
GMA (MAMS) | GMA RP4VM and Relocation | 2022 | SI |  | CJ Tecson | EJ Remolona
GMA (ICT) | GMA Exchange Server | 2022 | SI |  | CJ Tecson | EJ Remolona
GMA (MAMS) | GMA VxRail | 2022 | SI | DellEMC | CJ Tecson | EJ Remolona
Smart | Smart - Speed Test | 2022 | SI | HPE | Danilo Damiles | Carl Bautista
Smart | Smart - Network Monitoring Tool | 2022 | SI | HPE | Danilo Damiles | Carl Bautista
GMA (ICT) | GMA - Airwave | 2022 | SI | HPE | CJ Tecson | EJ Remolona
SunLife | Sun Life PowerStore PS1000T Storage | 2022 | SI | DellEMC | Danilo Damiles | Carl Bautista
SunLife | Sun Life Unity 480F Upgrade - VMK | 2022 | SI | DellEMC | Danilo Damiles | Carl Bautista
SunLife | Sun Life Unity 480F Upgrade - VCK | 2022 | SI | DellEMC | Danilo Damiles | Carl Bautista
SunLife | Sun Life Unity IDPA 5800 Upgrade - VMK | 2022 | SI | DellEMC | Danilo Damiles | Carl Bautista
Okada | VPLEX MDS MA Renewal | 2023 | SI | Dell | Danilo Damiles | JP Doblado
Okada | ArcServe MA Renewal | 2023 | SI | ArcServe | Danilo Damiles | JP Doblado
Okada | Additional VDI Server | 2023 | SI | DellEMC | Danilo Damiles | JP Doblado
Smart | Smart CNP POV |  | SI | DellEMC | Danilo Damiles | JP Doblado
Smart | Smart AirGap POV |  | MS | AirGap | Danilo Damiles | JP Doblado
Smart | Smart RPA BOTS POV |  | MS | Zadara IaaS | Danilo Damiles | JP Doblado
Bayad Center | Bayad Center |  | SI | HPE Proliant Servers | Danilo Damiles | Carl Bautista
Okada | NetApp Refresh Phase II | 2023 | SI | NetApp | Danilo Damiles | JP Doblado
GMA | Dell VxRail P670F HCI - Application/Database Infra | 2023 | SI | DellEMC | CJ Tecson | EJ Remolona
Okada | Okada Rack Server MA | 2023 | SI | DellEMC | Danilo Damiles | JP Doblado
Okada | Rackmount server for VDI | 2023 | SI | VDI Servers | Danilo Damiles | JP Doblado
SunLife | Sun ife Unity 480F Upgrade for RPA VCK | 2023 | SI | Dell Unity Drives | Danilo Damiles | JP Doblado
Okada | Dell ECS | 2023 | SI | DellEMC | Danilo Damiles | JP Doblado
UHRI | UHRI Phase 2 PDC and SDC Upgrade | 2023 | SI | DellEMC | Danilo Damiles | Carl Bautista
Okada | NetApp Refresh | 2023 | SI | WSI | Danilo Damiles | JP Doblado
Okada | Okada Blade Server |  | SI |  | Danilo Damiles | JP Doblado
Chinabank | Chinabank BaaS 3.5 | 2026 | MS | BaaS | Lery Ponce | JP Doblado
PVAO | PVAO (Lot 4: PowerEdge R750 Server) | 2024 | SI | Dell | Danilo Damiles | Carl Bautista
PVAO | PVAO (Lot 5: NetShelter SX 48U Rack Cabinet) | 2024 | SI | Dell | Danilo Damiles | Carl Bautista
BCDA | BCDA (Integrated Cloud Backup Project) | 2023 | MS | Arrosoft Atempo | Aeron Villanueva | EJ Remolona
NDRRMC | NDRRMC (Infrastructure as a Service) |  | MS | IaaS | Danilo Damiles | Carl Bautista
JG SUMIT HOLDINGS, INC. | JG Summit |  | SI | VMWare | Lery Ponce | Aeron Villanueva
GMA | Dell VxRail P670F HCI - Application/Database Infra | 2023 | SI | DellEMC | CJ Tecson | EJ Remolona
UHRI | UHRI New Server and Upgrade of Storage Switch Upgrade IT-Audit and Cyber Security | 2024 | SI | Dell | Danilo Damiles | Carl Bautista
SunLife | SunLife Powerstore & Data Domain |  | SI | Dell | Danilo Damiles | Carl Bautista
PSE | PSE |  | SI | Dell | Danilo Damiles | JP Doblado
Smart | Smart Consumer Care - Simplivity - 3rd Node | 2024 | SI | HPE | Danilo Damiles | Carl Bautista
Smart | RAFM - Smart Yr1 Expansion MA Renewal | 2027 | SI | Dell | Danilo Damiles | Carl Bautista
GMA (MAMS) | GMA / CMOSD Dell Assets MA Batch 1 (01Jan2024 - Dec2024) | 2024 | SI | Dell | CJ Tecson | EJ Remolona
GMA (MAMS) | GMA / Quantum i6000 MA Renewal (19May2024 - | 2024 | SI | Quantum | CJ Tecson | EJ Remolona
AMDOCS-SMART | AMDOCS - EMC GDF CLARK IDC - TR2 TOPUP21 YR6 MA (VMAX 250) | 2024 | SI | Dell | Danilo Damiles | Carl Bautista
AMDOCS-SMART | AMDOCS - VMAX950F - Optima DR MA (Apr 2026 - Dec 2026) | 2026 | SI | Dell | Danilo Damiles | Carl Bautista
CebAir | CEBAIR / DRUVA | 2024 |  |  | CJ Tecson | EJ Remolona
GMA (ICT) | GMA - BAS Network Refresh, Enterprise Network Upgrade PH3, Additional requirements | 2024 |  |  | CJ Tecson | EJ Remolona
GMA (ICT) | GMA - ICT File Server + Post Prod Simplivity 325 with upgrades | 2024 |  |  | CJ Tecson | EJ Remolona
Okada | NetApp Upgrade | 2024 | SI | NetApp | Danilo Damiles | JP Doblado
BPITC | BPITC Y1 | 2024 | MS | Zadara Iaas Rackware | JP Doblado | CJ Tecson
OCD | OCD / Procurement of PhilAWARE System Subscription Services | 2024 | MS | Zadara IaaS | Danilo Damiles | 
UHRI | UHRI Gaming Infra | 2024 | SI | Dell | Danilo Damiles | JP Doblado
UHRI | UHRI - AML | 2024 | SI | Dell | Danilo Damiles | JP Doblado
COL Financial | COL Financial | 2024 | SI | Dell | Lery Ponce | JP Doblado
Okada | Okada UCS Refresh Project | 2024 | SI | Dell | Danilo Damiles | JP Doblado
COL Financial | COL Financial | 2024 | SI | Dell | Lery Ponce | JP Doblado
SunLife | SUNLIFE / POWERSTORE AND DATA DOMAIN | 2024 | SI | Dell | Danilo Damiles | Carl Bautista
Angeles Electric Corp | AEC / HyperConverged Infrastructure for Prod and DR Site | 2024 | SI | Nutanix & Aruba | Danilo Damiles | EJ Remolona
SunLife | SUNLIFE / CRS Upgrade | 2024 | SI | Dell | Danilo Damiles | Carl Bautista
SunLife | SUNLIFE / Powerstore Upgrade | 2024 | SI | Dell | Danilo Damiles | Carl Bautista
Orix | Orix - Zerto Back up and Replication | 2024 | SI | Zerto | Lery Ponce | JP Doblado
SunLife | SUNLIFE / PowerStore,DPS and DD Upgrade (P1000T, P3200T, DD6900) | 2024 | SI | Dell | Danilo Damiles | Carl Bautista
UHRI | UHRI - Domain Server | 2024 | SI | Dell | Danilo Damiles | JP Doblado
Okada | Okada - Laundry Management System | 2025 | SI | Dell | Danilo Damiles | JP Doblado
UHRI | UHRI - Gaming Infra II | 2024 | SI | Dell | Danilo Damiles | JP Doblado
UHRI | UHRI - Offsite Server | 2024 | SI | Dell | Danilo Damiles | JP Doblado
Oona | Oona - Veeam Back up and Replication | 2024 | SI | VST | Danilo Damiles | Lery Ponce
SMIC | SMIC - Zerto Hardware and Software Implementation | 2024 | SI | Zerto | Danilo Damiles | Lery Ponce
2GO | 2GO NAS Storage Project | 2025 | SI |  | Danilo Damiles | JP Doblado
Okada | Okada - QA Tech Refresh Project | 2025 | SI | Dell | Danilo Damiles | JP Doblado
Oona | Ooona VEAAM Services |  | SI | VEEAM | Danilo Damiles | Lery Ponce
BPITC | BPITC Y2 | 2024 | MS | Rackware | JP Doblado | CJ Tecson
PSE | PSE TAM Services | 2024 | MS |  | Danilo Damiles | JP Doblado
DSWD | DSWD 4A HCI and Backup Project | 2025 | SI | Nutanix / Atempo | Danilo Damiles | JP Doblado
Okada | Okada MDS Switch | 2025 | SI | Dell | Danilo Damiles | JP Doblado
PHIC | PHIC - Backup Project 2025 | 2025 | SI | VEEAM | Danilo Damiles | Lery Ponce
Travellers | Travellers International - HPE Switch MA | 2025 | SI | HPE / Agrius | Danilo Damiles | Lery Ponce
Okada | Okada - Unity MA | 2025 | SI | Dell | Danilo Damiles | JP Doblado
Card Bank | AMTI - CARD Bank, Inc. Zerto | 2025 | MS | Zerto | Danilo Damiles | Edmund Malpas
Okada | Backup Ugrade | 2024 | SI | Dell | Danilo Damiles | JP Doblado
Okada | ArcServe MA | 2024 | SI | ArcServe | Danilo Damiles | JP Doblado
Okada | Okada - VPLEX MA / Cisco MDS | 2025 | SI | Dell EMC | Danilo Damiles | JP Doblado
PNOC | LOT 2 MA Renewal Storage for PROD (March 1, 2025-Feb 28, 2026) | 2025 | SI |  | Danilo Damiles | Carl Bautista
PNOC | LOT 4 MA Renewal Storage for DR (March 1, 2025-Feb 28, 2026) | 2025 | SI |  | Danilo Damiles | Carl Bautista
PNOC | LOT 5 MA Renewal Storage for DR (March 1, 2025-Feb 28, 2026) | 2025 | SI |  | Danilo Damiles | Carl Bautista
PNOC | EMC MA Renewal |  |  |  | Danilo Damiles | Carl Bautista
CebAir | HPE SVT Ph4 MA Renewal - (Aug 1, 2025 - Jul 30, 2026 | 2025 | SI |  | CJ Tecson | EJ Remolona
SunLife | Unity 550F and RPA MA (June 2025 to May 2026) | 2025 | SI |  | Danilo Damiles | Carl Bautista
SunLife | Unity 480F MA (June 2025 to May 2026) | 2025 | SI |  | Danilo Damiles | Carl Bautista
SunLife | SAN Switches MA (June 2025 - May, 2026) | 2025 | SI |  | Danilo Damiles | Carl Bautista
SunLife | IDPA MA Renewal (Nov 2024-Oct 2025) | 2025 | SI |  | Danilo Damiles | Carl Bautista
Okada | Quantum MA | 2024 | SI | Quantum | Danilo Damiles | JP Doblado
Okada | Okada Quantum MA | 2025 | SI | Quantum | Danilo Damiles | JP Doblado
Okada | Dell PowerEdge MA | 2024 | SI | Dell | Danilo Damiles | JP Doblado
Okada | Okada NetApp AFF A220 MA Renewal | 2025 | SI | NetApp | Danilo Damiles | JP Doblado
Okada | NetApp AFF A220 MA Renewal | 2024 | SI | NetApp | Danilo Damiles | JP Doblado
Okada | Okada - Cisco MDS MA | 2025 | SI | Cisco | Danilo Damiles | JP Doblado
Okada | NetApp AFF A220A MA (October 1 2024 - Sept 30 2025) | 2024 | SI |  | Danilo Damiles | JP Doblado
GMA, (MAMS) | CMOSD Dell Assets MA (VXRAIL P570) - July 2024-July 2025- Dec 2025 (7 mos.) | 2024 | SI |  | CJ Tecson | EJ Remolona
GMA (MAMS) | CMOSD Dell Assets MA (VXRAIL P570) - July 2024-July 2025- Dec 2025 ( 12 mos) | 2024 | SI |  | CJ Tecson | EJ Remolona
GMA (ICT) | HPE ARUBA RAP and AIRWAVE MA (15-July-2024 to 02-Nov-2025) | 2024 | SI |  | CJ Tecson | EJ Remolona
GMA (ICT) | Aruba Airwave MA | 2025 | SI |  | CJ Tecson | EJ Remolona
Smart | RAFM DR MA (Dec 2024-Dec 2025) - Dec-Jan 2025 | 2025 | SI | Dell | Danilo Damiles | JP Doblado
Smart | DMS MA Renewal Nov 2026-Oct 2027 | 2027 | SI |  | Danilo Damiles | JP Doblado
RTVM | Unity MA (April to Dec 2025) 1st month (May) | 2025 | SI |  | Danilo Damiles | JP Doblado
AMDOCS-SMART | VMAX 950 Prod MA (Jan 2026-Dec 2026) | 2026 | SI |  | Danilo Damiles | JP Doblado
AMDOCS-SMART | VMAX 250 MA (Jan 2026-Dec 2026) | 2026 | SI |  | Danilo Damiles | JP Doblado
BPI ECM | BPI ECM Refresh (Data Trust) |  | MS | Datatrust | Kit Jolly | Jed Trinidad
BPI | BPI STaaS |  |  |  | Carl Bautista | Yellie Condes
CebAir | CEBAIR / DRUVA | 2024 | SI | Druva | CJ Tecson | EJ Remolona
First Sumiden Circuits Inc. |  | 2025 | SI | Synology | Danilo Damiles | JP Doblado
First Sumiden Circuits Inc. | NAS Storage Project Phase 4 | 2025 | SI | Synology | Danilo Damiles | JP Doblado
First Sumiden Circuits Inc. | Sangfor Virtualization Subscription Project | 2025 | SI | Sangfor | Danilo Damiles | Renato Napare
Natre | DMS with Gen AI Platform Project | 2025 | SI | ReN3 | CJ Tecson | EJ Remolona
SunLife | Sunlife PowerStore Upgrade For WMS | 2025 | SI | Dell | Danilo Damiles | Carl Bautista
COL Financial | Col Financial Pampanga Servers | 2025 | SI | Dell | Danilo Damiles | JP Doblado
COL Financial | Col Financial Pampanga 3 Servers | 2025 | SI | Dell | Dan Damiles | JP Doblado
2GO | 2GO / Storage Expansion | 2025 | SI | Synology | Danilo Damiles | JP Doblado
EMD Technology Philippines Inc. | HPE Proliant Server MA | 2025 | SI | HPE/Thakral | Danilo Damiles | JP Doblado
Department of Energy | Procurement of Backup Software License Maintenance and Support Services for CY2025 for ITMS-ITD | 2025 | SI | Acronis | Lerry Ponce | CJ Tecson
DSWD | DSWD NHTO | 2025 | SI | Nutanix / Dell | Danilo Damiles | Carlos Ochoa
DSWD | SYNOLOGY | 2025 | SI | MaxTech / Synology | Danilo Damiles | Carlos Ochoa
JG SUMIT HOLDINGS, INC. | VMware to HyperV Migration | 2025 | MS | Zadara/Zerto | Carlos Ochoa | Lery Ponce
Department of Energy | Procurement for Four (4) Units of Network Attached Storage for ITMS | 2025 | MS | MaxTech/Synology | CJ Tecson | Joseph Trinidad
Department of Energy | Procurement of Four (4) Units of Rack Servers for the DOE Networks Infrastructure System | 2025 | MS | HPE | CJ Tecson | Joseph Trinidad
EMD Technology Philippines Inc. | NAS Storage | 2025 | MS | VST / Qnap | Danilo Damiles | Carl Bautista
Watsons | Zerto for Disaster Recovery Site | 2025 | MS | Zerto Licence | Lery Ponce | Dan Damiles
MCX | Back Up Project | 2025 | SI |  | Danilo Damiles | Carl Bautista
Oona | Veeam MA Project | 2025 | SI |  | Lery Ponce | Aeron Villanueva
Oona | Server MA Renewal project | 2025 | SI |  | Lery Ponce | Aeron Villanueva
Oona | VMware MA Project | 2025 | SI |  | Lery Ponce | Aeron Villanueva
CebAir | Workspace One | 2025 | SI |  | CJ Tecson | EJ Remolona
SunLife | IDPA 5800 MA (November 2025 to October 2026) | 2025 | MS |  | Danilo Damiles | Carl Bautista
GMA (MAMS) | MAMS VXRail MA | 2025 | SI |  | CJ Tecson | EJ Remolona
Angeles Electric Corp | Nutanix hardware storage upgrade | 2025 | SI |  | Danilo Damiles | 
Okada | VMWARE Subscription - 1520 licenses | 2025 | SI |  | Danilo Damiles | JP Doblado
CebAir | SVT Refresh (option: Lenovo route - dropped high cost) - GREENLAKE - Bill#21 | 2025 | SI |  | CJ Tecson | EJ Remolona
SunLife | SAN CONSOLIDATION PROJECT (**) | 2025 | SI | Dell | Danilo Damiles | Carl Bautista
Okada | Dell Airgap | 2025 | SI | Dell | Danilo Damiles | JP Doblado
Orix | Additional HPE Server | 2025 | SI |  | Danilo Damiles | Lery Ponce
Orix | Additional Storage Backup Management | 2025 | SI |  | Danilo Damiles | Lery Ponce
SunLife | DP4400 and Cybersense License - new license 20TB | 2026 | SI | DellEMC/Thakral | Danilo Damiles | Carl Bautista
SunLife | PowerStore P3200 Upgrade (40TB) for VMK | 2025 | SI | Dell | Danilo Damiles | Carl Bautista
SunLife | DD 6900 Upgrade 45TB for VMK | 2025 | SI | DellEMC | Danilo Damiles | Carl Bautista
GMA | Dell MA (Servers and Switches) | 2025 | SI | Dell | CJ Tecson | EJ Remolona
AMDOCS-SMART | Giraffee_DMS MA ( Nov 2025 - Oct 2026) | 2025 | SI | Dell | Dan Damiles | Carl Bautista
AMDOCS-SMART | RAFM APP/DEB/WEB/ML PROD AND DR (UDP) MA Renewal | 2027 | SI | DellEMC | Dan Damiles | Carl Bautista
AMDOCS-SMART | Giraffee_RAFM DR MA (Dec 2026 - Dec 2027) | 2027 | SI |  | Dan Damiles | Carl Bautista
AMDOCS-SMART | PLDT AIA MA Renewal (October - April) | 2026 | SI |  | Dan Damiles | Carl Bautista
GMA | VMWare Subsciption (MAMS<,POST) | 2026 | SI |  | CJ Tecson | EJ Remolona
GMA | HPE Aruba Core Switch MA (1/1/26-1/1/7) | 2026 | SI |  | CJ Tecson | EJ Remolona
Wilcon Depot Inc. | Veeam VUL Project | 2026 | SI |  | Danilo Damiles | EJ Remolona
Wilcon Depot Inc. | Sangfor Virtualization Project | 2026 | SI |  | Danilo Damiles | EJ Remolona
Bureau of the Treasury | Supply and Installation of a Network Data Storage Server for the Bureau of the Treasury / ITB-26-2025-G |  |  |  | Jed Trinidad | CJ Tecson
DPWH | Active Directory Monitoring Tool |  |  |  | Danilo Damiles | JP Doblado
AMDOCS-SMART | EOSL SDT Tech Ref HW (MX) MA Renewal | 2027 | SI |  | Dan Damiles | 
AMDOCS-SMART | Robotic Analytics System MA Renewal | 2027 | SI |  | Dan Damiles | 
AMDOCS-SMART | EMM HPE MA Renewal | 2027 | SI | HPE | Dan Damiles | 
AMDOCS-SMART | IT OSS Virtualized Infra Hardware MA | 2027 | SI |  | Dan Damiles | 
AMDOCS-SMART | RedHat Renewal | 2027 | SI |  | Dan Damiles | 

Enrolled Accounts Database:
East West Bank | PM/SD Lian | Remote Support enabled
BPI | PM/SD Lian
SMART/E-PLDT/AMDOCS | PM/SD Cha | Remote Support enabled | Event Monitoring enabled
RADIUS TELECOMS INC. | PM/SD Cha | Remote Support enabled | Event Monitoring enabled | Storage enabled
CHINABANK | PM/SD Cha
BCDA | PM/SD Lian | Remote Support enabled | Event Monitoring enabled
GMA Network Inc. | PM/SD Cha
Cebu Air, Inc. | PM/SD Cha
National Reinsurance Corp. | PM/SD Cha
HONDA | PM/SD Lian
DSWD | PM/SD 4A - Lian / Main - Cha
First Sumiden | PM/SD Lian
Philippine Stock Exchange | PM/SD Lian
Oona | PM/SD Lian
Sunlife | PM/SD Lian
COL | PM/SD Cha
BPI Tokyo Century | PM/SD Lian
DOE | PM/SD Lian
PhilHealth | PM/SD Cha
PNOC | PM/SD Cha
Universal Hotels and Resorts Inc. | PM/SD Lian
SM Investment | PM/SD Lian
Okada Manila | PM/SD Lian
ANGELES ELECTRIC | PM/SD Lian
Orix | PM/SD Cha
EMD | PM/SD Lian
WATSONS | PM/SD Cha
BOTR | PM/SD Lian`;

  const ZOHO_QA_PROMPT = String.raw`You are a senior L3-style IT support engineer answering questions for L1/L1.5 technicians.

Your job in this mode is to answer questions about the current ticket, workspace, customer/account mapping, SE selection, PM/SD mapping, subject formatting, category/subcategory choice, severity, priority, supported portfolio, triage logic, likely cause, safer next steps, workaround ideas, replacement options, escalation timing, and whether specific workspace field values are really the best choice for this ticket.

Response style:
- Answer in plain text, not a Zoho ticket code block, unless the user explicitly asks to generate or regenerate the ticket.
- Sound like an L3 engineer internally, but explain things clearly enough for L1/L1.5 to act on them safely.
- Do not use Markdown bold, italic, headings, or decorative emphasis such as **text**, *text*, or # headers.
- Do not use decorative conversational openers such as That is a fair question or Great question.
- Use simple plain-text section labels like Current Value:, Better Option:, Why:, Best Recommendation:.
- If you need bullets, use simple plain-text bullets with a leading hyphen.
- Prefer short sectioned answers when the topic is operational. Use sections like:
  Likely Cause
  What L1/L1.5 Can Do Now
  What to Ask the Client
  What to Capture
  When to Escalate
- When the user is challenging or reviewing a classification field, prefer short review sections like:
  Current Value
  Better Option
  Why
  When to Keep the Current Value
- If more than one option is plausible, also include:
  Other Valid Options
  Best Recommendation
- If the question is simple, you may answer more briefly, but keep the wording direct and easy to follow.

What you should help with:
- Explain why a specific customer mapping, SE mapping, PM/SD mapping, category, subcategory, severity, priority, or supported portfolio was chosen.
- Explain why one classification is better than another, such as Storage - Incident versus Backup - Incident.
- Review whether a current workspace field value is defensible or whether a better option exists.
- Recommend better inputs when the user questions fields such as Supported Portfolio, Ticket Category, Issue Category, Issue Sub-Category, Technology/Platform, and Severity Level.
- Compare candidate options briefly and explain which one best fits the specific ticket.
- Interpret symptoms, alerts, logs, and ticket details to suggest likely causes.
- Suggest safe next steps for L1/L1.5, including what to validate, what read-only screens to ask the client to open, what screenshots/logs/details to gather, and what to tell L2/SE.
- If the user asks for alternatives, replacement suggestions, workaround ideas, or safer options, compare them briefly and call out tradeoffs and supportability.

Field-review rules:
- Reason from the current ticket details, current workspace, embedded mappings, allowed category/subcategory choices, supported portfolio rules, and severity matrix already available in the application context.
- For Ticket Category, compare only Incident versus Request.
- For Issue Category and Issue Sub-Category, compare only against allowed values from the embedded ticket rules; do not invent new categories or subcategories.
- For Supported Portfolio, compare only against the supported portfolio mapping rules already embedded.
- For Severity Level, compare against the embedded severity matrix and explain what business impact or scope detail is driving the level.
- For severity review questions, do not escalate just to be safe; compare the current case against the Sev2 and Sev3 criteria and recommend the level that is actually supported by the visible details.
- For source-machine connection failures, treat a single affected host or single protected asset as Sev3 by default unless the ticket clearly shows broader impact, multiple affected systems, service-wide instability, production outage, or no workaround.
- For Technology/Platform, if the user asks about it, explain whether it is genuinely useful, ambiguous, or better left untouched for that specific ticket context.
- If the current value is acceptable but not ideal, say so clearly.
- If the current ticket lacks enough detail to make a strong recommendation, say exactly what missing detail would change the decision.
- Prefer the minimum missing detail needed to improve the field choice, such as:
  one job versus multiple jobs
  backup workflow issue versus repository/storage-capacity issue
  warning-only versus active service degradation
  operational support versus one-time service request

Safety boundaries:
- Do not pretend direct access exists.
- Do not assume L1/L1.5 can make admin changes, restart services, reconfigure systems, retrigger jobs, or perform destructive actions unless the ticket explicitly says that action was approved and is in scope.
- Respect Remote Support and screenshare limitations already established by the ticket logic.
- If the answer depends on missing ticket details, say exactly what is missing.
- Do not overwrite or restate the full ticket unless the user explicitly asks for a new/generated ticket output.

Severity answer structure:
- When the user asks whether a ticket really deserves a severity level, prefer these short sections:
  Current Severity
  Better Severity
  Why
  What Would Change It
`;

  const state = {
    initialized: false,
    latestFileName: "ticket-workspace.txt",
    fileHandle: null,
    history: [],
    historyIndex: -1,
    historyTimer: null,
    suppressHistoryCapture: false,
    diffRecords: [],
    selectedDiffIndex: null,
    attachments: [],
    attachmentCounter: 0,
    chatConversation: [],
    chatSessions: [],
    activeSessionId: "",
    suppressSessionPersistence: false,
    isSending: false,
    apiKey: "",
    chatVisible: true,
    activeProfileId: "",
    bootProfileId: "",
    settingsBound: false,
    listenersBound: false
  };

  function $(id) {
    return document.getElementById(id);
  }

  function getProfileById(profileId) {
    return PROFILES.find(function (profile) {
      return profile.id === profileId;
    }) || null;
  }

  function getProfileDisplayName(profile) {
    if (!profile) return "Guest";
    return profile.displayName || profile.name || "Guest";
  }

  function isGuestProfileId(profileId) {
    return profileId === GUEST_PROFILE_ID;
  }

  function getProfileInitials(name) {
    const parts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    return (parts[0] ? parts[0][0] : "G") + (parts[1] ? parts[1][0] : "");
  }

  function getEffectiveProfileId() {
    return state.activeProfileId || state.bootProfileId || getRememberedProfileId() || "";
  }

  function resolveStorageKey(rawKey) {
    if (!rawKey) return null;
    if (!PROFILE_SCOPED_STORAGE_KEYS.has(rawKey)) {
      return rawKey;
    }
    const profileId = getEffectiveProfileId();
    if (!profileId || isGuestProfileId(profileId)) {
      return null;
    }
    return `${rawKey}::${profileId}`;
  }

  function getRememberedProfileId() {
    const profileId = safeLocalStorageGet(STORAGE_KEYS.lastProfileId, "");
    return getProfileById(profileId) && !isGuestProfileId(profileId) ? profileId : "";
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatMessageContent(text) {
    const raw = String(text || "");
    const parts = raw.split(/```/);
    return parts.map(function (part, index) {
      if (index % 2 === 1) {
        return `<pre><code>${escapeHtml(part.replace(/^\w+\n/, ""))}</code></pre>`;
      }
      return escapeHtml(part).replace(/\n/g, "<br>");
    }).join("");
  }

  function showSnackbar(message, timeout) {
    const bar = $("snackbar");
    if (!bar) return;
    bar.textContent = message;
    bar.classList.add("show");
    window.clearTimeout(showSnackbar._timer);
    showSnackbar._timer = window.setTimeout(function () {
      bar.classList.remove("show");
    }, timeout || 4200);
  }

  function safeLocalStorageGet(key, fallback) {
    const resolvedKey = resolveStorageKey(key);
    if (!resolvedKey) return fallback;
    try {
      const value = localStorage.getItem(resolvedKey);
      return value === null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function safeLocalStorageSet(key, value) {
    const resolvedKey = resolveStorageKey(key);
    if (!resolvedKey) return;
    try {
      localStorage.setItem(resolvedKey, value);
    } catch (error) {}
  }

  function safeLocalStorageRemove(key) {
    const resolvedKey = resolveStorageKey(key);
    if (!resolvedKey) return;
    try {
      localStorage.removeItem(resolvedKey);
    } catch (error) {}
  }

  function getGlobalLocalStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function setGlobalLocalStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {}
  }

  function removeGlobalLocalStorage(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {}
  }

  function cleanupLegacyProfileApiKeys() {
    PROFILES.forEach(function (profile) {
      removeGlobalLocalStorage(`${STORAGE_KEYS.apiKey}::${profile.id}`);
    });
  }

  function createSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function createSessionRecord(name, workspace, chatMessages, chatConversation) {
    const now = new Date().toISOString();
    return {
      id: createSessionId(),
      name: String(name || "").trim() || "Chat 1",
      workspace: String(workspace || DEFAULT_WORKSPACE),
      chatMessages: String(chatMessages || ""),
      chatConversation: Array.isArray(chatConversation) ? chatConversation : [],
      createdAt: now,
      updatedAt: now
    };
  }

  function getActiveSession() {
    return state.chatSessions.find(function (session) {
      return session.id === state.activeSessionId;
    }) || null;
  }

  function getNextSessionName() {
    let index = 1;
    const names = new Set(state.chatSessions.map(function (session) {
      return String(session.name || "");
    }));
    while (names.has(`Chat ${index}`)) {
      index += 1;
    }
    return `Chat ${index}`;
  }

  function saveSessionStore() {
    state.chatSessions.sort(function (a, b) {
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    });
    safeLocalStorageSet(STORAGE_KEYS.sessions, JSON.stringify(state.chatSessions));
    safeLocalStorageSet(STORAGE_KEYS.activeSessionId, state.activeSessionId || "");
  }

  function markActiveSessionUpdated() {
    const session = getActiveSession();
    if (!session) return;
    session.updatedAt = new Date().toISOString();
    saveSessionStore();
  }

  function updateSessionControls() {
    const select = $("chatSessionSelect");
    const renameBtn = $("renameChatSessionBtn");
    const deleteBtn = $("deleteChatSessionBtn");
    if (!select) return;

    select.innerHTML = "";
    state.chatSessions.forEach(function (session) {
      const option = document.createElement("option");
      option.value = session.id;
      option.textContent = session.name || "Untitled Chat";
      if (session.id === state.activeSessionId) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    if (renameBtn) renameBtn.disabled = !state.chatSessions.length;
    if (deleteBtn) deleteBtn.disabled = !state.chatSessions.length;
  }

  function applySessionToUi(session) {
    if (!session) return;
    state.suppressSessionPersistence = true;
    state.chatConversation = Array.isArray(session.chatConversation)
      ? session.chatConversation.slice()
      : [];
    if (window.editor) {
      window.editor.setValue(String(session.workspace || DEFAULT_WORKSPACE), -1);
      window.lastSavedCode = getEditorText();
    }
    if ($("chat-messages")) {
      $("chat-messages").innerHTML = String(session.chatMessages || "");
      $("chat-messages").scrollTop = $("chat-messages").scrollHeight;
    }
    state.suppressSessionPersistence = false;
    updateSessionControls();
  }

  function initializeChatSessions() {
    let sessions = [];
    try {
      const parsed = JSON.parse(safeLocalStorageGet(STORAGE_KEYS.sessions, "[]"));
      if (Array.isArray(parsed)) {
        sessions = parsed.map(function (session, index) {
          const fallbackName = `Chat ${index + 1}`;
          return {
            id: session && session.id ? String(session.id) : createSessionId(),
            name: String(session && session.name || fallbackName).trim() || fallbackName,
            workspace: String(session && session.workspace || DEFAULT_WORKSPACE),
            chatMessages: String(session && session.chatMessages || ""),
            chatConversation: Array.isArray(session && session.chatConversation) ? session.chatConversation : [],
            createdAt: String(session && session.createdAt || new Date().toISOString()),
            updatedAt: String(session && session.updatedAt || session && session.createdAt || new Date().toISOString())
          };
        });
      }
    } catch (error) {
      sessions = [];
    }

    if (!sessions.length) {
      sessions = [createSessionRecord(
        "Chat 1",
        safeLocalStorageGet(STORAGE_KEYS.workspace, DEFAULT_WORKSPACE),
        safeLocalStorageGet(STORAGE_KEYS.chatMessages, ""),
        (function () {
          try {
            const parsedConversation = JSON.parse(safeLocalStorageGet(STORAGE_KEYS.chatConversation, "[]"));
            return Array.isArray(parsedConversation) ? parsedConversation : [];
          } catch (error) {
            return [];
          }
        }())
      )];
      safeLocalStorageRemove(STORAGE_KEYS.workspace);
      safeLocalStorageRemove(STORAGE_KEYS.chatMessages);
      safeLocalStorageRemove(STORAGE_KEYS.chatConversation);
    }

    state.chatSessions = sessions;
    const storedActiveId = safeLocalStorageGet(STORAGE_KEYS.activeSessionId, "");
    state.activeSessionId = sessions.some(function (session) {
      return session.id === storedActiveId;
    }) ? storedActiveId : sessions[0].id;
    saveSessionStore();
    applySessionToUi(getActiveSession());
  }

  function getInitialWorkspaceContent() {
    try {
      const sessions = JSON.parse(safeLocalStorageGet(STORAGE_KEYS.sessions, "[]"));
      const activeId = safeLocalStorageGet(STORAGE_KEYS.activeSessionId, "");
      if (Array.isArray(sessions) && sessions.length) {
        const activeSession = sessions.find(function (session) {
          return session && session.id === activeId;
        }) || sessions[0];
        if (activeSession && typeof activeSession.workspace === "string") {
          return activeSession.workspace || DEFAULT_WORKSPACE;
        }
      }
    } catch (error) {}
    return safeLocalStorageGet(STORAGE_KEYS.workspace, DEFAULT_WORKSPACE);
  }

  function getStoredTheme() {
    return safeLocalStorageGet(STORAGE_KEYS.theme, DEFAULT_THEME);
  }

  function updateDocumentTitle() {
    const fileLabel = state.latestFileName && state.latestFileName !== "ticket-workspace.txt"
      ? state.latestFileName
      : "Untitled";
    const profile = getProfileById(state.activeProfileId);
    const profileLabel = profile ? ` - ${getProfileDisplayName(profile)}` : "";
    document.title = `${fileLabel} - Zoho Desk Ticket Assistant BETA${profileLabel}`;
  }

  function updateProfileStatusUi() {
    const status = $("profileStatus");
    const name = $("activeProfileName");
    const profile = getProfileById(state.activeProfileId);
    if (!status || !name) return;
    if (!profile) {
      status.hidden = true;
      name.textContent = "Guest";
      return;
    }
    status.hidden = false;
    name.textContent = getProfileDisplayName(profile);
  }

  function showProfileChooser() {
    const overlay = $("profileOverlay");
    document.body.classList.add("profile-locked");
    if (overlay) {
      overlay.style.display = "flex";
    }
    state.activeProfileId = "";
    state.bootProfileId = "";
    updateProfileStatusUi();
    updateDocumentTitle();
  }

  function hideProfileChooser() {
    const overlay = $("profileOverlay");
    document.body.classList.remove("profile-locked");
    if (overlay) {
      overlay.style.display = "none";
    }
  }

  function clearRuntimeAttachments() {
    state.attachments.forEach(function (attachment) {
      if (attachment.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
    });
    state.attachments = [];
    state.attachmentCounter = 0;
  }

  function restoreAttachmentSummaries() {
    clearRuntimeAttachments();
    let stored = [];
    try {
      const parsed = JSON.parse(safeLocalStorageGet(STORAGE_KEYS.attachments, "[]"));
      stored = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      stored = [];
    }
    state.attachments = stored.map(function (attachment, index) {
      return {
        id: String(attachment && attachment.id || `attachment-restored-${index + 1}`),
        name: String(attachment && attachment.name || `image-${index + 1}`),
        file: null,
        previewUrl: "",
        status: String(attachment && attachment.status || "ready"),
        ocrText: String(attachment && attachment.ocrText || "")
      };
    });
    state.attachmentCounter = state.attachments.length;
    renderAttachmentTray();
  }

  function refreshSettingsUi() {
    const autocompleteCheckbox = $("toggleLocalCompletion");
    const readOnlyCheckbox = $("toggleReadOnly");
    if (!autocompleteCheckbox || !readOnlyCheckbox) return;

    autocompleteCheckbox.checked = getStoredBoolean(STORAGE_KEYS.autocomplete, false);
    readOnlyCheckbox.checked = getStoredBoolean(STORAGE_KEYS.readOnly, false);

    if (window.editor) {
      window.editor.setOptions({
        enableBasicAutocompletion: autocompleteCheckbox.checked,
        enableLiveAutocompletion: autocompleteCheckbox.checked,
        readOnly: readOnlyCheckbox.checked
      });
    }
  }

  function resetChatRuntime() {
    state.chatConversation = [];
    state.chatSessions = [];
    state.activeSessionId = "";
    if ($("chat-messages")) {
      $("chat-messages").innerHTML = "";
    }
    if ($("chat-input")) {
      $("chat-input").value = "";
    }
  }

  function activateProfile(profileId, options) {
    const profile = getProfileById(profileId);
    if (!profile) return;
    const rememberProfile = !profile.guest;

    state.activeProfileId = profile.id;
    state.bootProfileId = profile.id;
    state.fileHandle = null;
    state.latestFileName = "ticket-workspace.txt";

    if (rememberProfile) {
      safeLocalStorageSet(STORAGE_KEYS.lastProfileId, profile.id);
    } else {
      state.bootProfileId = "";
      safeLocalStorageRemove(STORAGE_KEYS.lastProfileId);
    }

    resetChatRuntime();
    initializeChatSessions();
    restoreAttachmentSummaries();
    applyTheme(getStoredTheme());
    setChatVisibility(getStoredBoolean(STORAGE_KEYS.chatVisible, true));
    refreshSettingsUi();
    saveCurrentCodeToHistory(true);
    updateProfileStatusUi();
    updateDocumentTitle();
    hideProfileChooser();

    if (!(options && options.silent)) {
      showSnackbar(`Profile loaded: ${getProfileDisplayName(profile)}.`);
    }
  }

  function logoutProfile() {
    safeLocalStorageRemove(STORAGE_KEYS.lastProfileId);
    clearRuntimeAttachments();
    renderAttachmentTray();
    resetChatRuntime();
    state.activeProfileId = "";
    state.bootProfileId = "";
    state.history = [];
    state.historyIndex = -1;
    state.diffRecords = [];
    state.selectedDiffIndex = null;
    if (window.editor) {
      window.editor.setValue(DEFAULT_WORKSPACE, -1);
      window.lastSavedCode = getEditorText();
    }
    refreshSettingsUi();
    updateHistoryButtonsState();
    showProfileChooser();
    showSnackbar("Logged out of the current profile.");
  }

  function renderProfileChooser() {
    const grid = $("profileGrid");
    if (!grid) return;
    grid.innerHTML = "";
    PROFILES.forEach(function (profile) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `profile-card${profile.guest ? " guest" : ""}`;
      button.setAttribute("data-profile-id", profile.id);

      const avatar = document.createElement(profile.image ? "img" : "div");
      avatar.className = "profile-avatar";
      if (profile.image) {
        avatar.src = profile.image;
        avatar.alt = profile.name;
        avatar.style.objectPosition = profile.position || "center center";
        avatar.style.transform = "";
      } else {
        avatar.style.background = profile.accent;
        avatar.textContent = profile.guest ? "G" : getProfileInitials(profile.name);
      }

      const name = document.createElement("div");
      name.className = "profile-name";
      name.textContent = getProfileDisplayName(profile);

      const meta = document.createElement("div");
      meta.className = "profile-meta";
      meta.textContent = profile.guest ? "Guest profile" : "Support Agent profile";

      button.appendChild(avatar);
      button.appendChild(name);
      button.appendChild(meta);
      button.addEventListener("click", function () {
        activateProfile(profile.id);
      });
      grid.appendChild(button);
    });
  }

  function getActiveSupportAgent() {
    const profile = getProfileById(state.activeProfileId);
    return profile && !profile.guest ? profile.supportAgent : "";
  }

  function getStoredBoolean(key, fallback) {
    const raw = safeLocalStorageGet(key, fallback ? "true" : "false");
    return raw === "true";
  }

  function setChatVisibility(isVisible) {
    const pane = $("workspacePane");
    const chat = $("chatBotContainer");
    if (!pane || !chat) return;

    state.chatVisible = !!isVisible;
    chat.style.display = state.chatVisible ? "block" : "none";
    pane.style.width = state.chatVisible ? "65%" : "100%";
    pane.style.flex = state.chatVisible ? "0 0 65%" : "1 1 auto";
    safeLocalStorageSet(STORAGE_KEYS.chatVisible, String(state.chatVisible));
  }

  function getEditorText() {
    return window.editor && typeof window.editor.getValue === "function"
      ? window.editor.getValue()
      : "";
  }

  function setEditorText(value) {
    if (!window.editor) return;
    window.editor.setValue(String(value || ""), -1);
    persistWorkspace();
  }

  function persistWorkspace() {
    if (state.suppressSessionPersistence) return;
    const session = getActiveSession();
    if (!session) return;
    session.workspace = getEditorText();
    markActiveSessionUpdated();
  }

  function timestampLabel(dateLike) {
    const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
    return isNaN(date.getTime()) ? "" : date.toLocaleString();
  }

  function applyTheme(themeName) {
    if (!window.editor) return;
    window.currentTheme = themeName;
    window.editor.setTheme(themeName);
    document.body.classList.toggle("theme-dark", themeName === "ace/theme/monokai");
    safeLocalStorageSet(STORAGE_KEYS.theme, themeName);
  }

  function openModal() {
    $("modalOverlay").style.display = "flex";
  }

  function closeModal() {
    $("modalOverlay").style.display = "none";
  }

  function openDocumentationModal() {
    $("documentationBody").innerHTML = window.ZOHO_DESK_DOCUMENTATION_HTML || "<p>No documentation is available.</p>";
    $("documentationModal").style.display = "flex";
  }

  function closeDocumentationModal() {
    $("documentationModal").style.display = "none";
  }

  function openApiModal() {
    $("APIKey").value = state.apiKey;
    $("modalApi").style.display = "flex";
    $("APIKey").focus();
  }

  function closeApiModal() {
    $("modalApi").style.display = "none";
    saveApiKey();
  }

  function openClearChatModal() {
    $("clearChatModal").style.display = "flex";
  }

  function closeClearChatModal() {
    $("clearChatModal").style.display = "none";
  }

  function closeDiffModal() {
    $("diffModal").style.display = "none";
    state.selectedDiffIndex = null;
  }

  function toggleDisplayChatBotContainer() {
    setChatVisibility(!state.chatVisible);
  }

  function toggleTheme() {
    applyTheme(window.currentTheme === "ace/theme/monokai" ? DEFAULT_THEME : "ace/theme/monokai");
  }

  function saveApiKey() {
    state.apiKey = String($("APIKey").value || "").trim();
    setGlobalLocalStorage(STORAGE_KEYS.apiKey, state.apiKey);
  }

  function getApiKey() {
    return state.apiKey || getGlobalLocalStorage(STORAGE_KEYS.apiKey, "");
  }

  function ensureApiKeyForAiAction() {
    if (getApiKey()) return true;
    openApiModal();
    showSnackbar("Add your Gemini API key to continue.");
    return false;
  }

  function createDownload(content, fileName) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName || state.latestFileName || "ticket-workspace.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 500);
  }

  async function saveToFile() {
    const content = getEditorText();
    persistWorkspace();

    if ("showSaveFilePicker" in window) {
      try {
        if (!state.fileHandle) {
          state.fileHandle = await window.showSaveFilePicker({
            suggestedName: state.latestFileName,
            types: [{
              description: "Text files",
              accept: {
                "text/plain": [".txt", ".md"]
              }
            }]
          });
        }

        const writable = await state.fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
        state.latestFileName = state.fileHandle.name || state.latestFileName;
        showSnackbar("Workspace saved.");
        return;
      } catch (error) {
        if (error && error.name === "AbortError") {
          return;
        }
      }
    }

    createDownload(content, state.latestFileName);
    showSnackbar("Workspace downloaded.");
  }

  function downloadEditorContent() {
    createDownload(getEditorText(), state.latestFileName);
  }

  async function openFileFromPicker() {
    let file = null;

    if ("showOpenFilePicker" in window) {
      try {
        const handles = await window.showOpenFilePicker({
          multiple: false,
          types: [{
            description: "Text files",
            accept: {
              "text/plain": [".txt", ".md", ".log"],
              "application/json": [".json"],
              "text/html": [".html"]
            }
          }]
        });
        state.fileHandle = handles[0];
        file = await handles[0].getFile();
      } catch (error) {
        if (!error || error.name === "AbortError") {
          return;
        }
      }
    }

    if (!file) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".txt,.md,.log,.json,.html,.csv";
      input.addEventListener("change", async function () {
        const selected = input.files && input.files[0];
        if (!selected) return;
        state.latestFileName = selected.name || state.latestFileName;
        const text = await selected.text();
        setEditorText(text);
        saveCurrentCodeToHistory(true);
        window.lastSavedCode = getEditorText();
        updateDocumentTitle();
        showSnackbar("Workspace loaded.");
      }, { once: true });
      input.click();
      return;
    }

    state.latestFileName = file.name || state.latestFileName;
    const text = await file.text();
    setEditorText(text);
    saveCurrentCodeToHistory(true);
    window.lastSavedCode = getEditorText();
    updateDocumentTitle();
    showSnackbar("Workspace loaded.");
  }

  function newFile() {
    state.fileHandle = null;
    state.latestFileName = "ticket-workspace.txt";
    setEditorText(DEFAULT_WORKSPACE);
    saveCurrentCodeToHistory(true);
    window.lastSavedCode = getEditorText();
    updateDocumentTitle();
    showSnackbar("Started a new workspace.");
  }

  function getDiffStats(parts) {
    let added = 0;
    let removed = 0;

    parts.forEach(function (part) {
      const count = part.count || part.value.split(/\r?\n/).filter(Boolean).length;
      if (part.added) added += count;
      if (part.removed) removed += count;
    });

    return { added, removed };
  }

  function renderDiffPane(targetId, parts, type) {
    const pane = $(targetId);
    if (!pane) return;

    const html = parts.map(function (part) {
      const classes = [];
      if (part.added && type === "new") classes.push("added");
      if (part.removed && type === "old") classes.push("removed");
      if ((part.added && type === "old") || (part.removed && type === "new")) {
        return "";
      }
      const value = escapeHtml(part.value || "").replace(/\n/g, "<br>");
      return `<div class="${classes.join(" ")}">${value || "<br>"}</div>`;
    }).join("");

    pane.innerHTML = `<div style="padding:12px; font-family: var(--mono-font); font-size:12px; line-height:1.45;">${html}</div>`;
  }

  function openDiffModal(index) {
    const record = state.diffRecords[index];
    if (!record || !window.Diff) return;

    state.selectedDiffIndex = index;
    const diffParts = window.Diff.diffLines(record.oldContent, record.newContent);
    const stats = getDiffStats(diffParts);
    $("diffStats").textContent = `(+${stats.added} / -${stats.removed})`;
    $("diffTimestamp").textContent = timestampLabel(record.timestamp);
    renderDiffPane("diffOld", diffParts, "old");
    renderDiffPane("diffNew", diffParts, "new");
    $("diffModal").style.display = "flex";
  }

  function restoreFromDiff() {
    if (state.selectedDiffIndex === null) return;
    const record = state.diffRecords[state.selectedDiffIndex];
    if (!record) return;
    setEditorText(record.newContent);
    saveCurrentCodeToHistory(true);
    closeDiffModal();
    addMessage("Restored workspace content from a saved diff.", "ai");
  }

  function recordChange(oldContent, newContent) {
    if (String(oldContent || "") === String(newContent || "")) {
      return null;
    }

    const record = {
      oldContent: String(oldContent || ""),
      newContent: String(newContent || ""),
      timestamp: new Date().toISOString()
    };

    state.diffRecords.push(record);
    return state.diffRecords.length - 1;
  }

  function updateHistoryButtonsState() {
    const previousBtn = $("previousCodeBtn");
    const nextBtn = $("nextCodeBtn");
    if (previousBtn) previousBtn.disabled = state.historyIndex <= 0;
    if (nextBtn) nextBtn.disabled = state.historyIndex >= state.history.length - 1 || state.history.length === 0;
  }

  function saveCurrentCodeToHistory(force) {
    if (!window.editor || state.suppressHistoryCapture) return;
    const content = getEditorText();
    const current = state.history[state.historyIndex];

    if (!force && current && current.content === content) {
      updateHistoryButtonsState();
      return;
    }

    if (state.historyIndex < state.history.length - 1) {
      state.history = state.history.slice(0, state.historyIndex + 1);
    }

    state.history.push({
      content,
      timestamp: new Date().toISOString()
    });

    if (state.history.length > 100) {
      state.history.shift();
    }

    state.historyIndex = state.history.length - 1;
    updateHistoryButtonsState();
  }

  function navigateHistory(direction) {
    if (!state.history.length) return;
    const nextIndex = state.historyIndex + direction;
    if (nextIndex < 0 || nextIndex >= state.history.length) return;

    state.historyIndex = nextIndex;
    state.suppressHistoryCapture = true;
    window.editor.setValue(state.history[nextIndex].content, -1);
    state.suppressHistoryCapture = false;
    persistWorkspace();
    updateHistoryButtonsState();
    showSnackbar(`Loaded version from ${timestampLabel(state.history[nextIndex].timestamp)}.`);
  }

  function previousCode() {
    navigateHistory(-1);
  }

  function nextCode() {
    navigateHistory(1);
  }

  function addMessage(text, role, options) {
    const container = $("chat-messages");
    if (!container) return;

    const message = document.createElement("div");
    const safeRole = role === "user" ? "user" : role === "restored" ? "restored" : "ai";
    message.className = `message ${safeRole}`;

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.innerHTML = formatMessageContent(text);
    message.appendChild(bubble);

    if (options && (options.footerText || options.diffIndex !== undefined)) {
      const footer = document.createElement("div");
      footer.style.marginTop = "8px";
      footer.style.fontSize = "11px";
      footer.style.color = "#5f6368";

      if (options.footerText) {
        const textNode = document.createElement("div");
        textNode.textContent = options.footerText;
        footer.appendChild(textNode);
      }

      if (options.diffIndex !== undefined && options.diffIndex !== null) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "diff-button";
        button.style.marginTop = "6px";
        button.textContent = "View changes";
        button.setAttribute("data-diff-index", String(options.diffIndex));
        footer.appendChild(button);
      }

      bubble.appendChild(footer);
    }

    container.appendChild(message);
    container.scrollTop = container.scrollHeight;
    persistChatMessages();
  }

  function persistChatMessages() {
    if (state.suppressSessionPersistence) return;
    const session = getActiveSession();
    if (!session) return;
    session.chatMessages = $("chat-messages") ? $("chat-messages").innerHTML : "";
    markActiveSessionUpdated();
  }

  function persistConversation() {
    if (state.suppressSessionPersistence) return;
    const session = getActiveSession();
    if (!session) return;
    session.chatConversation = state.chatConversation.slice();
    markActiveSessionUpdated();
  }

  function setLoading(isLoading) {
    state.isSending = isLoading;
    $("loading-indicator").classList.toggle("active", isLoading);
    $("send-button").disabled = isLoading;
  }

  function buildAttachmentSummary(attachment) {
    return {
      id: attachment.id,
      name: attachment.name,
      status: attachment.status,
      ocrText: attachment.ocrText
    };
  }

  function persistAttachmentSummaries() {
    safeLocalStorageSet(STORAGE_KEYS.attachments, JSON.stringify(state.attachments.map(buildAttachmentSummary)));
  }

  function getCombinedOcrText() {
    return state.attachments
      .filter(function (attachment) {
        return attachment.status === "ready" && String(attachment.ocrText || "").trim();
      })
      .map(function (attachment) {
        return `[${attachment.name}]\n${attachment.ocrText.trim()}`;
      })
      .join("\n\n");
  }

  function updateAttachmentSummaryActions() {
    const count = state.attachments.length;
    $("attachmentCount").textContent = count ? `(${count})` : "";
    $("clearAttachmentsBtn").style.display = count ? "inline-block" : "none";
  }

  function renderAttachmentTray() {
    const tray = $("attachmentTray");
    if (!tray) return;

    updateAttachmentSummaryActions();

    if (!state.attachments.length) {
      tray.innerHTML = "";
      persistAttachmentSummaries();
      return;
    }

    tray.innerHTML = "";
    state.attachments.forEach(function (attachment) {
      const card = document.createElement("div");
      card.className = "attachment-card";

      let thumb;
      if (attachment.previewUrl) {
        thumb = document.createElement("img");
        thumb.className = "attachment-thumb";
        thumb.src = attachment.previewUrl;
        thumb.alt = attachment.name;
      } else {
        thumb = document.createElement("div");
        thumb.className = "attachment-thumb attachment-thumb-placeholder";
        thumb.textContent = "IMG";
      }

      const info = document.createElement("div");
      info.className = "attachment-info";

      const fileName = document.createElement("div");
      fileName.className = "attachment-filename";
      fileName.textContent = attachment.name;

      const badge = document.createElement("span");
      badge.className = `attachment-badge ${attachment.status}`;
      badge.textContent = attachment.status === "processing"
        ? "OCR running"
        : attachment.status === "ready"
          ? "\u2713"
          : "OCR failed";

      info.appendChild(fileName);
      info.appendChild(badge);

      const actions = document.createElement("div");
      actions.className = "attachment-card-actions";

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "card-action-btn danger";
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", function () {
        removeAttachment(attachment.id);
      });

      actions.appendChild(removeButton);

      card.appendChild(thumb);
      card.appendChild(info);
      card.appendChild(actions);
      tray.appendChild(card);
    });

    persistAttachmentSummaries();
  }

  function removeAttachment(id) {
    const index = state.attachments.findIndex(function (attachment) {
      return attachment.id === id;
    });
    if (index === -1) return;

    const item = state.attachments[index];
    if (item.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
    state.attachments.splice(index, 1);
    renderAttachmentTray();
  }

  function clearAttachments() {
    state.attachments.forEach(function (attachment) {
      if (attachment.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
    });
    state.attachments = [];
    renderAttachmentTray();
    showSnackbar("Cleared screenshot attachments.");
  }

  async function runOcr(attachment) {
    if (!window.Tesseract || !attachment.file) {
      attachment.status = "error";
      renderAttachmentTray();
      return;
    }

    try {
      const result = await window.Tesseract.recognize(attachment.file, "eng");
      attachment.ocrText = String(result && result.data && result.data.text || "").trim();
      attachment.status = "ready";
      renderAttachmentTray();
      if (attachment.ocrText) {
        showSnackbar(`OCR completed for ${attachment.name}.`);
      } else {
        showSnackbar(`OCR completed for ${attachment.name}, but no text was found.`);
      }
    } catch (error) {
      attachment.status = "error";
      attachment.ocrText = "";
      renderAttachmentTray();
      showSnackbar(`OCR failed for ${attachment.name}.`);
    }
  }

  function addAttachment(file) {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      return;
    }

    const attachment = {
      id: `attachment-${Date.now()}-${state.attachmentCounter += 1}`,
      name: file.name || `screenshot-${state.attachmentCounter}.png`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: "processing",
      ocrText: ""
    };

    state.attachments.push(attachment);
    renderAttachmentTray();
    runOcr(attachment);
  }

  function handleImageFiles(fileList) {
    Array.from(fileList || []).forEach(addAttachment);
  }

  function getReadyOcrTextOrWarn() {
    const text = getCombinedOcrText();
    if (!text) {
      showSnackbar("No OCR text is ready yet.");
      return "";
    }
    return text;
  }

  function appendOcrToWorkspace() {
    const text = getReadyOcrTextOrWarn();
    if (!text || !window.editor) return;
    const current = getEditorText();
    const separator = current.trim() ? "\n\n" : "";
    setEditorText(current + separator + text);
    saveCurrentCodeToHistory(true);
    showSnackbar("OCR text appended to the workspace.");
  }

  function replaceWorkspaceWithOcr() {
    const text = getReadyOcrTextOrWarn();
    if (!text) return;
    setEditorText(text);
    saveCurrentCodeToHistory(true);
    showSnackbar("Workspace replaced with OCR text.");
  }

  function insertTextIntoWorkspace(text) {
    if (!window.editor) return;
    const selectionRange = window.editor.getSelectionRange();
    window.editor.session.replace(selectionRange, String(text || ""));
    persistWorkspace();
    saveCurrentCodeToHistory(true);
  }

  function insertOcrIntoWorkspace() {
    const text = getReadyOcrTextOrWarn();
    if (!text) return;
    insertTextIntoWorkspace(text);
    showSnackbar("OCR text inserted at the cursor.");
  }

  function sendWorkspaceToAssistant() {
    $("chat-input").value = getEditorText();
    sendMessage();
  }

  function getMeaningfulWorkspaceText() {
    const workspace = getEditorText().trim();
    return normalizeText(workspace) === normalizeText(DEFAULT_WORKSPACE) ? "" : workspace;
  }

  function normalizeText(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^\w\s/-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function detectBridgeCallMode(text) {
    return BRIDGE_TRIGGER_PATTERNS.some(function (pattern) {
      return pattern.test(String(text || ""));
    });
  }

  function detectExplicitGenerationRequest(text) {
    return GENERATION_TRIGGER_PATTERNS.some(function (pattern) {
      return pattern.test(String(text || ""));
    });
  }

  function detectConversationalQAMode(userText, workspaceText, ocrText) {
    const user = String(userText || "").trim();
    if (!user) return false;
    if (detectExplicitGenerationRequest(user)) return false;
    if (!QA_TRIGGER_PATTERNS.some(function (pattern) { return pattern.test(user); })) {
      return false;
    }

    const context = [workspaceText, ocrText].filter(Boolean).join("\n\n");
    return hasUsableIncidentDetails(context) || hasUsableIncidentDetails(user);
  }

  function detectInteractionMode(userText, workspaceText, ocrText) {
    const combined = [workspaceText, ocrText, userText].filter(Boolean).join("\n\n");
    if (detectBridgeCallMode(combined)) return "bridge";
    if (detectConversationalQAMode(userText, workspaceText, ocrText)) return "qa";
    return "standard";
  }

  function looksLikePromptOnly(text) {
    const raw = String(text || "");
    const normalized = normalizeText(raw);
    const matches = PROMPT_ONLY_MARKERS.filter(function (marker) {
      return normalized.includes(normalizeText(marker));
    }).length;
    const placeholderIndex = raw.toLowerCase().indexOf("[paste incident details here]");
    if (matches >= 2 && placeholderIndex !== -1) {
      const trailing = raw.slice(placeholderIndex + "[paste incident details here]".length).trim();
      if (!trailing || trailing === "```" || trailing === "```text") {
        return true;
      }
    }
    return matches >= 3;
  }

  function hasUsableIncidentDetails(text) {
    const raw = String(text || "");
    const normalized = normalizeText(raw);
    if (!normalized) return false;
    if (normalizeText(raw) === normalizeText(DEFAULT_WORKSPACE)) {
      return false;
    }
    if (looksLikePromptOnly(raw)) {
      return false;
    }

    const signals = [
      /ticket no/i,
      /subject:/i,
      /description:/i,
      /customer/i,
      /account/i,
      /incident/i,
      /request/i,
      /alert/i,
      /error/i,
      /failed|failure/i,
      /backup/i,
      /restore/i,
      /zerto|veeam|acronis|atempo|rubrik|arcserve|powerstore|unity|synology|netapp|qnap|zadara/i,
      /\bvm\b|\bip\b|hostname|server/i,
      /screenshot/i,
      /monitoring/i
    ];

    return signals.some(function (pattern) {
      return pattern.test(raw);
    });
  }

  function buildPrompt(userPrompt, mode) {
    const incidentSections = [];
    const workspace = getMeaningfulWorkspaceText();
    const ocrText = getCombinedOcrText().trim();
    const userText = String(userPrompt || "").trim();

    if (workspace && normalizeText(workspace) !== normalizeText(DEFAULT_WORKSPACE)) {
      incidentSections.push("Workspace content:");
      incidentSections.push(workspace);
    }

    if (ocrText) {
      incidentSections.push("OCR text from screenshots:");
      incidentSections.push(ocrText);
    }

    if (userText) {
      incidentSections.push(mode === "bridge"
        ? "Bridge-call or screenshot triage request:"
        : mode === "qa"
          ? "User question about the current ticket/workspace:"
          : "User-provided incident details:");
      incidentSections.push(userText);
    }

    const modeInstruction = mode === "bridge"
      ? "Use Bridge Call / Screenshot Assistance Mode. Return only the bridge-call structure."
      : mode === "qa"
        ? "Use conversational ticket Q&A mode. Answer plainly and do not generate a Zoho ticket code block unless explicitly requested."
        : "Use standard Zoho Desk ticket generation mode. Return only one ```text code block.";

    const sections = [
      mode === "qa" ? ZOHO_QA_PROMPT : ZOHO_GENERATOR_PROMPT,
      modeInstruction,
      "Incident details to process:"
    ];
    sections.push(incidentSections.join("\n\n"));
    return sections.join("\n\n");
  }

  function normalizeAssistantOutput(rawReply, mode) {
    const reply = String(rawReply || "").trim();
    if (!reply) {
      if (mode === "bridge") {
        return "Bridge Call / Screenshot Triage:\nObserved Issue: Unable to determine from the provided details.\nNext Safe Step for L1/L1.5: Ask the client to provide the next screenshot or screenshare the exact read-only error/status page.\nCapture/Document: Record the exact error, timestamp, affected system, and visible status shown on screen.\nEscalation Decision: Ask L2/assigned SE for initial guidance if the next required action is unclear.";
      }
      if (mode === "qa") {
        return "I need a bit more ticket context before I can answer that clearly. Point me to the specific field, mapping, category, severity, priority, or account detail you want explained.";
      }
      return `\`\`\`text\n${EMPTY_INCIDENT_PROMPT}\n\`\`\``;
    }

    if (mode === "bridge") {
      const bridgeMatch = reply.match(/Bridge Call \/ Screenshot Triage:[\s\S]*$/i);
      return bridgeMatch ? bridgeMatch[0].trim() : reply;
    }

    if (mode === "qa") {
      return normalizeQaReply(reply);
    }

    const codeBlockMatch = reply.match(/```text[\s\S]*?```/i) || reply.match(/```[\s\S]*?```/);
    if (codeBlockMatch) {
      const block = codeBlockMatch[0];
      if (/^```text/i.test(block)) {
        return block.trim();
      }
      return block.replace(/^```/, "```text").trim();
    }

    return `\`\`\`text\n${reply}\n\`\`\``;
  }

  function normalizeQaReply(reply) {
    return String(reply || "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/^[ \t]*\*[ \t]+/gm, "- ")
      .replace(/^[ \t]*•[ \t]+/gm, "- ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function extractWorkspaceContentFromReply(replyText) {
    const raw = String(replyText || "").trim();
    if (!raw) return "";

    const fencedMatch = raw.match(/```text\s*([\s\S]*?)```/i) || raw.match(/```\s*([\s\S]*?)```/);
    if (fencedMatch) {
      return String(fencedMatch[1] || "").trim();
    }

    return raw;
  }

  function updateWorkspaceFromAssistantReply(replyText) {
    const content = extractWorkspaceContentFromReply(replyText);
    if (!content) return;
    setEditorText(content);
    saveCurrentCodeToHistory(true);
    window.lastSavedCode = getEditorText();
    showSnackbar("Workspace updated from the latest assistant response.");
  }

  async function fetchGeminiResponse(prompt) {
    const apiKey = getApiKey();
    if (!apiKey) {
      openApiModal();
      throw new Error("Add your Gemini API key to continue.");
    }

    const model = $("my-select-dropdown").value;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: state.chatConversation.concat([{
          role: "user",
          parts: [{ text: prompt }]
        }])
      })
    });

    if (!response.ok) {
      let detail = "";
      try {
        const errorBody = await response.json();
        detail = errorBody && errorBody.error && errorBody.error.message
          ? ` ${errorBody.error.message}`
          : "";
      } catch (error) {}
      throw new Error(`Gemini request failed (${response.status}).${detail}`);
    }

    const payload = await response.json();
    const candidate = payload && payload.candidates && payload.candidates[0];
    const parts = candidate && candidate.content && Array.isArray(candidate.content.parts)
      ? candidate.content.parts
      : [];
    const text = parts
      .map(function (part) { return part.text || ""; })
      .join("\n")
      .trim();

    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    return text;
  }

  async function sendMessage() {
    if (state.isSending) return;
    const input = $("chat-input");
    const userText = String(input.value || "").trim();
    if (!userText) {
      showSnackbar("Enter a message before sending.");
      return;
    }
    if (!ensureApiKeyForAiAction()) {
      return;
    }

    addMessage(userText, "user");
    input.value = "";
    setLoading(true);

    try {
      const workspaceText = getMeaningfulWorkspaceText();
      const ocrText = getCombinedOcrText().trim();
      const combinedInput = [workspaceText, ocrText, userText].filter(Boolean).join("\n\n");
      if (!hasUsableIncidentDetails(combinedInput)) {
        addMessage(EMPTY_INCIDENT_PROMPT, "ai");
        return;
      }

      const mode = detectInteractionMode(userText, workspaceText, ocrText);
      const prompt = buildPrompt(userText, mode);
      const reply = await fetchGeminiResponse(prompt);
      const normalizedReply = normalizeAssistantOutput(reply, mode);
      state.chatConversation.push({
        role: "user",
        parts: [{ text: prompt }]
      });
      state.chatConversation.push({
        role: "model",
        parts: [{ text: normalizedReply }]
      });
      persistConversation();
      addMessage(normalizedReply, "ai");
      if (mode === "standard") {
        updateWorkspaceFromAssistantReply(normalizedReply);
      }
    } catch (error) {
      addMessage(error.message || "The assistant request failed.", "ai");
    } finally {
      setLoading(false);
    }
  }

  function clearChatHistory() {
    $("chat-messages").innerHTML = "";
    state.chatConversation = [];
    persistChatMessages();
    persistConversation();
    closeClearChatModal();
    showSnackbar("Chat history cleared.");
  }

  function switchChatSession(sessionId) {
    if (!sessionId || sessionId === state.activeSessionId) return;
    const nextSession = state.chatSessions.find(function (session) {
      return session.id === sessionId;
    });
    if (!nextSession) return;
    state.activeSessionId = nextSession.id;
    saveSessionStore();
    applySessionToUi(nextSession);
    saveCurrentCodeToHistory(true);
    showSnackbar(`Switched to ${nextSession.name}.`);
  }

  function createChatSession() {
    const name = window.prompt("Name this chat session:", getNextSessionName());
    if (name === null) return;
    const session = createSessionRecord(name, DEFAULT_WORKSPACE, "", []);
    state.chatSessions.push(session);
    state.activeSessionId = session.id;
    saveSessionStore();
    applySessionToUi(session);
    saveCurrentCodeToHistory(true);
    if ($("chat-input")) {
      $("chat-input").value = "";
    }
    showSnackbar(`Created ${session.name}.`);
  }

  function renameChatSession() {
    const session = getActiveSession();
    if (!session) return;
    const nextName = window.prompt("Rename this chat session:", session.name || "");
    if (nextName === null) return;
    session.name = String(nextName || "").trim() || session.name || getNextSessionName();
    markActiveSessionUpdated();
    updateSessionControls();
    showSnackbar(`Renamed chat to ${session.name}.`);
  }

  function deleteChatSession() {
    const session = getActiveSession();
    if (!session) return;
    const confirmed = window.confirm(`Delete "${session.name}"?`);
    if (!confirmed) return;

    if (state.chatSessions.length === 1) {
      state.chatSessions = [createSessionRecord("Chat 1", DEFAULT_WORKSPACE, "", [])];
    } else {
      state.chatSessions = state.chatSessions.filter(function (item) {
        return item.id !== session.id;
      });
    }

    state.activeSessionId = state.chatSessions[0].id;
    saveSessionStore();
    applySessionToUi(getActiveSession());
    saveCurrentCodeToHistory(true);
    if ($("chat-input")) {
      $("chat-input").value = "";
    }
    showSnackbar("Chat session deleted.");
  }

  function bindModalClosers() {
    [
      ["modalOverlay", closeModal],
      ["documentationModal", closeDocumentationModal],
      ["modalApi", closeApiModal],
      ["clearChatModal", closeClearChatModal],
      ["diffModal", closeDiffModal]
    ].forEach(function (entry) {
      const modal = $(entry[0]);
      const closeFn = entry[1];
      modal.addEventListener("click", function (event) {
        if (event.target === modal) {
          closeFn();
        }
      });
    });
  }

  function initializeSettings() {
    const autocompleteCheckbox = $("toggleLocalCompletion");
    const readOnlyCheckbox = $("toggleReadOnly");
    if (!autocompleteCheckbox || !readOnlyCheckbox) return;
    refreshSettingsUi();

    if (state.settingsBound) return;
    state.settingsBound = true;

    autocompleteCheckbox.addEventListener("change", function () {
      const enabled = autocompleteCheckbox.checked;
      safeLocalStorageSet(STORAGE_KEYS.autocomplete, String(enabled));
      if (window.editor) {
        window.editor.setOptions({
          enableBasicAutocompletion: enabled,
          enableLiveAutocompletion: enabled
        });
      }
    });

    readOnlyCheckbox.addEventListener("change", function () {
      const enabled = readOnlyCheckbox.checked;
      safeLocalStorageSet(STORAGE_KEYS.readOnly, String(enabled));
      if (window.editor) {
        window.editor.setReadOnly(enabled);
      }
    });
  }

  function initializeEditorHooks() {
    if (!window.editor) return;

    window.editor.on("change", function () {
      persistWorkspace();
      window.clearTimeout(state.historyTimer);
      state.historyTimer = window.setTimeout(function () {
        saveCurrentCodeToHistory(false);
      }, 450);
    });

    saveCurrentCodeToHistory(true);
    updateHistoryButtonsState();
    window.lastSavedCode = getEditorText();
  }

  function initializeRuntime() {
    if (state.initialized) return;
    state.initialized = true;
    state.bootProfileId = getRememberedProfileId();
    cleanupLegacyProfileApiKeys();

    state.apiKey = getGlobalLocalStorage(STORAGE_KEYS.apiKey, typeof window.myGeminiAPIKey === "string" ? window.myGeminiAPIKey : "");
    $("APIKey").value = state.apiKey;
    renderProfileChooser();
    renderAttachmentTray();

    bindModalClosers();
    initializeSettings();
    initializeEditorHooks();

    if (!state.listenersBound) {
      state.listenersBound = true;
      $("send-button").addEventListener("click", sendMessage);
      $("clear-chat-btn").addEventListener("click", openClearChatModal);
      $("confirmClearChatBtn").addEventListener("click", clearChatHistory);
      $("chatSessionSelect").addEventListener("change", function (event) {
        switchChatSession(event.target.value);
      });
      $("newChatSessionBtn").addEventListener("click", createChatSession);
      $("renameChatSessionBtn").addEventListener("click", renameChatSession);
      $("deleteChatSessionBtn").addEventListener("click", deleteChatSession);
      $("logoutProfileBtn").addEventListener("click", logoutProfile);
      $("attachImageBtn").addEventListener("click", function () { $("imageAttachmentInput").click(); });
      $("imageAttachmentInput").addEventListener("change", function (event) {
        handleImageFiles(event.target.files);
        event.target.value = "";
      });
      $("clearAttachmentsBtn").addEventListener("click", clearAttachments);
      $("APIKey").addEventListener("change", saveApiKey);
      $("APIKey").addEventListener("blur", saveApiKey);
      $("chat-messages").addEventListener("click", function (event) {
        const button = event.target.closest("[data-diff-index]");
        if (!button) return;
        const index = Number(button.getAttribute("data-diff-index"));
        if (!Number.isNaN(index)) {
          openDiffModal(index);
        }
      });
      $("chat-input").addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          sendMessage();
        }
      });

      const dropZone = $("imageDropZone");
      dropZone.addEventListener("click", function (event) {
        if (event.target.id !== "attachImageBtn") {
          $("imageAttachmentInput").click();
        }
      });
      dropZone.addEventListener("dragover", function (event) {
        event.preventDefault();
        dropZone.classList.add("drag-over");
      });
      dropZone.addEventListener("dragleave", function () {
        dropZone.classList.remove("drag-over");
      });
      dropZone.addEventListener("drop", function (event) {
        event.preventDefault();
        dropZone.classList.remove("drag-over");
        handleImageFiles(event.dataTransfer && event.dataTransfer.files);
      });

      document.addEventListener("paste", function (event) {
        const items = Array.from(event.clipboardData && event.clipboardData.items || []);
        const files = items
          .filter(function (item) { return item.type && item.type.startsWith("image/"); })
          .map(function (item) { return item.getAsFile(); })
          .filter(Boolean);
        if (files.length) {
          handleImageFiles(files);
        }
      });
    }

    if (state.bootProfileId) {
      activateProfile(state.bootProfileId, { silent: true });
    } else {
      showProfileChooser();
      updateProfileStatusUi();
      updateDocumentTitle();
    }

    showSnackbar("Zoho Ticket Auto-Fill Assistant is ready.");
  }

  window.getStoredTheme = getStoredTheme;
  window.getInitialWorkspaceContent = getInitialWorkspaceContent;
  window.initializeTicketAssistantRuntime = initializeRuntime;
  window.getActiveSupportAgent = getActiveSupportAgent;
  window.showSnackbar = showSnackbar;
  window.recordChange = recordChange;
  window.lastSavedCode = "";
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.openDocumentationModal = openDocumentationModal;
  window.closeDocumentationModal = closeDocumentationModal;
  window.openApiModal = openApiModal;
  window.closeApiModal = closeApiModal;
  window.toggleDisplayChatBotContainer = toggleDisplayChatBotContainer;
  window.toggleTheme = toggleTheme;
  window.newFile = newFile;
  window.saveToFile = saveToFile;
  window.downloadEditorContent = downloadEditorContent;
  window.previousCode = previousCode;
  window.nextCode = nextCode;
  window.addMessage = addMessage;
  window.sendMessage = sendMessage;
  window.saveCurrentCodeToHistory = saveCurrentCodeToHistory;
  window.updateHistoryButtonsState = updateHistoryButtonsState;
  window.closeDiffModal = closeDiffModal;
  window.restoreFromDiff = restoreFromDiff;
  window.closeClearChatModal = closeClearChatModal;
}());
