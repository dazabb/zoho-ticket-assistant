# MAU Operation Desk v3.1.0 — AI-assisted CSA verification

## CSA Generator

- Added optional Gemini-assisted CSA extraction using the same personal Gemini key already configured for Ticket Workspace.
- Rule-based parsing remains the first pass and fallback; no AI key is required to keep using CSA Generator.
- Gemini receives the pasted ticket plus the rule-based draft and returns structured CSA fields with source evidence.
- AI-proposed corrections are accepted only when they are supported by the current pasted ticket.
- Company Name and Location Address remain separate concepts: Store/Site vs. physical service address.
- AI can restore a missing onsite time when the pasted ticket explicitly contains it.
- AI can repair overly generic store names such as `PENSHOPPE` when the source explicitly states a full Store Name.
- AI can split flattened copied email prose into separate Engineer Task / Activity lines.
- Added hard filtering so tool/material packing lists (USB drives, crimper, RJ45, cable ties, thermal paste, etc.) cannot become engineer tasks even if AI suggests them.
- Explicit `Address:` evidence can replace a suspicious or weaker parsed location.
- Ticket Category, Issue Category, and Issue Description continue to prefer explicit Zoho fields; AI fills them only when missing.
- Created Date is still the current Philippine date and cannot be changed by AI.
- Support Agent and Assigned Engineer remain blank.
- Multiple tickets are AI-verified sequentially to avoid mixing values across tickets.
- Added an `AI recheck current fields` action for reviewing edited CSA data against the original pasted ticket.
- If Gemini is unavailable or errors, CSA Generator falls back to the existing deterministic parser and does not discard the parsed ticket.

## QA case

The AI merge layer was regression-tested against the #113491 failure pattern where the old output showed a generic Company Name, dropped the 9:00 AM schedule time, and collapsed multiple work items into one long email sentence. The hybrid merge restores the full store name, explicit time, serial number, physical address, and separate work items while rejecting tool-list entries.
