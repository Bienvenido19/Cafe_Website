# Apps Script setup — Bloom & Bean reservations

This is the free backend for the reservation form. It runs entirely on
Google's servers (Sheets + Gmail + Calendar) — no Google Cloud Console, no
API keys, no credit card. Follow the six checkpoints in order.

---

## ☐ Checkpoint 1 — Create and format the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet.
2. Rename the sheet tab (bottom-left) to exactly: `Reservation Tracker`
3. In row 1, type any decorative title you like (e.g. "Bloom & Bean — Reservations"). It's ignored by the script.
4. In row 2, enter these exact headers, one per column, A through H:

   | Col | Header |
   |-----|--------|
   | A | Status |
   | B | Email Link |
   | C | Full Name |
   | D | Phone number |
   | E | Email address |
   | F | Date of visit |
   | G | Arrival time |
   | H | Note |

5. In row 3, this becomes your **template row** — every future reservation copies its formatting from here. Select cell **A3** → **Data → Data validation** → Criteria: **Dropdown** → add these four values exactly:
   `Paid`, `Pending`, `Follow up`, `Double booking`, `No reply`
6. Leave A3:H3 otherwise empty — no sample data. Apply whatever bold/borders/column widths you want row 3 to have; new rows will copy this styling.
7. Format column F (Date of visit) as a date if you'd like it to display as one — the script works either way.

**Success looks like:** row 2 has the 8 headers above, row 3 has a working Status dropdown and is otherwise blank.
**Common failure:** typing headers with different capitalization or extra spaces. The script doesn't read headers by name, but keeping them exact avoids confusion later.

☐ Done? Continue to checkpoint 2.

---

## ☐ Checkpoint 2 — Paste the script

1. In the Sheet, go to **Extensions → Apps Script**. A new tab opens with an empty `Code.gs`.
2. Delete the placeholder content of `Code.gs` and paste in the entire contents of `apps-script/Code.gs` from this project.
3. In the left sidebar, click the **⚙ Project Settings** icon, then check **"Show 'appsscript.json' manifest file in editor"**.
4. Go back to the editor, open `appsscript.json`, delete its contents, and paste in the entire contents of `apps-script/appsscript.json` from this project.
5. Click the **Save project** icon (💾).

**Success looks like:** two files exist in the left sidebar, `Code.gs` and `appsscript.json`, both saved with no red error underlines.
**Common failure:** pasting `Code.gs` into `appsscript.json` or vice versa — they're different formats (JavaScript vs. JSON). Double check before saving.

☐ Done? Continue to checkpoint 3.

---

## ☐ Checkpoint 3 — Add Script Properties and set the timezone

1. Still in the Apps Script editor, click **⚙ Project Settings** in the left sidebar.
2. Scroll to **Script Properties** → **Add script property**. Add each of these one at a time (property / value):

   | Property | Value |
   |----------|-------|
   | `SHARED_SECRET` | Any long random string, e.g. `bb-2f9c7a1e4d8b4a6f9c3e2d1a0b5f7e6c` — you'll reuse this exact value in Vercel later. |
   | `SHEET_NAME` | `Reservation Tracker` |
   | `CALENDAR_ID` | `primary` |
   | `REPLY_TO` | The café owner's real email address, e.g. `morning@bloomandbean.ph` |
   | `PAYMENT_NUMBER` | The GCash/bank number guests should pay the deposit to |
   | `PAYMENT_QR_URL` | *(optional)* A public HTTPS image URL of a payment QR code. Leave blank to omit it from the email. |

3. Click **Save script properties**.
4. Set the script's timezone: still in Project Settings, under **General settings**, set **Time zone** to `(GMT+08:00) Asia/Manila`.
5. Also set the spreadsheet's own timezone: back in the Sheet, go to **File → Settings → General**, set **Time zone** to `(GMT+08:00) Manila`, and save.

**Success looks like:** 6 script properties saved, both the script and spreadsheet timezone show Asia/Manila.
**Common failure:** setting only one of the two timezones. Both matter — the script's timezone affects date math, the spreadsheet's affects how date-formatted cells display and are read back.

☐ Done? Continue to checkpoint 4.

---

## ☐ Checkpoint 4 — Authorize and install the trigger

1. In the Apps Script editor's toolbar, use the function dropdown (next to **Debug**) to select **`authorizeServices`**.
2. Click **Run**. A Google popup asks you to authorize — choose your account, click **Advanced → Go to (project name) (unsafe)** (this warning is normal for your own unpublished script), then **Allow**.
3. Once it finishes, open **View → Executions** or **View → Logs** and confirm you see: *"Authorization check complete."*
4. From the function dropdown, select **`setupReservationTrigger`** and click **Run**.
5. Check the log again for: *"Installed exactly one onEdit trigger..."*

**Success looks like:** both functions run without a red error, and the logs confirm authorization and one installed trigger.
**Common failure:** clicking "Allow" too fast on a different account than the one that owns the Sheet — make sure you authorize as the café's Google account, not a personal one, if they're different.

☐ Done? Continue to checkpoint 5.

---

## ☐ Checkpoint 5 — Deploy as a Web App

1. Click **Deploy → New deployment**.
2. Click the ⚙ gear next to "Select type" → choose **Web app**.
3. Fill in:
   - **Description**: `Reservation intake v1`
   - **Execute as**: **Me** (your account)
   - **Who has access**: **Anyone**
4. Click **Deploy**. Authorize again if prompted.
5. Copy the **Web app URL** shown — it looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`

   ⚠️ **This is not the same as the Deployment ID.** The Deployment ID is a shorter string shown separately in the deployment list — you don't need it. You need the full URL, and it **must end in `/exec`** (not `/dev`).

**Success looks like:** you have a URL copied that starts with `https://script.google.com/macros/s/` and ends with `/exec`.
**Common failure:** copying the `/dev` testing URL instead — that one only works for you while logged in, not for real visitors.

☐ Done? Continue to checkpoint 6.

---

## ☐ Checkpoint 6 — Add the Vercel variables and test end-to-end

1. In your Vercel project, go to **Settings → Environment Variables** and add:
   - `APPS_SCRIPT_WEB_APP_URL` = the `/exec` URL from checkpoint 5
   - `APPS_SCRIPT_SHARED_SECRET` = the exact same value you set for `SHARED_SECRET` in checkpoint 3
2. Redeploy the site (Vercel does this automatically on the next push, or click **Redeploy**).
3. Open the live site, fill out the reservation form with a real email address you can check, and submit.
4. Confirm:
   - The success message appears in the browser.
   - A new row appears in **Reservation Tracker** with Status `Pending`.
   - Column B's "Open email" link opens Gmail search and finds the sent message.
   - The guest email arrives with the reservation code, date, time, and deposit instructions.
5. In the Sheet, change that row's Status to `Paid`. Within a few seconds:
   - The Status cell gets a note starting with `Calendar confirmed`.
   - A 90-minute event appears on the connected Google Calendar, and the guest receives a calendar invite.
6. Change the Status of a different row to `Paid` a second time on the *same* row (re-select `Paid` again) and confirm no duplicate event is created.

**Success looks like:** every item above happened. **Common failure:** if the Web App returns an HTML page instead of JSON, the API route will report a configuration error — recheck that "Who has access" is set to **Anyone** in checkpoint 5.

---

## After changing Code.gs later

If you ever edit `Code.gs` or `appsscript.json` again, the `/exec` URL will
**not** change automatically — you must push a new version to the *existing*
deployment:

**Deploy → Manage deployments → (pencil/Edit icon) → Version: New version → Deploy**

Do not create a brand new deployment for routine changes, or your Vercel
`APPS_SCRIPT_WEB_APP_URL` will point at the old, stale version.

---

## Manual verification that remains outside automated tests

Because this integration depends on authenticated Google services (Gmail
sending, Calendar invites, real spreadsheet edits), the following can only be
verified by hand, using checkpoint 6 above:

- An email is actually delivered and formatted correctly in a real inbox.
- A Calendar invite is actually received by the guest's email address.
- The Gmail search link in column B actually finds the sent message.
- Re-selecting `Paid` on an already-confirmed row does not create a second
  Calendar event.
