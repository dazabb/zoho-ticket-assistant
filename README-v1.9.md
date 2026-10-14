# MAU Operation Desk v1.9

## Updated Zoho classification

Administrative login/access requests are **Request** tickets, not automatically Incidents. For existing EWB ticket **#111852**, the validated mapping is:

- Ticket Category: **Request**
- Issue Category: **Backup - Request**
- Supported Portfolio: **(BaaS) Backup as a Service**
- Technology/Platform: **Atempo TINA**
- Internal note heading: **Existing Request Ticket**

The app validates the generated AI reply and validates the final Zoho autofill payload after account/platform mapping. Do not treat these suggestions as evidence that a Zoho dropdown contains the indicated value: confirm the request subcategory manually.

## Screenshots in chat

- Paste a screenshot into the message box using Ctrl+V, drag an image onto the composer, or select **+ Image**.
- Image thumbnails appear in the message box with an **×** button to remove each image.
- Type a customer name, such as `Monde Nissin`, then click **Send**. Images are sent directly to your Gemini model using its native image input, rather than requiring OCR to finish.
- Up to four PNG, JPEG, or WebP screenshots can be sent per message (each under 9 MB).
- Images currently attached to the composer are removed after a successful response. Image bytes are not saved in MAU local storage, so after a refresh you will need to attach the image again.
- If a screenshot has insufficient visible information, the assistant should ask only for the missing facts and never invent ticket numbers, classifications, customers or errors.

## Other features

Picture profiles, browser-saved per-profile Gemini API keys, the chat view, Monde Nissin reporting, Viber Follow-up, and Zoho Autofill remain in place.

## Start

Extract the ZIP, and start using `START-MAU-DESK.bat` (Windows). Continue using the same browser and local app address if you want your individual profile's saved key and chat sessions to remain accessible.

## Privacy & security

The personal API key is saved in that browser profile's local storage for convenience. MAU picture profiles are not password-protected accounts. Anyone with access to the browser or its storage may be able to use the key. The browser sends screenshots directly to Google Gemini when you click Send. Do not send confidential customer screenshots or credentials unless your organization permits that use.

## Testing

The JavaScript syntax, native Gemini image request payload, and the EWB administrative request ticket text and autofill guard have been checked using simulated inputs. Live Gemini responses, real Zoho submission, and full browser visual inspection still require local verification.
