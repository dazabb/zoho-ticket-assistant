(function () {
  "use strict";

  const STORAGE_KEYS = {
    workspace: "ztaWorkspaceContent",
    theme: "mauAppearanceV07",
    readOnly: "ztaReadOnly",
    autocomplete: "ztaAutocomplete",
    apiKey: "ztaGeminiApiKey",
    chatMessages: "ztaChatMessages",
    chatConversation: "ztaChatConversation",
    attachments: "ztaAttachmentSummaries",
    chatVisible: "mauChatVisibleV07",
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
  const DEFAULT_WORKSPACE = `INCIDENT NOTES

Customer / account:
Ticket number:
Affected system:
Issue / alert:
Impact:
Troubleshooting performed:

Paste the original alert or email details below.
`;
  const EMPTY_INCIDENT_PROMPT = "Please paste the ticket details, email content, alert, request, images, or bridge-call notes so I can generate the Zoho ticket auto-fill.";
  const ACCOUNT_ALIAS_RULES = [
    { account: "AMDOCS-SMART", customer: "Amdocs Philippines, Inc.", aliases: ["smart/e-pldt/amdocs", "amdocs-smart", "amdocs"] },
    { account: "PLDT", customer: "ePLDT", aliases: ["e-pldt", "epldt", "pldt"] },
    { account: "Smart", customer: "SMART", aliases: ["smart"] },
    { account: "Radius", customer: "RADIUS TELECOMS INC.", aliases: ["radius telecoms inc", "radius telecoms", "radius"] },
    { account: "EWB", customer: "East West Bank", aliases: ["east west bank", "ewb"] },
    { account: "BCDA", customer: "BCDA", aliases: ["bcda"] },
    { account: "BPITC", customer: "BPI Tokyo Century", aliases: ["bpi tokyo century", "bpitc"] },
    { account: "BPI", customer: "BPI", aliases: [" bpi ", "bank of the philippine islands"] },
    { account: "PSE", customer: "Philippine Stock Exchange", aliases: ["philippine stock exchange", "pse"] },
    { account: "GMA", customer: "GMA Network Inc.", aliases: ["gma network inc", "gma (ict)", "gma (mams)", "gma, (mams)", "gma"] },
    { account: "Monde", customer: "Monde Nissin", aliases: ["monde nissin", "monde"] },
    { account: "SunLife", customer: "Sunlife", aliases: ["sun life", "sunlife"] },
    { account: "CebAir", customer: "Cebu Air, Inc.", aliases: ["cebu air, inc", "cebu air", "cebair"] },
    { account: "NatRe", customer: "National Reinsurance Corp.", aliases: ["national reinsurance corp", "national reinsurance", "natre"] },
    { account: "Honda Cars", customer: "HONDA", aliases: ["honda phils. inc", "honda phils inc", "honda cars", "honda"] },
    { account: "First Sumiden Circuits Inc.", customer: "First Sumiden", aliases: ["first sumiden circuits inc", "first sumiden"] },
    { account: "COL Financial", customer: "COL", aliases: ["col financial", "col"] },
    { account: "Department of Energy", customer: "DOE", aliases: ["department of energy", "doe"] },
    { account: "DSWD", customer: "DSWD", aliases: ["dswd"] },
    { account: "PHIC", customer: "PhilHealth", aliases: ["philhealth", "phic"] },
    { account: "Okada", customer: "Okada Manila", aliases: ["okada manila", "okada"] },
    { account: "Pascual", customer: "Pascual", aliases: ["pascual lab", "pascual"] },
    { account: "Angeles Electric Corp", customer: "ANGELES ELECTRIC", aliases: ["angeles electric corp", "angeles electric", "aec"] },
    { account: "Orix", customer: "Orix", aliases: ["orix"] },
    { account: "UHRI", customer: "Universal Hotels and Resorts Inc.", aliases: ["universal hotels and resorts inc", "uhri"] },
    { account: "SMIC", customer: "SM Investment", aliases: ["sm investment", "smic"] },
    { account: "EMD Technology Philippines Inc.", customer: "EMD", aliases: ["emd technology philippines inc", "emd technology philippines", "emd"] },
    { account: "Watsons", customer: "WATSONS", aliases: ["watsons"] },
    { account: "Bureau of the Treasury", customer: "BOTR", aliases: ["bureau of the treasury", "botr"] }
  ];
  const SUBJECT_LABEL_RULES = new Map([
    ["east west bank", "EWB"],
    ["ewb", "EWB"],
    ["bcda", "BCDA"],
    ["okada manila", "Okada"],
    ["okada", "Okada"],
    ["monde nissin", "Monde Nissin"],
    ["monde", "Monde Nissin"],
    ["national reinsurance corp", "NatRe"],
    ["natre", "NatRe"],
    ["gma network inc", "GMA"],
    ["gma", "GMA"],
    ["bpi tokyo century", "BPI Tokyo Century"],
    ["bpitc", "BPI Tokyo Century"],
    ["honda", "HONDA"],
    ["honda cars", "HONDA"],
    ["cebu air, inc", "Cebu Air, Inc."],
    ["cebair", "Cebu Air, Inc."],
    ["pascual", "Pascual Lab"],
    ["pascual lab", "Pascual Lab"],
    ["dswd", "DSWD"],
    ["orix", "ORIX"],
    ["philippine stock exchange", "PSE"],
    ["pse", "PSE"],
    ["angeles electric", "ANGELES ELECTRIC"],
    ["angeles electric corp", "ANGELES ELECTRIC"],
    ["radius telecoms inc", "Radius Telecoms Inc."],
    ["radius", "Radius Telecoms Inc."],
    ["bpi", "BPI"]
  ]);
  const SI_MS_DATABASE_MARKER = "SI and MS Customer Database:";
  const ENROLLED_ACCOUNTS_MARKER = "Enrolled Accounts Database:";
  const ACCOUNT_MATCH_STOP_WORDS = new Set([
    "and", "for", "the", "with", "from", "into", "this", "that", "site", "prod", "production",
    "dr", "infra", "project", "activity", "phase", "renewal", "support", "services", "service",
    "system", "server", "storage", "backup", "network", "maintenance", "upgrade", "refresh"
  ]);
  let siMsDatabaseRowsCache = null;
  let accountProfilesCache = null;
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
- Use only the visible incident evidence; do not invent ticket numbers, affected hosts, customer names, engineer assignments, troubleshooting performed, or confirmed causes.
- Keep Zoho output separate from customer-facing messages. Do not place internal triage bullets into customer emails.
- Use normal UTF-8 punctuation. Bullets should use '- ' in the response rather than corrupted encoding symbols.

Required standard output:
- Return only one Markdown text code block.
- The user's SANDZ account/platform rules always override old, generic platform keyword defaults.
- For existing OPEN incident with the same affected host and error, recommend continuing ticket tracking; use Existing Incident Ticket in the internal note, not New Incident Ticket.
- Keep the exact field order:
Customer Company Name:
Account Name:
Subject:
Description:
 - Keep Description aligned to the final SubjectName or Activity Name, not to the raw chat request wording.
 - When the Subject is in the scheduled activity format, use the same activity text for Description without the account prefix or trailing punctuation.
 - If the Subject is SANDZ-SI-Okada-Restore Activity | Okada Cristie Test-Restore, the Description should be Restore Activity | Okada Cristie Test-Restore.
Ticket Category:
Issue Category:
Issue Subcategory:
Severity:
Priority:
Supported Portfolio:
Technology/Platform:
Solutions:
SE's that can handle this ticket:
PM/SD of this account:
Ticket Owner:

Viber Details/Zoho Comment on Ticket for initial troubleshooting:
- The Viber Details/Zoho Comment output must use a full structured block, not a short bullet-only summary.
- Keep the workspace spacing clean and deterministic:
  - do not insert blank lines in the top field list before Solutions
  - insert one blank line before SE's that can handle this ticket
  - insert one blank line before Viber Details/Zoho Comment on Ticket for initial troubleshooting
  - insert one blank line after Issue/Request
  - insert one blank line after Next Action
  - do not insert blank lines between Possible Triage and its bullets
- Use this exact subsection shape inside the same code block:
  Viber Details/Zoho Comment on Ticket for initial troubleshooting:
  New <Incident/Request> Ticket
  Issue/Request: <clear operational summary>
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
- Resolve the account/customer first, then consult the embedded SI/MS database before finalizing Solutions.
- If the matched account has only one typed profile in the embedded SI/MS database, use that type as the default classification.
- If the matched account has both MS and SI rows, match Account + Product/Project first; if no clear row matches, use the newest typed row for that account as the fallback classification.
- Keep Solutions, subject prefix, and SE row preference aligned to the same resolved account classification.

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
- Keep Customer Company Name in its resolved account form.
- For the Subject line only, use the canonical subject customer label for mapped accounts instead of freely title-casing the company name.
- Canonical subject customer labels include: East West Bank -> EWB, BCDA -> BCDA, Okada Manila -> Okada, Monde/Monde Nissin -> Monde Nissin, National Reinsurance Corp. -> NatRe, GMA Network Inc. -> GMA, BPI Tokyo Century -> BPI Tokyo Century, HONDA -> HONDA, Cebu Air, Inc. -> Cebu Air, Inc., Pascual -> Pascual Lab, DSWD -> DSWD, Orix -> ORIX, Philippine Stock Exchange -> PSE, ANGELES ELECTRIC -> ANGELES ELECTRIC, RADIUS TELECOMS INC. -> Radius Telecoms Inc., BPI -> BPI.

Account Name rule:
- The January–October 2026 ticket history export has Customer Company Name and Subject columns but does NOT provide Zoho's exact Account Name field.
- Use the exact verified Zoho Account Name ONLY when it appears in the SANDZ reference or is explicitly supplied as confirmed by the user.
- Do not guess Account Name by adding " - Sandz" to Customer Company Name or copying a historical subject label.
- If not verified, write Account Name: Verify exact account in Zoho Desk. The Create Ticket autofill should leave unverified Account Name empty for manual selection.
- Never combine two different customers into one Account Name. The Create Ticket autofill does not populate manual-only fields such as Department, Contact Name, Email, Phone, or Mobile Number.

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
- For mapped accounts, the subject customer label must use the canonical subject customer label exactly and must not be freely title-cased.
- Do not wrap the customer label or SubjectName in parentheses.
- Do not end the subject with a trailing period.
- ALWAYS use this Subject format whether a ticket number exists or not:
<Subject Prefix>-<Subject Customer Label>-<Concise SubjectName>
- NEVER append Ticket No. #111743, Ticket #111743, a ticket number, or a case reference to Subject. Existing ticket IDs belong in the Ticket No. field within the internal Zoho/Viber comment, and may appear in a requested customer email, NOT in Subject.
- For RackWare Stage 1 sync failure on mkt-prod-sapb1, use a short title such as SANDZ-MSDCO-BPI Tokyo Century-RackWare Stage 1 Sync Failed - mkt-prod-sapb1; omit Stage 1 if not supported by the source.
- Avoid copying long forwarded RMM/Wave/Host bracket labels into Subject when one named workload is sufficient.
- For scheduled activities and other date-sensitive planned work, include the schedule in the subject when it is clearly stated and operationally important.
- Scheduled activity base format:
<Subject Prefix>-<Subject Customer Label>-<Activity Name>.
- Scheduled activity dated format:
<Subject Prefix>-<Subject Customer Label>-Activity | <Activity Name> (<date/time window>)
- Example AMDOCS output:
Customer Company Name: Amdocs Philippines, Inc.
Account Name: AMDOCS - Sandz
Subject: SANDZ-SI-AMDOCS-Power Drain Activity
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
Explicit one-time delivery work such as migration, cabling, implementation, deployment, refresh, upgrade, cutover, relocation, and scheduled project activity is a clear Request signal, not an Incident signal.

Scheduled maintenance mapping rules:
- When the ticket clearly describes planned maintenance work such as power drain activity, maintenance activity, scheduled activity, maintenance window work, or dated planned technical work, output Ticket Category: Request.
- For that same planned-work pattern, output Issue Category: Server - Request.
- For that same planned-work pattern, output Issue Subcategory: Status / Health Report.
- Use the exact Zoho option texts Server - Request and Status / Health Report when generating those values.
- Continue accepting both field labels Issue Subcategory and Issue Sub-Category in the workspace format.
- Exception for SI migration and delivery activity requests:
  - if the ticket is SI-classified and the subject, activity, or context clearly describes migration, cabling, implementation, deployment, refresh, upgrade, cutover, relocation, or other one-time delivery work, output Ticket Category: Request
  - for that SI migration/delivery pattern, do not let generic support wording override the request classification
  - if that same SI migration/delivery pattern involves storage platforms such as SAN, NetApp, storage, NAS, PowerStore, Unity, or Synology, output Issue Category: Storage - Request
  - if that same SI migration/delivery pattern involves storage platforms such as SAN, NetApp, storage, NAS, PowerStore, Unity, or Synology, output Issue Subcategory: Migration
  - if that same SI migration/delivery pattern involves server, compute, virtualization, VMware, Hyper-V, or host work instead of storage, use the matching request family and output Issue Subcategory: Migration
- for that SI migration/delivery pattern, output Supported Portfolio: (SI) System Integration
- Exception for restore and restoration requests:
  - if the ticket clearly describes restore activity, restoration, test restore, or similar recovery validation work, output Ticket Category: Request
  - for that restore/restoration request pattern, output Issue Category: Backup - Request
  - for that restore/restoration request pattern, output Issue Subcategory: Restoration
  - do not downgrade restore/restoration requests to Storage - Request / Status / Health Report just because the wording is short or activity-based
- Exception for SI storage health checks:
  - if the ticket is SI-classified and describes a scheduled health check, maintenance check, or health verification for storage platforms such as NetApp, storage, NAS, SAN, PowerStore, Unity, or Synology, do not use Server - Request
  - for that SI storage health-check pattern, output Ticket Category: Request
  - for that SI storage health-check pattern, output Issue Category: Storage - Request
  - for that SI storage health-check pattern, output Issue Subcategory: Status / Health Report
  - for that SI storage health-check pattern, output Supported Portfolio: (SI) System Integration
- Exception for scheduled/request IaaS health checks:
  - if the ticket is a health check, infrastructure check, or health/metrics check and the context points to IaaS or infrastructure platforms such as Zadara, OS, Dell server, Dell storage, or general infrastructure verification work, do not use the generic Server - Request / Status / Health Report mapping
  - for that IaaS health-check pattern, output Ticket Category: Request
  - for that IaaS health-check pattern, output Issue Category: Infrastructure ( Zadara Storage / Zadara Infrastructure / OS / Dell Server and Storage )
  - for that IaaS health-check pattern, output Issue Subcategory: Check IAAS Health and Metrics
  - for that IaaS health-check pattern, output Supported Portfolio: (IaaS) Infrastructure as a Service
  - for that IaaS health-check pattern, output Solutions: MS
  - for that IaaS health-check pattern, keep the MS subject prefix and use the dated activity subject format when date/time is present

Issue Category and Issue Subcategory validity rules:
- Do not invent Issue Category or Issue Subcategory values that are not valid Zoho options.
- Unsupported labels such as IT Support - Request and General Inquiry must not appear in the final output.
- Stay within the approved Zoho category families and their valid option texts when choosing Issue Category and Issue Subcategory.
- For request tickets with infrastructure or IaaS context, use the exact Zoho Issue Category text Infrastructure ( Zadara Storage / Zadara Infrastructure / OS / Dell Server and Storage ) when that is the intended mapping.
- For request tickets with infrastructure or IaaS health-check context, use Issue Subcategory: Check IAAS Health and Metrics.

SI classification rules:
- Classify as SI when the request is clearly about implementation, migration, deployment, project activity, maintenance activity, cabling activity, refresh activity, upgrade activity, scheduled technical work, or other one-time delivery work.
- For SI-classified tickets, always output Supported Portfolio: (SI) System Integration.
- For SI-classified tickets, output Solutions: SI and use the SANDZ-SI subject prefix.

Backup incident mapping rules:
- For backup-related incidents, do not automatically keep Backup - Incident when the strongest visible symptom is connectivity failure.
- If the ticket explicitly shows connection refused, failed telnet, port inaccessible, port closed, unreachable service, unreachable endpoint, firewall/path blocking, or other clear network-path evidence, output Issue Category: Network - Incident.
- For that backup-connectivity incident pattern, output Issue Subcategory: Network Connection.
- EXCEPTION: RackWare RMM Wave Sync / Stage 1 or Stage 2 replication alerts are DRaaS, not BaaS. Never apply generic backup connectivity defaults to RackWare replication.
- Keep Supported Portfolio: (BaaS) Backup as a Service and Solutions: MS for that backup-connectivity incident pattern.
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
- RackWare RMM, wave synchronization, replication (including Stage 1 / Stage 2) -> (DRaaS) Disaster Recovery as a Service (takes precedence over generic backup keyword rules)
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

  const CLIENT_EMAIL_PROMPT = String.raw`You are writing a customer-facing technical support email on behalf of the MAU/SANDZ service desk.

Write like a real technical support engineer using the user's example, not like an AI chatbot. Keep it polite, brief, specific, and natural. Plain email text, not a code block. No headings such as "Analysis" or "Summary", no fabricated root cause, and no unrelated troubleshooting checklist.

Preferred structure:
Hi Sir Rustom, [only if the recipient name is explicitly Rustom; otherwise match the provided name/title or use Hi Team,]
Good Day!

We received a [monitoring platform] alert for [affected system] indicating the following error:
Error: [exact visible error text]
Details: [exact visible error detail, if available]
[Describe the observed failure, affected source/destination, file system, progress, and impact only where evidenced.]
Please be informed that ticket #[number] has been logged for your reference. [Only if a ticket number is explicitly provided; otherwise omit the whole sentence.]
We will coordinate with a Service Engineer to assist with your concern. [Only promise this if coordination has been requested or is the stated next step. Otherwise state the next step conservatively.]
For any further questions or concerns, please reply to this email.
Thank you.

Rules:
- Keep exact error codes, paths, timestamps, system names, source and target names; do not paraphrase machine identifiers.
- The user's provided RackWare example is a tone and structure reference only; NEVER reuse its ticket number, hostname, client, percentage, or error unless they are actually present in this incident.
- No engineer signature or address; users add their own signature in Zoho Desk.
- If the recipient name is not supplied, use "Hi Team,".
- If no ticket number is provided, do not invent one; omit the ticket number sentence.
- Do not claim a ticket has been logged or a service engineer engaged unless the source explicitly indicates it.
- For unconfirmed causes, write observations only. Do not promise resolution time.
- Keep paragraphs short and use normal punctuation; do not include literal Markdown symbols such as ** or backticks in the email itself.
- Return only the customer-ready email text, with no framing or prefatory commentary.
`;

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
    outputMode: "zoho",
    apiKey: "",
    chatVisible: true,
    activeProfileId: "",
    bootProfileId: "",
    settingsBound: false,
    listenersBound: false,
    pendingFreshAccountContext: false
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

  function repairText(value) {
    return String(value || "")
      .replace(/â€¢/g, "-")
      .replace(/â€”/g, "—")
      .replace(/â€“/g, "–")
      .replace(/â€™/g, "’")
      .replace(/â€œ/g, "“")
      .replace(/â€/g, "”")
      .replace(/â€˜/g, "‘")
      .replace(/Â·/g, "·")
      .replace(/\r\n/g, "\n");
  }

  const TICKET_FIELD_NAMES = ["Customer Company Name", "Account Name", "Subject", "Description", "Ticket Category", "Issue Category", "Issue Subcategory", "Issue Sub-Category", "Severity", "Priority", "Supported Portfolio", "Technology/Platform", "Ticket Owner", "Solutions", "SE's that can handle this ticket", "PM/SD of this account"];
  const SHORT_FIELDS = new Set(["Customer Company Name", "Account Name", "Ticket Category", "Issue Category", "Issue Subcategory", "Issue Sub-Category", "Severity", "Priority", "Supported Portfolio", "Technology/Platform", "Ticket Owner", "Solutions"]);

  function renderSupportNotes(notes) {
    let html = "";
    let items = [];
    const flushItems = function () {
      if (items.length) { html += `<ul>${items.map(function (item) { return `<li>${escapeHtml(item)}</li>`; }).join("")}</ul>`; items = []; }
    };
    for (const rawLine of repairText(notes).split("\n")) {
      const line = rawLine.trim();
      if (!line) { flushItems(); continue; }
      if (/^(?:-|•|\*)\s+/.test(line)) { items.push(line.replace(/^(?:-|•|\*)\s+/, "")); continue; }
      flushItems();
      if (/^(?:New (?:Incident|Request) Ticket|Issue\/Request:|Next Action:|Possible Triage:|Observed Issue:|Capture\/Document:|Escalation Decision:)/i.test(line)) {
        const pos = line.indexOf(":");
        if (pos >= 0) html += `<p><strong>${escapeHtml(line.slice(0, pos + 1))}</strong> ${escapeHtml(line.slice(pos + 1).trim())}</p>`;
        else html += `<div class="result-note-title">${escapeHtml(line)}</div>`;
      } else {
        html += `<p>${escapeHtml(line)}</p>`;
      }
    }
    flushItems();
    return html;
  }

  function parseTicketReply(rawText) {
    const raw = repairText(rawText).trim();
    const body = raw.replace(/^```(?:text)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
    if (!/^(?:Customer Company Name|Account Name|Subject):/m.test(body)) return null;
    const lines = body.split("\n");
    const fields = [];
    const notes = [];
    let inNotes = false;
    for (const line of lines) {
      if (/^Viber Details\/Zoho Comment on Ticket for initial troubleshooting:/i.test(line.trim())) { inNotes = true; continue; }
      if (inNotes) { notes.push(line); continue; }
      const match = line.match(/^([^:]+):\s*(.*)$/);
      if (match && TICKET_FIELD_NAMES.some(function (f) { return f.toLowerCase() === match[1].trim().toLowerCase(); })) {
        fields.push({name:match[1].trim(), value:match[2].trim()});
      } else if (fields.length && line.trim()) {
        fields[fields.length-1].value += "\n" + line.trim();
      }
    }
    if (fields.length < 4) return null;
    // Sanitize older saved AI replies too, not only newly generated ones.
    const subjectField = fields.find(function (field) { return field.name.toLowerCase() === "subject"; });
    let safeBody = body;
    if (subjectField && window.MAUSandzTicketRules) {
      const originalSubject = subjectField.value;
      const cleanSubject = window.MAUSandzTicketRules.normalizeSubject(originalSubject,body);
      subjectField.value = cleanSubject;
      if (cleanSubject !== originalSubject) {
        safeBody = safeBody.replace(/^(Subject:\s*).+$/m, function (_, prefix) { return prefix + cleanSubject; });
      }
    }
    return {raw:safeBody,fields,notes:notes.join("\n").trim()};
  }

  function renderTicketReply(parsed) {
    const source = escapeHtml(parsed.raw);
    const sections = [
      {title:"Ticket details",keys:["Customer Company Name","Account Name","Subject","Description"]},
      {title:"Zoho classification",keys:["Ticket Category","Issue Category","Issue Subcategory","Issue Sub-Category","Severity","Priority","Supported Portfolio","Technology/Platform","Ticket Owner","Solutions"]},
      {title:"Assignment · reference contacts (verify current ownership)",keys:["SE's that can handle this ticket","PM/SD of this account"]}
    ];
    let html = `<section class="ticket-result-card"><div class="result-header"><div class="result-heading"><span class="result-icon">Z</span><div><span class="result-title">Zoho Ticket Autofill</span><span class="result-subtitle">Ticket fields and internal notes</span></div></div><div class="result-action-set"><button type="button" class="result-copy" data-draft-email="1">Draft client email</button><button type="button" class="result-copy" data-copy-result="ticket">Copy Zoho fields</button></div></div>`;
    for (const section of sections) {
      const fields = parsed.fields.filter(function (field) { return section.keys.includes(field.name); });
      if (!fields.length) continue;
      html += `<section class="result-section"><h3 class="result-section-title">${section.title}</h3><div class="result-field-grid">`;
      for (const field of fields) {
        const wide = !SHORT_FIELDS.has(field.name);
        html += `<div class="result-field ${wide?'wide':''}"><span class="result-field-name">${escapeHtml(field.name)}</span><span class="result-field-value ${field.name==='Description'?'issue':''}">${escapeHtml(field.value)}</span></div>`;
      }
      html += `</div></section>`;
    }
    if (parsed.notes) html += `<section class="result-section"><div class="result-note-heading"><h3 class="result-section-title">Internal comment / Viber troubleshooting</h3><button type="button" class="result-copy" data-copy-result="notes">Copy comment</button></div><div class="result-note">${renderSupportNotes(parsed.notes)}</div><textarea class="result-notes-source" hidden>${escapeHtml(parsed.notes)}</textarea></section>`;
    html += `<details class="result-raw"><summary>View original text for Zoho autofill</summary><textarea class="result-raw-source" readonly aria-label="Original Zoho autofill text">${source}</textarea></details></section>`;
    return html;
  }

  function renderClientEmail(rawText) {
    const raw = repairText(rawText).trim().replace(/^```(?:text)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
    const stripped = raw.replace(/\*\*(.*?)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1");
    const formatted = escapeHtml(stripped).split(/\n\s*\n/).map(function (paragraph) {
      return `<p>${paragraph.replace(/\n/g, "<br>")}</p>`;
    }).join("");
    return `<section class="client-email-result"><div class="result-header"><div class="result-heading"><span class="result-icon">✉</span><div><span class="result-title">Client email draft</span><span class="result-subtitle">Review names and ticket number before sending</span></div></div><button type="button" class="result-copy" data-copy-result="email">Copy email</button></div><div class="email-letter">${formatted}</div><details class="result-raw"><summary>View plain email text</summary><textarea class="result-raw-source" readonly aria-label="Plain client email">${escapeHtml(stripped)}</textarea></details></section>`;
  }

  function formatMessageContent(text, role, mode) {
    const raw = repairText(text);
    if (role === "ai" && mode === "email") return renderClientEmail(raw);
    if (role === "ai") {
      const ticket = parseTicketReply(raw);
      if (ticket) return renderTicketReply(ticket);
    }
    const parts = raw.split(/```/);
    return parts.map(function (part, index) {
      if (index % 2 === 1) {
        return `<pre><code>${escapeHtml(part.replace(/^\w+\n/, ""))}</code></pre>`;
      }
      return escapeHtml(part).replace(/\n/g, "<br>");
    }).join("");
  }

  function upgradeSavedTicketMessages() {
    const container = $("chat-messages");
    if (!container) return;
    for (const message of container.querySelectorAll(".message.ai, .message.restored")) {
      const bubble = message.querySelector(".message-bubble");
      const code = bubble && bubble.querySelector("pre code");
      if (!code || bubble.querySelector(".ticket-result-card")) continue;
      const parsed = parseTicketReply(code.textContent);
      if (parsed) bubble.innerHTML = renderTicketReply(parsed);
    }
  }

  async function copyResponseValue(text) {
    const value = repairText(text).trim();
    if (!value) return false;
    try { await navigator.clipboard.writeText(value); return true; }
    catch(error) {
      const textArea = document.createElement("textarea");
      textArea.value = value;
      textArea.style.position = "fixed"; textArea.style.opacity = "0";
      document.body.appendChild(textArea);textArea.select();
      const worked = document.execCommand("copy"); textArea.remove();
      return worked;
    }
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
      lastPromptedAccount: "",
      lastContextResetAt: "",
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
    state.pendingFreshAccountContext = false;
    state.chatConversation = Array.isArray(session.chatConversation)
      ? session.chatConversation.slice()
      : [];
    if (window.editor) {
      session.workspace = repairText(session.workspace || DEFAULT_WORKSPACE);
      window.editor.setValue(session.workspace, -1);
      window.lastSavedCode = getEditorText();
    }
    if ($("chat-messages")) {
      $("chat-messages").innerHTML = repairText(session.chatMessages || "");
      upgradeSavedTicketMessages();
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
            lastPromptedAccount: String(session && session.lastPromptedAccount || ""),
            lastContextResetAt: String(session && session.lastContextResetAt || ""),
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
    document.title = `MAU Operation Desk — ${fileLabel}${profileLabel}`;
  }

  function updateProfileStatusUi() {
    const status = $("profileStatus");
    const name = $("activeProfileName");
    const profile = getProfileById(state.activeProfileId);
    if (!status || !name) return;
    if (!profile) {
      status.hidden = true;
      name.textContent = "Guest";
      if ($("sidebarProfileName")) $("sidebarProfileName").textContent = "Select profile";
      if ($("sidebarProfileAvatar")) $("sidebarProfileAvatar").textContent = "M";
      return;
    }
    status.hidden = false;
    name.textContent = getProfileDisplayName(profile);
    const sidebarName = $("sidebarProfileName");
    const sidebarAvatar = $("sidebarProfileAvatar");
    if (sidebarName) sidebarName.textContent = getProfileDisplayName(profile);
    if (sidebarAvatar) {
      sidebarAvatar.textContent = "";
      if (profile.image) {
        const photo = document.createElement("img");
        photo.src = profile.image;
        photo.alt = "";
        photo.style.objectPosition = profile.position || "center";
        sidebarAvatar.appendChild(photo);
      } else sidebarAvatar.textContent = "G";
    }
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
        ocrText: String(attachment && attachment.ocrText || ""),
        addedAt: Number(attachment && attachment.addedAt || 0)
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

    if (window.MAUUserGemini) window.MAUUserGemini.clearKey();
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
    if (window.MAUUserGemini) window.MAUUserGemini.setProfile(profile.id);
    hideProfileChooser();

    if (!(options && options.silent)) {
      showSnackbar(`Profile loaded: ${getProfileDisplayName(profile)}.`);
    }
  }

  function logoutProfile() {
    if (window.MAUUserGemini) { window.MAUUserGemini.clearKey(); window.MAUUserGemini.setProfile(""); }
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

      const avatar = document.createElement("div");
      avatar.className = "profile-avatar";
      if (profile.image) {
        const photo = document.createElement("img");
        photo.src = profile.image;
        photo.alt = "";
        photo.loading = "eager";
        photo.decoding = "async";
        photo.style.objectPosition = profile.position || "center";
        avatar.appendChild(photo);
      } else {
        avatar.textContent = "G";
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
    chat.style.display = state.chatVisible ? "flex" : "none";
    chat.setAttribute("aria-hidden", state.chatVisible ? "false" : "true");
    safeLocalStorageSet(STORAGE_KEYS.chatVisible, String(state.chatVisible));
    if (window.editor && typeof window.editor.resize === "function") requestAnimationFrame(() => window.editor.resize());
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
    document.body.classList.toggle("theme-light", themeName !== "ace/theme/monokai");
    safeLocalStorageSet(STORAGE_KEYS.theme, themeName);
    if (typeof window.syncThemePreferenceButton === "function") window.syncThemePreferenceButton();
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
    $("modalApi").style.display = "flex";
    if (window.MAUUserGemini) window.MAUUserGemini.refreshUi();
  }

  function closeApiModal() {
    $("modalApi").style.display = "none";
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

  // A user's key is held only in memory; it is never persisted to a workspace or chat session.
  function ensureApiKeyForAiAction() {
    if (window.MAUUserGemini && window.MAUUserGemini.hasKey()) return true;
    showSnackbar("Enter your own Gemini API key to use the assistant.");
    openApiModal();
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
    const session = getActiveSession();
    if (session) {
      session.lastPromptedAccount = "";
      markActiveSessionUpdated();
    }
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
    bubble.innerHTML = formatMessageContent(text, safeRole, options && options.mode);
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
      ocrText: attachment.ocrText,
      addedAt: Number(attachment.addedAt || 0)
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
      ocrText: "",
      addedAt: Date.now()
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

  function toTitleCaseLabel(value) {
    return String(value || "")
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map(function (part) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(" ");
  }

  function getCanonicalSubjectCustomerLabel(account, customer) {
    // Historical naming conventions take precedence over free-form title case.
    const history = window.MAUAccountHistory;
    if (history) {
      for (const raw of [customer, account]) {
        const mapped = history.findByCompany(String(raw || "").replace(/\s*[-–]\s*Sandz\s*$/i,""));
        if (mapped) return mapped.subject;
      }
    }
    const candidates = [
      normalizeText(account),
      normalizeText(customer)
    ].filter(Boolean);
    for (let index = 0; index < candidates.length; index += 1) {
      const mapped = SUBJECT_LABEL_RULES.get(candidates[index]);
      if (mapped) return mapped;
    }
    return toTitleCaseLabel(customer || account || "");
  }

  function extractPromptBlock(prompt, startMarker, endMarker) {
    const raw = String(prompt || "");
    const start = raw.indexOf(startMarker);
    if (start === -1) return "";
    const fromStart = raw.slice(start + startMarker.length);
    const end = endMarker ? fromStart.indexOf(endMarker) : -1;
    return end === -1 ? fromStart : fromStart.slice(0, end);
  }

  function parseYearValue(value) {
    const match = String(value || "").match(/\b(20\d{2})\b/);
    return match ? Number(match[1]) : -1;
  }

  function parseSiMsDatabaseRows() {
    if (siMsDatabaseRowsCache) return siMsDatabaseRowsCache;

    const block = extractPromptBlock(ZOHO_GENERATOR_PROMPT, SI_MS_DATABASE_MARKER, ENROLLED_ACCOUNTS_MARKER);
    const rows = block
      .split(/\r?\n/)
      .map(function (line) { return line.trim(); })
      .filter(function (line) { return line && line.includes("|"); })
      .map(function (line, index) {
        const parts = line.split("|").map(function (part) { return part.trim(); });
        return {
          index: index,
          account: parts[0] || "",
          project: parts[1] || "",
          year: parts[2] || "",
          solution: parts[3] || "",
          product: parts[4] || "",
          primarySe: parts[5] || "",
          secondarySe: parts[6] || "",
          yearValue: parseYearValue(parts[2] || "")
        };
      })
      .filter(function (row) {
        return row.account && (row.solution === "MS" || row.solution === "SI");
      });

    siMsDatabaseRowsCache = rows;
    return rows;
  }

  function buildAccountProfiles() {
    if (accountProfilesCache) return accountProfilesCache;

    const profiles = new Map();
    parseSiMsDatabaseRows().forEach(function (row) {
      const key = normalizeText(row.account);
      if (!key) return;
      if (!profiles.has(key)) {
        profiles.set(key, {
          key: key,
          account: row.account,
          rows: [],
          types: new Set()
        });
      }
      const profile = profiles.get(key);
      profile.rows.push(row);
      profile.types.add(row.solution);
    });

    accountProfilesCache = profiles;
    return profiles;
  }

  function scoreFieldMatch(haystack, field) {
    const normalizedField = normalizeText(field);
    if (!haystack || !normalizedField) return 0;
    if (haystack.includes(normalizedField)) {
      return 50 + normalizedField.length;
    }

    const tokens = normalizedField
      .split(" ")
      .map(function (token) { return token.trim(); })
      .filter(function (token) {
        return token.length >= 4 && !ACCOUNT_MATCH_STOP_WORDS.has(token);
      });
    if (!tokens.length) return 0;

    const overlaps = tokens.filter(function (token) { return haystack.includes(token); });
    if (overlaps.length >= 2) return overlaps.length * 12;
    if (overlaps.length === tokens.length && overlaps.length > 0) return overlaps.length * 8;
    return 0;
  }

  function compareRowsByYearDesc(a, b) {
    if (b.yearValue !== a.yearValue) return b.yearValue - a.yearValue;
    return a.index - b.index;
  }

  function findBestProjectRow(profile, haystack) {
    if (!profile || !Array.isArray(profile.rows) || !haystack) return null;

    const ranked = profile.rows
      .filter(function (row) { return row.solution === "MS" || row.solution === "SI"; })
      .map(function (row) {
        const projectScore = scoreFieldMatch(haystack, row.project);
        const productScore = scoreFieldMatch(haystack, row.product);
        return {
          row: row,
          score: (projectScore * 2) + productScore
        };
      })
      .filter(function (entry) { return entry.score > 0; })
      .sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return compareRowsByYearDesc(a.row, b.row);
      });

    return ranked.length ? ranked[0].row : null;
  }

  function findNewestTypedRow(profile) {
    if (!profile || !Array.isArray(profile.rows)) return null;
    const typedRows = profile.rows
      .filter(function (row) { return row.solution === "MS" || row.solution === "SI"; })
      .sort(compareRowsByYearDesc);
    return typedRows.length ? typedRows[0] : null;
  }

  function resolveAccountFromText(text) {
    const haystack = normalizeText(text);
    if (!haystack) return null;

    const aliasMatches = ACCOUNT_ALIAS_RULES
      .map(function (rule) {
        const bestAlias = rule.aliases
          .map(function (alias) { return normalizeText(alias); })
          .filter(function (alias) { return alias && haystack.includes(alias); })
          .sort(function (a, b) { return b.length - a.length; })[0];
        if (!bestAlias) return null;
        return {
          account: rule.account,
          customer: rule.customer,
          matchedAlias: bestAlias,
          score: bestAlias.length + 1000
        };
      })
      .filter(Boolean)
      .sort(function (a, b) { return b.score - a.score; });
    if (aliasMatches.length) return aliasMatches[0];

    const profiles = Array.from(buildAccountProfiles().values());
    const directMatches = profiles
      .map(function (profile) {
        const normalizedAccount = normalizeText(profile.account);
        if (!normalizedAccount || !haystack.includes(normalizedAccount)) return null;
        return {
          account: profile.account,
          customer: profile.account,
          matchedAlias: normalizedAccount,
          score: normalizedAccount.length
        };
      })
      .filter(Boolean)
      .sort(function (a, b) { return b.score - a.score; });

    return directMatches.length ? directMatches[0] : null;
  }

  function extractWorkspaceFieldValue(text, label) {
    const raw = String(text || "");
    const escapedLabel = String(label || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`^\\s*${escapedLabel}\\s*:\\s*(.*)$`, "im");
    const match = raw.match(pattern);
    return match ? String(match[1] || "").trim() : "";
  }

  function resolveNormalizedAccountKey(text) {
    const match = resolveAccountFromText(text);
    return match ? normalizeText(match.account || match.customer || "") : "";
  }

  function getLatestReadyOcrText() {
    for (let index = state.attachments.length - 1; index >= 0; index -= 1) {
      const attachment = state.attachments[index];
      if (attachment && attachment.status === "ready" && String(attachment.ocrText || "").trim()) {
        return String(attachment.ocrText || "").trim();
      }
    }
    return "";
  }

  function resolveAccountKeyFromContext(workspaceText, ocrText, userText) {
    const userMatch = resolveNormalizedAccountKey(userText);
    if (userMatch) return userMatch;

    const latestOcrText = getLatestReadyOcrText();
    const ocrMatch = resolveNormalizedAccountKey(latestOcrText || ocrText);
    if (ocrMatch) return ocrMatch;

    const workspace = String(workspaceText || "");
    const explicitFields = [
      extractWorkspaceFieldValue(workspace, "Customer Company Name"),
      extractWorkspaceFieldValue(workspace, "Account Name")
    ].filter(Boolean).join("\n");
    const explicitMatch = resolveNormalizedAccountKey(explicitFields);
    if (explicitMatch) return explicitMatch;

    return resolveNormalizedAccountKey(workspaceText);
  }

  function maybeResetAiContextForAccountChange(currentAccountKey, mode) {
    if (mode === "bridge" || !currentAccountKey) return;
    const session = getActiveSession();
    if (!session) return;

    const previousAccountKey = normalizeText(session.lastPromptedAccount || "");
    if (!previousAccountKey || previousAccountKey === currentAccountKey) return;

    state.chatConversation = [];
    state.pendingFreshAccountContext = true;
    session.lastContextResetAt = String(Date.now());
    persistConversation();
    markActiveSessionUpdated();
    showSnackbar("Detected a new account. AI context reset for a fresh ticket run.");
  }

  function splitWorkspaceIntoTicketBlocks(workspaceText) {
    const raw = String(workspaceText || "").trim();
    if (!raw) return [];
    const pattern = /^Customer Company Name:\s*.*$/gim;
    const starts = [];
    let match;
    while ((match = pattern.exec(raw))) {
      starts.push(match.index);
    }
    if (!starts.length) return [];
    return starts.map(function (start, index) {
      const end = index + 1 < starts.length ? starts[index + 1] : raw.length;
      return raw.slice(start, end).trim();
    }).filter(Boolean);
  }

  function scopeWorkspaceForAccount(workspaceText, currentAccountKey) {
    const workspace = String(workspaceText || "").trim();
    if (!workspace) return "";

    const blocks = splitWorkspaceIntoTicketBlocks(workspace);
    if (!blocks.length) {
      if (!currentAccountKey) return workspace;
      const workspaceKey = resolveNormalizedAccountKey(workspace);
      return !workspaceKey || workspaceKey === currentAccountKey ? workspace : "";
    }

    if (!currentAccountKey) {
      return blocks[blocks.length - 1] || "";
    }

    const matchingBlocks = blocks.filter(function (block) {
      return resolveNormalizedAccountKey(block) === currentAccountKey;
    });
    return matchingBlocks.length ? matchingBlocks[matchingBlocks.length - 1] : "";
  }

  function scopeOcrForAccount(currentAccountKey, accountJustChanged) {
    const session = getActiveSession();
    const resetAt = Number(session && session.lastContextResetAt || 0);
    const scoped = state.attachments
      .filter(function (attachment) {
        return attachment && attachment.status === "ready" && String(attachment.ocrText || "").trim();
      })
      .filter(function (attachment) {
        const ocrText = String(attachment.ocrText || "").trim();
        if (!currentAccountKey) return !accountJustChanged;
        if (resolveNormalizedAccountKey(ocrText) === currentAccountKey) return true;
        if (!resetAt) return !accountJustChanged;
        return Number(attachment.addedAt || 0) >= resetAt;
      })
      .map(function (attachment) {
        return `[${attachment.name}]\n${String(attachment.ocrText || "").trim()}`;
      });
    return scoped.join("\n\n").trim();
  }

  function buildScopedPromptContext(userPrompt, currentAccountKey) {
    const workspace = getMeaningfulWorkspaceText();
    const scopedWorkspace = scopeWorkspaceForAccount(workspace, currentAccountKey);
    const scopedOcrText = scopeOcrForAccount(currentAccountKey, state.pendingFreshAccountContext);
    return {
      workspace: scopedWorkspace,
      ocrText: scopedOcrText,
      userText: String(userPrompt || "").trim(),
      freshAccountContext: Boolean(state.pendingFreshAccountContext)
    };
  }

  function getAccountClassificationDecision(text) {
    const resolved = resolveAccountFromText(text);
    if (!resolved) return null;

    const profile = buildAccountProfiles().get(normalizeText(resolved.account));
    if (!profile) return null;

    const typedRows = profile.rows.filter(function (row) { return row.solution === "MS" || row.solution === "SI"; });
    const typeList = Array.from(profile.types.values()).sort();
    const bestRow = findBestProjectRow(profile, normalizeText(text));
    const newestRow = findNewestTypedRow(profile);

    if (!typeList.length) return null;
    if (typeList.length === 1) {
      return {
        account: profile.account,
        customer: resolved.customer,
        profileType: "single",
        classification: typeList[0],
        reason: "single-type account",
        matchedRow: newestRow,
        typedRows: typedRows.length,
        msCount: typedRows.filter(function (row) { return row.solution === "MS"; }).length,
        siCount: typedRows.filter(function (row) { return row.solution === "SI"; }).length
      };
    }

    if (bestRow) {
      return {
        account: profile.account,
        customer: resolved.customer,
        profileType: "mixed-row-match",
        classification: bestRow.solution,
        reason: "project/product row match",
        matchedRow: bestRow,
        typedRows: typedRows.length
      };
    }

    return {
      account: profile.account,
      customer: resolved.customer,
      profileType: "mixed-fallback",
      classification: newestRow ? newestRow.solution : typeList[0],
      reason: "newest typed row fallback",
      matchedRow: newestRow,
      typedRows: typedRows.length
    };
  }

  function formatRowSummary(row) {
    if (!row) return "No typed row summary available.";
    const detail = [row.project, row.year, row.solution, row.product].filter(Boolean).join(" | ");
    return detail || row.account;
  }

  function buildAccountClassificationPrompt(text) {
    const decision = getAccountClassificationDecision(text);
    if (!decision) return "";

    const prefix = decision.classification === "SI" ? "SANDZ-SI" : "SANDZ-MSDCO";
    const subjectCustomerLabel = getCanonicalSubjectCustomerLabel(decision.account, decision.customer);
    const normalizedContext = normalizeText(text);
    const isSiDeliveryActivity = /(?:migration|cabling|implementation|deployment|refresh|upgrade|cutover|relocation|scheduled activity|project activity)/.test(normalizedContext);
    const lines = [
      "Account classification override:",
      `- Resolved account from current ticket context: ${decision.account}`,
      `- Final customer/company label to keep aligned: ${decision.customer}`,
      `- In the Subject line, use this customer label: ${subjectCustomerLabel}`,
      `- Output Solutions: ${decision.classification}`,
      `- Use subject prefix: ${prefix}`,
      `- Prefer ${decision.classification} row(s) for SE matching for this account.`,
      "- Do not let generic wording alone override this account classification."
    ];

    if (decision.profileType === "single") {
      lines.push(`- This account is single-type in the embedded SI/MS database: ${decision.msCount} MS row(s), ${decision.siCount} SI row(s).`);
      lines.push(`- Use the account default classification unless the ticket text clearly proves a specific opposite-type row, which is not present for this account.`);
    } else if (decision.profileType === "mixed-row-match") {
      lines.push(`- This account has both MS and SI rows, and the best matching row is: ${formatRowSummary(decision.matchedRow)}`);
      lines.push("- Use that matched row type consistently for Solutions, subject prefix, and SE row selection.");
    } else {
      lines.push(`- This account has both MS and SI rows, but no clear project/product row match was found in the current ticket context.`);
      lines.push(`- Fallback to the newest typed row for this account: ${formatRowSummary(decision.matchedRow)}`);
    }
    if (isSiDeliveryActivity) {
      lines.push("- The current ticket clearly describes one-time delivery work such as migration/cabling/project activity, so keep the final output aligned to the SI request flow and do not let generic managed-support wording pull it back to MS.");
    }

    return lines.join("\n");
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

  function buildPrompt(userPrompt, mode, scopedContext) {
    const incidentSections = [];
    const context = scopedContext || {};
    const workspace = String(context.workspace || "").trim();
    const ocrText = String(context.ocrText || "").trim();
    const userText = String(context.userText || userPrompt || "").trim();
    const freshAccountContext = Boolean(context.freshAccountContext);

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

    if (mode === "email") {
      const emailContext = [workspace, ocrText, userText].filter(Boolean).join("\n\n");
      const contactPolicy = window.MAUSandzTicketRules
        ? window.MAUSandzTicketRules.guidanceFor(emailContext)
        : "";
      return [CLIENT_EMAIL_PROMPT, "Current SANDZ account, incident, and customer-email requirements:\n" + contactPolicy, "Incident details to process:", incidentSections.join("\n\n")].join("\n\n");
    }

    const modeInstruction = mode === "bridge"
      ? "Use Bridge Call / Screenshot Assistance Mode. Return only the bridge-call structure."
      : mode === "qa"
        ? "Use conversational ticket Q&A mode. Answer plainly and do not generate a Zoho ticket code block unless explicitly requested."
        : "Use standard Zoho Desk ticket generation mode. Return only one ```text code block.";
    const contextText = [workspace, ocrText, userText].filter(Boolean).join("\n\n");
    const accountClassificationOverride = mode === "bridge" ? "" : buildAccountClassificationPrompt(contextText);

    const sandzGuidance = window.MAUSandzTicketRules
      ? window.MAUSandzTicketRules.guidanceFor(contextText)
      : "";
    const sections = [
      mode === "qa" ? ZOHO_QA_PROMPT : ZOHO_GENERATOR_PROMPT,
      "Important current SANDZ classification and support policy:\n" + sandzGuidance,
      modeInstruction,
      freshAccountContext ? "Fresh account context: The latest user request is authoritative for this run. Ignore older visible ticket examples or screenshots from other accounts unless the user explicitly references them in the current message." : "",
      accountClassificationOverride,
      "Incident details to process:"
    ];
    sections.push(incidentSections.join("\n\n"));
    return sections.join("\n\n");
  }

  function normalizeAssistantOutput(rawReply, mode) {
    const reply = repairText(rawReply).trim();
    if (!reply) {
      if (mode === "bridge") {
        return "Bridge Call / Screenshot Triage:\nObserved Issue: Unable to determine from the provided details.\nNext Safe Step for L1/L1.5: Ask the client to provide the next screenshot or screenshare the exact read-only error/status page.\nCapture/Document: Record the exact error, timestamp, affected system, and visible status shown on screen.\nEscalation Decision: Ask L2/assigned SE for initial guidance if the next required action is unclear.";
      }
      if (mode === "qa") {
        return "I need a bit more ticket context before I can answer that clearly. Point me to the specific field, mapping, category, severity, priority, or account detail you want explained.";
      }
      return `\`\`\`text\n${EMPTY_INCIDENT_PROMPT}\n\`\`\``;
    }

    if (mode === "email") {
      return reply.replace(/^```(?:text)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
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

  function formatWorkspaceSpacing(content) {
    const raw = String(content || "").replace(/\r\n/g, "\n").trim();
    if (!raw) return "";

    const lines = raw.split("\n").map(function (line) {
      return line.replace(/[ \t]+$/g, "");
    });
    const compact = [];
    let previousBlank = false;

    lines.forEach(function (line) {
      const blank = !line.trim();
      if (blank) {
        if (!previousBlank) compact.push("");
      } else {
        compact.push(line);
      }
      previousBlank = blank;
    });

    const normalized = [];
    const forceBlankBefore = new Set([
      "SE's that can handle this ticket:",
      "Viber Details/Zoho Comment on Ticket for initial troubleshooting:"
    ]);

    compact.forEach(function (line) {
      const trimmed = line.trim();
      if (
        trimmed
        && forceBlankBefore.has(trimmed)
        && normalized.length
        && normalized[normalized.length - 1] !== ""
      ) {
        normalized.push("");
      }

      if (trimmed === "Next Action:" || trimmed === "Possible Triage:") {
        while (normalized.length && normalized[normalized.length - 1] === "") {
          normalized.pop();
        }
      }

      normalized.push(line);

      if (
        trimmed.startsWith("Issue/Request:")
        || trimmed.startsWith("Next Action:")
      ) {
        if (normalized[normalized.length - 1] !== "") {
          normalized.push("");
        }
      }
    });

    const finalLines = [];
    previousBlank = false;
    normalized.forEach(function (line) {
      const blank = !String(line || "").trim();
      if (blank) {
        if (!previousBlank) finalLines.push("");
      } else {
        finalLines.push(line);
      }
      previousBlank = blank;
    });

    return finalLines.join("\n").trim();
  }

  function extractDescriptionFromSubject(subjectValue) {
    const subject = String(subjectValue || "").trim();
    if (!subject) return "";
    const withoutTicketNo = subject.replace(/\s+Ticket\s+No\.\s*#.+$/i, "").trim();
    const withoutPeriod = withoutTicketNo.replace(/\.$/, "").trim();
    const match = withoutPeriod.match(/^SANDZ-(?:MSDCO|SI)-.+?-(.+)$/i);
    return (match ? match[1] : withoutPeriod).trim();
  }

  function normalizeWorkspaceSubjectAndDescription(content) {
    const raw = String(content || "").replace(/\r\n/g, "\n").trim();
    if (!raw) return "";

    const subjectMatch = raw.match(/^Subject:\s*(.+)$/im);
    if (!subjectMatch) return raw;

    const normalizedSubject = window.MAUSandzTicketRules
      ? window.MAUSandzTicketRules.normalizeSubject(subjectMatch[1],raw)
      : String(subjectMatch[1] || "").trim().replace(/\s+Ticket\s+No\.\s*#?\d+\s*$/i, "").replace(/\.$/, "");
    const normalizedDescription = extractDescriptionFromSubject(normalizedSubject);
    let updated = raw.replace(/^Subject:\s*.+$/im, `Subject: ${normalizedSubject}`);
    if (normalizedDescription) {
      if (/^Description:\s*.*$/im.test(updated)) {
        updated = updated.replace(/^Description:\s*.*$/im, `Description: ${normalizedDescription}`);
      }
      if (/^Issue Description:\s*.*$/im.test(updated)) {
        updated = updated.replace(/^Issue Description:\s*.*$/im, `Issue Description: ${normalizedDescription}`);
      }
    }
    return updated;
  }

  function extractWorkspaceContentFromReply(replyText) {
    const raw = String(replyText || "").trim();
    if (!raw) return "";

    const fencedMatch = raw.match(/```text\s*([\s\S]*?)```/i) || raw.match(/```\s*([\s\S]*?)```/);
    if (fencedMatch) {
      return formatWorkspaceSpacing(normalizeWorkspaceSubjectAndDescription(String(fencedMatch[1] || "")));
    }

    return formatWorkspaceSpacing(normalizeWorkspaceSubjectAndDescription(raw));
  }

  function updateWorkspaceFromAssistantReply(replyText) {
    const content = extractWorkspaceContentFromReply(replyText);
    if (!content) return;
    setEditorText(content);
    saveCurrentCodeToHistory(true);
    window.lastSavedCode = getEditorText();
    showSnackbar("Workspace updated from the latest assistant response.");
  }

  async function fetchTeamAiResponse(prompt) {
    if (!window.MAUUserGemini) throw new Error("Gemini API module is unavailable.");
    const model = $("my-select-dropdown").value;
    const history = state.chatConversation.slice(-8).map(function (item) {
      return {
        role: item.role === "model" ? "model" : "user",
        text: Array.isArray(item.parts) ? item.parts.map(p => p.text || "").join("\n") : ""
      };
    }).filter(item => item.text);
    const result = await window.MAUUserGemini.generate({
      model,
      messages: history.concat([{role:"user", text:prompt}])
    });
    if (!result.text) throw new Error("Gemini returned an empty response.");
    return result.text;
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
      const ocrText = getLatestReadyOcrText() || getCombinedOcrText().trim();
      const mode = state.outputMode === "email" ? "email" :
        state.outputMode === "qa" ? "qa" : detectInteractionMode(userText, workspaceText, ocrText);
      const currentAccountKey = resolveAccountKeyFromContext(workspaceText, ocrText, userText);
      maybeResetAiContextForAccountChange(currentAccountKey, mode);
      const scopedContext = buildScopedPromptContext(userText, currentAccountKey);
      const combinedInput = [scopedContext.workspace, scopedContext.ocrText, scopedContext.userText].filter(Boolean).join("\n\n");
      if (!hasUsableIncidentDetails(combinedInput) && mode !== "qa") {
        addMessage(EMPTY_INCIDENT_PROMPT, "ai");
        return;
      }

      const prompt = buildPrompt(userText, mode, scopedContext);
      const reply = await fetchTeamAiResponse(prompt);
      let normalizedReply = normalizeAssistantOutput(reply, mode);
      let classificationCorrections = [];
      if (mode === "standard" && window.MAUSandzTicketRules) {
        const checked = window.MAUSandzTicketRules.fixZohoText(normalizedReply, combinedInput);
        normalizedReply = checked.text;
        classificationCorrections = checked.changes;
      }
      state.chatConversation.push({
        role: "user",
        parts: [{ text: prompt }]
      });
      state.chatConversation.push({
        role: "model",
        parts: [{ text: normalizedReply }]
      });
      persistConversation();
      if (mode !== "bridge") {
        const session = getActiveSession();
        if (session) {
          session.lastPromptedAccount = currentAccountKey;
          markActiveSessionUpdated();
        }
        state.pendingFreshAccountContext = false;
      }
      addMessage(normalizedReply, "ai", {mode:mode});
      if (classificationCorrections.length) {
        showSnackbar("Verified SANDZ ticket mapping: " + classificationCorrections.join(", "));
      }
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
    state.pendingFreshAccountContext = false;
    const session = getActiveSession();
    if (session) {
      session.lastPromptedAccount = "";
      session.lastContextResetAt = "";
      markActiveSessionUpdated();
    }
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
    // Always display the original picture-based profile chooser at startup.
    state.bootProfileId = "";
    cleanupLegacyProfileApiKeys();
    try { localStorage.removeItem(STORAGE_KEYS.apiKey); } catch (error) {}

    state.apiKey = "";
    // Legacy stored keys are deleted. New user keys are only held in memory.
    renderProfileChooser();
    renderAttachmentTray();

    bindModalClosers();
    initializeSettings();
    initializeEditorHooks();

    if (!state.listenersBound) {
      state.listenersBound = true;
      $("send-button").addEventListener("click", sendMessage);
      document.querySelectorAll("[data-output-mode]").forEach(function (button) {
        button.addEventListener("click", function () {
          state.outputMode = button.dataset.outputMode;
          document.querySelectorAll("[data-output-mode]").forEach(function (item) {
            const selected = item === button;
            item.classList.toggle("active", selected);
            item.setAttribute("aria-pressed", String(selected));
          });
          const help = $("outputModeHelp");
          if (help) help.textContent = state.outputMode === "email"
            ? "Draft a customer-ready email from the incident details. No invented names, ticket numbers, or signature."
            : state.outputMode === "qa"
              ? "Ask about likely causes, safe first checks, or the best Zoho classification."
              : "Generate Zoho fields and a separate internal troubleshooting comment.";
          $("chat-input").placeholder = state.outputMode === "email"
            ? "Paste the alert and details. Add the recipient and ticket number if available..."
            : state.outputMode === "qa"
              ? "Ask about symptoms, ticket classification, or next safe troubleshooting steps..."
              : "Paste the monitoring alert, customer request, or incident details...";
        });
      });
      $("clear-chat-btn").addEventListener("click", openClearChatModal);
      $("confirmClearChatBtn").addEventListener("click", clearChatHistory);
      $("chatSessionSelect").addEventListener("change", function (event) {
        switchChatSession(event.target.value);
      });
      $("newChatSessionBtn").addEventListener("click", createChatSession);
      $("renameChatSessionBtn").addEventListener("click", renameChatSession);
      $("deleteChatSessionBtn").addEventListener("click", deleteChatSession);
      $("logoutProfileBtn").addEventListener("click", logoutProfile);
      $("sidebarSwitchProfileBtn")?.addEventListener("click", logoutProfile);
      $("attachImageBtn").addEventListener("click", function () { $("imageAttachmentInput").click(); });
      $("imageAttachmentInput").addEventListener("change", function (event) {
        handleImageFiles(event.target.files);
        event.target.value = "";
      });
      $("clearAttachmentsBtn").addEventListener("click", clearAttachments);
      $("chat-messages").addEventListener("click", async function (event) {
        const emailButton = event.target.closest("[data-draft-email]");
        if (emailButton) {
          const selectEmail = document.querySelector('[data-output-mode="email"]');
          if (selectEmail) selectEmail.click();
          const input = $("chat-input");
          if (input) {
            input.value = "Draft a client email from the current Zoho ticket details. Include a ticket number or recipient only if supplied. ";
            input.focus();
          }
          showSnackbar("Client Email selected. Add any missing recipient or ticket number, then send.");
          return;
        }
        const copyButton = event.target.closest("[data-copy-result]");
        if (copyButton) {
          const card = copyButton.closest(".ticket-result-card, .client-email-result");
          const textArea = card && card.querySelector(copyButton.dataset.copyResult === "notes" ? ".result-notes-source" : ".result-raw-source");
          const copied = await copyResponseValue(textArea ? textArea.value : "");
          showSnackbar(copied ? "Copied. Paste into Zoho Desk after reviewing." : "Unable to copy automatically. Use View original text instead.");
          return;
        }
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


