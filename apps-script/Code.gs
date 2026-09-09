/**
 * Bloom & Bean — Reservation Tracker Apps Script
 * =================================================
 * Spreadsheet-bound script. Do not deploy this as a standalone script —
 * open it from Extensions → Apps Script inside the Google Sheet.
 *
 * Responsibilities:
 *   1. doPost(e)                     Receive a validated reservation from
 *                                     the Next.js server, write it to the
 *                                     Sheet, and email the guest.
 *   2. onReservationStatusEdit(e)    Installable onEdit trigger. When staff
 *                                     changes Status (column A) to "Paid",
 *                                     create a 90-minute Calendar event and
 *                                     invite the guest.
 *
 * Setup functions (run manually from the Apps Script editor, once):
 *   authorizeServices()      Forces the Sheets/Gmail/Calendar auth prompt.
 *   setupReservationTrigger()  Installs exactly one onEdit trigger.
 *   diagnoseSelectedPaidRow()  Inspects the selected row without writing.
 *   checkSetup()              Reports missing config without leaking secrets.
 *
 * See apps-script/README.md for the full setup walkthrough.
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

var STATUS_COLUMN = 1; // A
var EMAIL_LINK_COLUMN = 2; // B
var FULL_NAME_COLUMN = 3; // C
var PHONE_COLUMN = 4; // D
var EMAIL_COLUMN = 5; // E
var DATE_COLUMN = 6; // F
var ARRIVAL_COLUMN = 7; // G
var NOTE_COLUMN = 8; // H
var TOTAL_COLUMNS = 8;
var FIRST_DATA_ROW = 3; // Rows 1–2 are title + headers.

// Keep this in sync with lib/site-config.ts's seatingWindows. The label is
// what staff see in column G; startTime is the clock time used to build the
// Calendar event when Status becomes Paid (the start of each window).
var ARRIVAL_WINDOWS = {
  morning: { label: "Morning (8:00 AM – 11:30 AM)", startTime: "8:00 AM" },
  lunch: { label: "Lunch & Pour-over (12:00 PM – 2:30 PM)", startTime: "12:00 PM" },
  afternoon: { label: "Afternoon & Pastries (3:00 PM – 5:30 PM)", startTime: "3:00 PM" },
};

var GUEST_COUNT_VALUES = ["1", "2", "3-4", "5+"];

var PH_MOBILE_REGEX = /^(?:\+?63|0)9\d{9}$/;
var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var RESERVATION_CODE_REGEX = /^BB-\d{8}-[A-Z0-9]{4}$/;

var ALLOWED_STATUS_VALUES = ["Paid", "Pending", "Follow up", "Double booking", "No reply"];

// ---------------------------------------------------------------------------
// Web App entry point
// ---------------------------------------------------------------------------

function doPost(e) {
  var reservationCodeForResponse = "";
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse_({
        ok: false,
        recorded: false,
        emailSent: false,
        reservationCode: "",
        errorCode: "bad_request",
      });
    }

    var body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse_({
        ok: false,
        recorded: false,
        emailSent: false,
        reservationCode: "",
        errorCode: "invalid_json",
      });
    }

    var sharedSecret = getProp_("SHARED_SECRET");
    if (!sharedSecret || !timingSafeEqual_(String(body.secret || ""), sharedSecret)) {
      return jsonResponse_({
        ok: false,
        recorded: false,
        emailSent: false,
        reservationCode: "",
        errorCode: "unauthorized",
      });
    }

    var validation = validateReservationPayload_(body);
    if (!validation.valid) {
      return jsonResponse_({
        ok: false,
        recorded: false,
        emailSent: false,
        reservationCode: String(body.reservationCode || ""),
        errorCode: "invalid_payload",
      });
    }

    var data = validation.data;
    reservationCodeForResponse = data.reservationCode;

    var lock = LockService.getScriptLock();
    var acquired = false;
    var duplicate = false;

    try {
      acquired = lock.tryLock(10000);
      if (!acquired) {
        return jsonResponse_({
          ok: false,
          recorded: false,
          emailSent: false,
          reservationCode: data.reservationCode,
          errorCode: "locked",
        });
      }

      var sheet = getSheet_();

      if (reservationCodeExists_(sheet, data.reservationCode)) {
        duplicate = true;
      } else {
        var targetRow = findOrCreateTargetRow_(sheet);
        writeReservationRow_(sheet, targetRow, data);
      }
    } catch (writeErr) {
      logError_("doPost row write", writeErr);
      return jsonResponse_({
        ok: false,
        recorded: false,
        emailSent: false,
        reservationCode: data.reservationCode,
        errorCode: "write_failed",
      });
    } finally {
      if (acquired) lock.releaseLock();
    }

    if (duplicate) {
      // Client retried a request that was already saved. Do not write a
      // second row and do not resend the email — just confirm it's recorded.
      return jsonResponse_({
        ok: true,
        recorded: true,
        emailSent: false,
        reservationCode: data.reservationCode,
        errorCode: "duplicate_skipped",
      });
    }

    var emailSent = false;
    try {
      sendConfirmationEmail_(data);
      emailSent = true;
    } catch (emailErr) {
      logError_("doPost sendConfirmationEmail", emailErr);
      emailSent = false;
    }

    return jsonResponse_({
      ok: true,
      recorded: true,
      emailSent: emailSent,
      reservationCode: data.reservationCode,
    });
  } catch (topLevelErr) {
    logError_("doPost top-level", topLevelErr);
    return jsonResponse_({
      ok: false,
      recorded: false,
      emailSent: false,
      reservationCode: reservationCodeForResponse,
      errorCode: "internal_error",
    });
  }
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

// ---------------------------------------------------------------------------
// Validation (mirrors lib/validation.ts — this is the authoritative check;
// the Next.js server's Zod validation only improves UX and is not trusted).
// ---------------------------------------------------------------------------

function validateReservationPayload_(body) {
  try {
    var reservationCode = String(body.reservationCode || "").trim();
    if (!RESERVATION_CODE_REGEX.test(reservationCode)) return { valid: false };

    var fullName = sanitizeForSpreadsheet_(String(body.fullName || "").trim());
    if (fullName.length < 2 || fullName.length > 100) return { valid: false };

    var phoneRaw = String(body.phone || "").trim();
    if (phoneRaw.length > 20) return { valid: false };
    var phoneNormalized = phoneRaw.replace(/[\s-]/g, "");
    if (!PH_MOBILE_REGEX.test(phoneNormalized)) return { valid: false };
    var phone = sanitizeForSpreadsheet_(phoneRaw);

    var email = sanitizeForSpreadsheet_(String(body.email || "").trim().toLowerCase());
    if (!EMAIL_REGEX.test(email) || email.length > 254) return { valid: false };

    var dateOfVisit = String(body.dateOfVisit || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfVisit)) return { valid: false };
    if (!isTodayOrLaterManila_(dateOfVisit)) return { valid: false };

    var arrivalKey = String(body.arrivalTime || "").trim();
    var arrivalWindow = ARRIVAL_WINDOWS[arrivalKey];
    if (!arrivalWindow) return { valid: false };

    var guestCount = String(body.guestCount || "").trim();
    if (GUEST_COUNT_VALUES.indexOf(guestCount) === -1) return { valid: false };

    var occasion = sanitizeForSpreadsheet_(String(body.occasion || "").trim()).slice(0, 120);
    var specialRequests = sanitizeForSpreadsheet_(
      String(body.specialRequests || "").trim(),
    ).slice(0, 500);

    return {
      valid: true,
      data: {
        reservationCode: reservationCode,
        fullName: fullName,
        phone: phone,
        email: email,
        dateOfVisit: dateOfVisit,
        arrivalTimeKey: arrivalKey,
        arrivalTimeLabel: arrivalWindow.label,
        arrivalStartTime: arrivalWindow.startTime,
        guestCount: guestCount,
        occasion: occasion,
        specialRequests: specialRequests,
      },
    };
  } catch (err) {
    return { valid: false };
  }
}

function isTodayOrLaterManila_(dateStr) {
  var todayStr = Utilities.formatDate(new Date(), "Asia/Manila", "yyyy-MM-dd");
  return dateStr >= todayStr; // ISO yyyy-MM-dd strings compare correctly lexicographically.
}

/**
 * Neutralizes spreadsheet formula injection. Mirrors
 * lib/validation.ts#sanitizeForSpreadsheet exactly.
 */
function sanitizeForSpreadsheet_(value) {
  if (/^[=+\-@\t\r]/.test(value)) {
    return "'" + value;
  }
  return value;
}

/** Simple constant-time string comparison so secret checks don't leak
 * timing information via early-exit comparisons. */
function timingSafeEqual_(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  var maxLen = Math.max(a.length, b.length);
  var diff = a.length === b.length ? 0 : 1;
  for (var i = 0; i < maxLen; i++) {
    var ca = i < a.length ? a.charCodeAt(i) : 0;
    var cb = i < b.length ? b.charCodeAt(i) : 0;
    diff |= ca ^ cb;
  }
  return diff === 0;
}

// ---------------------------------------------------------------------------
// Sheet access
// ---------------------------------------------------------------------------

function getSheetName_() {
  return getProp_("SHEET_NAME") || "Reservation Tracker";
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(getSheetName_());
  if (!sheet) {
    throw new Error("Sheet not found: " + getSheetName_());
  }
  return sheet;
}

function getProp_(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}

function reservationCodeExists_(sheet, code) {
  var lastRow = sheet.getLastRow();
  if (lastRow < FIRST_DATA_ROW) return false;
  var values = sheet
    .getRange(FIRST_DATA_ROW, NOTE_COLUMN, lastRow - FIRST_DATA_ROW + 1, 1)
    .getValues();
  var needle = "Reservation Code: " + code;
  for (var i = 0; i < values.length; i++) {
    var cell = values[i][0];
    if (typeof cell === "string" && cell.indexOf(needle) !== -1) return true;
  }
  return false;
}

function isRowEmpty_(rowValues) {
  for (var i = 0; i < rowValues.length; i++) {
    var v = rowValues[i];
    if (v !== "" && v !== null && typeof v !== "undefined") return false;
  }
  return true;
}

/**
 * Finds the first genuinely empty prepared row from row 3 downward. If none
 * remain, appends one row and copies formatting + data validation (never
 * values) from the row 3 template so the Status dropdown and styling are
 * preserved.
 */
function findOrCreateTargetRow_(sheet) {
  var lastRow = sheet.getLastRow();

  if (lastRow >= FIRST_DATA_ROW) {
    var range = sheet.getRange(FIRST_DATA_ROW, 1, lastRow - FIRST_DATA_ROW + 1, TOTAL_COLUMNS);
    var values = range.getValues();
    for (var i = 0; i < values.length; i++) {
      if (isRowEmpty_(values[i])) return FIRST_DATA_ROW + i;
    }
  }

  var insertAfter = Math.max(lastRow, FIRST_DATA_ROW - 1);
  sheet.insertRowAfter(insertAfter);
  var newRow = insertAfter + 1;

  // Only copy from row 3 if it already existed as a formatted template row
  // before this insert (see apps-script/README.md checkpoint 1).
  if (lastRow >= FIRST_DATA_ROW) {
    var templateRange = sheet.getRange(FIRST_DATA_ROW, 1, 1, TOTAL_COLUMNS);
    var newRange = sheet.getRange(newRow, 1, 1, TOTAL_COLUMNS);
    templateRange.copyTo(newRange, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
    templateRange.copyTo(newRange, SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION, false);
    sheet.setRowHeight(newRow, sheet.getRowHeight(FIRST_DATA_ROW));
  }

  return newRow;
}

function writeReservationRow_(sheet, row, data) {
  sheet.getRange(row, STATUS_COLUMN).clearNote().setValue("Pending");
  sheet.getRange(row, EMAIL_LINK_COLUMN).setFormula(buildGmailSearchFormula_(data.reservationCode));
  sheet.getRange(row, FULL_NAME_COLUMN).setValue(data.fullName);
  sheet.getRange(row, PHONE_COLUMN).setValue(data.phone);
  sheet.getRange(row, EMAIL_COLUMN).setValue(data.email);
  sheet.getRange(row, DATE_COLUMN).setValue(data.dateOfVisit);
  sheet.getRange(row, ARRIVAL_COLUMN).setValue(data.arrivalTimeLabel);
  sheet.getRange(row, NOTE_COLUMN).setValue(buildNoteColumnH_(data));
}

/** A safe HYPERLINK formula (not mailto:) that opens Gmail and searches
 * in:anywhere for the exact reservation code. */
function buildGmailSearchFormula_(code) {
  var query = encodeURIComponent("in:anywhere " + code);
  var url = "https://mail.google.com/mail/u/0/#search/" + query;
  return '=HYPERLINK("' + url + '","Open email")';
}

function buildNoteColumnH_(data) {
  var lines = [
    "Reservation Code: " + data.reservationCode,
    "Guests: " + data.guestCount,
    "Occasion: " + (data.occasion ? data.occasion : "None"),
    "Requests: " + (data.specialRequests ? data.specialRequests : "None"),
    "Submitted: " + formatManilaTimestamp_(),
  ];
  return lines.join("\n");
}

function formatManilaTimestamp_() {
  return Utilities.formatDate(new Date(), "Asia/Manila", "MMMM d, yyyy, h:mm a") + " PHT";
}

// ---------------------------------------------------------------------------
// Gmail confirmation email
// ---------------------------------------------------------------------------

function sendConfirmationEmail_(data) {
  var replyTo = getProp_("REPLY_TO") || "";
  var paymentNumber = getProp_("PAYMENT_NUMBER") || "(payment number not yet configured)";
  var qrUrl = getProp_("PAYMENT_QR_URL") || "";
  var depositAmount = 100;
  var cafeName = "Bloom & Bean";

  var subject = data.reservationCode + " | Your " + cafeName + " Reservation Request";
  var htmlBody = buildEmailHtml_(data, {
    paymentNumber: paymentNumber,
    qrUrl: qrUrl,
    depositAmount: depositAmount,
    cafeName: cafeName,
  });
  var textBody = buildEmailText_(data, {
    paymentNumber: paymentNumber,
    depositAmount: depositAmount,
    cafeName: cafeName,
  });

  var options = { htmlBody: htmlBody };
  if (replyTo) options.replyTo = replyTo;

  // GmailApp sends from and retains a copy in the owner's own Gmail Sent
  // folder automatically — do not CC the sender, and do not use MailApp,
  // which would not appear under the owner's Gmail history the same way.
  GmailApp.sendEmail(data.email, subject, textBody, options);
}

function formatDisplayDate_(isoDate) {
  return Utilities.formatDate(
    new Date(isoDate + "T00:00:00Z"),
    "Asia/Manila",
    "EEEE, MMMM d, yyyy",
  );
}

function buildEmailHtml_(data, opts) {
  var displayDate = formatDisplayDate_(data.dateOfVisit);
  var qrImageHtml = opts.qrUrl
    ? '<img src="' +
      opts.qrUrl +
      '" alt="Payment QR code" width="180" height="180" style="display:block;margin:16px auto 0;border-radius:8px;border:1px solid #d3c3be;" />'
    : "";

  return (
    '<div style="background-color:#fcf9f4;padding:32px 16px;font-family:Georgia,\'Times New Roman\',serif;color:#1c1c19;">' +
    '<div style="max-width:520px;margin:0 auto;background-color:#ffffff;border:1px solid #d3c3be;border-radius:8px;overflow:hidden;">' +
    '<div style="background-color:#2c1b14;padding:24px 32px;">' +
    '<h1 style="margin:0;font-size:22px;color:#fcdcd0;font-weight:normal;">' +
    opts.cafeName +
    "</h1>" +
    '<p style="margin:4px 0 0;font-size:13px;color:#dec0b5;">Salcedo Village, Makati</p>' +
    "</div>" +
    '<div style="padding:28px 32px;">' +
    '<p style="font-size:15px;line-height:1.6;margin:0 0 16px;">Hi ' +
    escapeHtml_(data.fullName) +
    ",</p>" +
    '<p style="font-size:15px;line-height:1.6;margin:0 0 20px;">' +
    "Thank you for your reservation request. Your table is <strong>pending confirmation</strong> — " +
    "we will confirm once your deposit is received." +
    "</p>" +
    '<table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">' +
    emailRow_("Reservation code", data.reservationCode) +
    emailRow_("Date", displayDate) +
    emailRow_("Time", data.arrivalTimeLabel) +
    emailRow_("Guests", data.guestCount) +
    emailRow_("Occasion", data.occasion || "—") +
    emailRow_("Requests", data.specialRequests || "—") +
    "</table>" +
    '<div style="background-color:#f6f3ee;border:1px solid #d3c3be;border-radius:6px;padding:16px 20px;margin-bottom:20px;">' +
    '<p style="margin:0 0 8px;font-size:14px;font-weight:bold;color:#2c1b14;">' +
    "₱" +
    opts.depositAmount +
    " deposit to secure your table" +
    "</p>" +
    '<p style="margin:0;font-size:14px;line-height:1.6;">' +
    "Please send your ₱" +
    opts.depositAmount +
    " deposit to <strong>" +
    escapeHtml_(opts.paymentNumber) +
    "</strong>. Once received, our staff will confirm your table and you'll get a calendar invitation by email." +
    "</p>" +
    qrImageHtml +
    "</div>" +
    '<p style="font-size:13px;line-height:1.6;color:#4f4441;margin:0;">' +
    "This is a request for staff review and does not guarantee a table until confirmed. " +
    "Reply to this email if you have any questions." +
    "</p>" +
    "</div>" +
    '<div style="background-color:#f0ede9;padding:16px 32px;text-align:center;">' +
    '<p style="margin:0;font-size:12px;color:#817470;">See you in the morning.</p>' +
    "</div>" +
    "</div>" +
    "</div>"
  );
}

function emailRow_(label, value) {
  return (
    '<tr><td style="padding:6px 0;color:#4f4441;width:40%;vertical-align:top;">' +
    escapeHtml_(label) +
    '</td><td style="padding:6px 0;color:#1c1c19;font-weight:600;">' +
    escapeHtml_(String(value)) +
    "</td></tr>"
  );
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmailText_(data, opts) {
  var displayDate = formatDisplayDate_(data.dateOfVisit);
  var lines = [
    "Hi " + data.fullName + ",",
    "",
    "Thank you for your reservation request. Your table is pending confirmation — we will confirm once your deposit is received.",
    "",
    "Reservation code: " + data.reservationCode,
    "Date: " + displayDate,
    "Time: " + data.arrivalTimeLabel,
    "Guests: " + data.guestCount,
    "Occasion: " + (data.occasion || "None"),
    "Requests: " + (data.specialRequests || "None"),
    "",
    "₱" + opts.depositAmount + " deposit to secure your table:",
    "Please send your ₱" + opts.depositAmount + " deposit to " + opts.paymentNumber + ".",
    "Once received, our staff will confirm your table and you'll get a calendar invitation by email.",
    "",
    "This is a request for staff review and does not guarantee a table until confirmed.",
    "",
    "See you in the morning.",
    opts.cafeName,
  ];
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Paid → Calendar workflow (installable onEdit trigger)
// ---------------------------------------------------------------------------

function onReservationStatusEdit(e) {
  try {
    if (!e || !e.range) return;

    var sheet = e.range.getSheet();
    if (sheet.getName() !== getSheetName_()) return;
    if (e.range.getNumRows() !== 1 || e.range.getNumColumns() !== 1) return;

    var row = e.range.getRow();
    var col = e.range.getColumn();
    if (row < FIRST_DATA_ROW) return;
    if (col !== STATUS_COLUMN) return;

    var rawValue = typeof e.value !== "undefined" ? e.value : e.range.getValue();
    var newValue = String(rawValue || "").trim();

    if (ALLOWED_STATUS_VALUES.indexOf(newValue) === -1) return;
    if (newValue !== "Paid") return; // Pending / Follow up / Double booking / No reply are ignored.

    var lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) return;

    try {
      var existingNote = e.range.getNote();
      if (existingNote && existingNote.indexOf("Event ID:") !== -1) {
        return; // A Calendar event already exists for this row — never duplicate.
      }

      var rowValues = sheet.getRange(row, 1, 1, TOTAL_COLUMNS).getValues()[0];
      var fullName = rowValues[FULL_NAME_COLUMN - 1];
      var phone = rowValues[PHONE_COLUMN - 1];
      var email = rowValues[EMAIL_COLUMN - 1];
      var dateCell = rowValues[DATE_COLUMN - 1];
      var arrivalLabel = rowValues[ARRIVAL_COLUMN - 1];
      var noteH = rowValues[NOTE_COLUMN - 1];

      var startDate = buildEventStartDate_(dateCell, arrivalLabel);
      if (!startDate) {
        writeCalendarFailureNote_(e.range, "Could not parse the date or arrival time on this row.");
        return;
      }

      var endDate = new Date(startDate.getTime() + 90 * 60 * 1000);
      var calendarId = getProp_("CALENDAR_ID") || "primary";
      var calendar = CalendarApp.getCalendarById(calendarId);
      if (!calendar) calendar = CalendarApp.getDefaultCalendar();

      var description = ["Phone: " + phone, "", String(noteH || "")].join("\n");

      var eventOptions = { description: description, sendInvites: true };
      if (email) eventOptions.guests = String(email);

      var event = calendar.createEvent(
        (fullName || "Guest") + " — Bloom & Bean Reservation",
        startDate,
        endDate,
        eventOptions,
      );

      var confirmedNote = [
        "Calendar confirmed",
        "Event ID: " + event.getId(),
        "Created: " + formatManilaTimestamp_(),
        "Guest invited: " + (email || "none"),
      ].join("\n");
      e.range.setNote(confirmedNote);
    } catch (innerErr) {
      logError_("onReservationStatusEdit", innerErr);
      writeCalendarFailureNote_(e.range, safeErrorMessage_(innerErr));
    } finally {
      lock.releaseLock();
    }
  } catch (outerErr) {
    logError_("onReservationStatusEdit outer", outerErr);
  }
}

function writeCalendarFailureNote_(range, message) {
  var note = [
    "Calendar creation failed",
    "Error: " + message,
    "Last attempted: " + formatManilaTimestamp_(),
  ].join("\n");
  range.setNote(note);
}

function safeErrorMessage_(err) {
  var message = err && err.message ? err.message : String(err);
  return message.slice(0, 200);
}

/** Reads a flexible date value from the sheet — Sheets may store it as a
 * real Date object (if the cell has date formatting) or as a plain
 * "YYYY-MM-DD" string, depending on the template's column formatting. */
function parseFlexibleDate_(value) {
  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value.getTime())) {
    return {
      year: Number(Utilities.formatDate(value, "Asia/Manila", "yyyy")),
      month: Number(Utilities.formatDate(value, "Asia/Manila", "MM")),
      day: Number(Utilities.formatDate(value, "Asia/Manila", "dd")),
    };
  }
  var str = String(value || "").trim();
  var match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  }
  return null;
}

/** Extracts the first clock time (e.g. "12:00 PM") from an arrival-window
 * label such as "Lunch & Pour-over (12:00 PM – 2:30 PM)". */
function extractTimeFromLabel_(label) {
  var str = String(label || "");
  var match = str.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  var hour = Number(match[1]);
  var minute = Number(match[2]);
  var meridiem = match[3].toUpperCase();
  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;
  return { hour: hour, minute: minute };
}

function buildEventStartDate_(dateCell, arrivalLabel) {
  var dateParts = parseFlexibleDate_(dateCell);
  if (!dateParts) return null;
  var time = extractTimeFromLabel_(arrivalLabel);
  if (!time) return null;

  var iso = Utilities.formatString(
    "%04d-%02d-%02dT%02d:%02d:00+08:00",
    dateParts.year,
    dateParts.month,
    dateParts.day,
    time.hour,
    time.minute,
  );
  var d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d;
}

function logError_(context, err) {
  var details = err && err.stack ? err.stack : String(err);
  Logger.log("[" + context + "] " + details);
}

// ---------------------------------------------------------------------------
// Setup & diagnostic functions — run manually from the Apps Script editor.
// ---------------------------------------------------------------------------

/** Run once. Touches Sheets, Gmail, and Calendar so Google prompts for
 * authorization in a single pass, before the Web App is deployed. */
function authorizeServices() {
  var sheet = getSheet_();
  sheet.getRange(1, 1).getValue();
  GmailApp.getAliases();
  CalendarApp.getDefaultCalendar();
  Logger.log(
    "Authorization check complete. If no errors appeared above, Sheets, Gmail, and Calendar access are authorized.",
  );
}

/** Run once (and again after re-pasting Code.gs). Removes any duplicate
 * copies of the trigger and installs exactly one. */
function setupReservationTrigger() {
  var handlerName = "onReservationStatusEdit";
  var triggers = ScriptApp.getProjectTriggers();
  var removed = 0;
  triggers.forEach(function (trigger) {
    if (trigger.getHandlerFunction() === handlerName) {
      ScriptApp.deleteTrigger(trigger);
      removed++;
    }
  });

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.newTrigger(handlerName).forSpreadsheet(ss).onEdit().create();

  Logger.log(
    "Removed " +
      removed +
      " old trigger(s). Installed exactly one onEdit trigger for " +
      handlerName +
      ".",
  );
}

/** Select a cell in column A of a "Paid" row, then run this. It only reads
 * and logs what the real trigger would do — it never creates a Calendar
 * event or writes to the sheet. Use it to debug parsing issues safely. */
function diagnoseSelectedPaidRow() {
  var sheet = getSheet_();
  var range = sheet.getActiveRange();
  if (!range) {
    Logger.log("Select a cell in the Status column (A) of the row you want to test, then run this again.");
    return;
  }

  var row = range.getRow();
  if (row < FIRST_DATA_ROW) {
    Logger.log("Select a data row (row " + FIRST_DATA_ROW + " or below), not the title or header row.");
    return;
  }

  var statusCell = sheet.getRange(row, STATUS_COLUMN);
  var rowValues = sheet.getRange(row, 1, 1, TOTAL_COLUMNS).getValues()[0];

  Logger.log("Row " + row + " status: " + rowValues[STATUS_COLUMN - 1]);
  Logger.log("Full name: " + rowValues[FULL_NAME_COLUMN - 1]);
  Logger.log(
    "Date cell type: " +
      Object.prototype.toString.call(rowValues[DATE_COLUMN - 1]) +
      ", value: " +
      rowValues[DATE_COLUMN - 1],
  );
  Logger.log("Arrival time label: " + rowValues[ARRIVAL_COLUMN - 1]);

  var parsedDate = parseFlexibleDate_(rowValues[DATE_COLUMN - 1]);
  var parsedTime = extractTimeFromLabel_(rowValues[ARRIVAL_COLUMN - 1]);
  Logger.log("Parsed date: " + JSON.stringify(parsedDate));
  Logger.log("Parsed time: " + JSON.stringify(parsedTime));
  Logger.log("Existing note on Status cell: " + statusCell.getNote());
  Logger.log(
    "This function only inspects data — it does not create a Calendar event. Change the Status cell to Paid to trigger the real flow.",
  );
}

/** Run any time to sanity-check the deployment without exposing secret
 * values — only reports which properties are missing, not their contents. */
function checkSetup() {
  var required = ["SHARED_SECRET", "SHEET_NAME", "CALENDAR_ID", "REPLY_TO", "PAYMENT_NUMBER"];
  var missing = [];
  for (var i = 0; i < required.length; i++) {
    if (!getProp_(required[i])) missing.push(required[i]);
  }
  Logger.log("Missing Script Properties: " + (missing.length ? missing.join(", ") : "none"));
  Logger.log("PAYMENT_QR_URL set: " + Boolean(getProp_("PAYMENT_QR_URL")));

  try {
    var sheet = getSheet_();
    Logger.log("Sheet access OK. Sheet name: " + sheet.getName() + ", last row: " + sheet.getLastRow());
  } catch (sheetErr) {
    Logger.log("Sheet access FAILED: " + safeErrorMessage_(sheetErr));
  }

  try {
    var calendarId = getProp_("CALENDAR_ID") || "primary";
    var calendar = CalendarApp.getCalendarById(calendarId);
    if (!calendar) calendar = CalendarApp.getDefaultCalendar();
    Logger.log("Calendar access OK. Calendar: " + calendar.getName());
  } catch (calErr) {
    Logger.log("Calendar access FAILED: " + safeErrorMessage_(calErr));
  }

  var triggers = ScriptApp.getProjectTriggers().filter(function (t) {
    return t.getHandlerFunction() === "onReservationStatusEdit";
  });
  Logger.log(
    "onReservationStatusEdit triggers installed: " +
      triggers.length +
      (triggers.length === 1 ? " (correct)" : " (should be exactly 1 — run setupReservationTrigger())"),
  );

  try {
    var remaining = MailApp.getRemainingDailyQuota();
    Logger.log("Remaining email quota today: " + remaining);
  } catch (quotaErr) {
    Logger.log("Could not read email quota: " + safeErrorMessage_(quotaErr));
  }
}
