import "server-only";

export type AppsScriptResult = {
  ok: boolean;
  recorded: boolean;
  emailSent: boolean;
  reservationCode: string;
  errorCode?: string;
};

export class AppsScriptConfigError extends Error {}
export class AppsScriptUpstreamError extends Error {}

const REQUEST_TIMEOUT_MS = 15_000;

/**
 * Calls the spreadsheet-bound Apps Script Web App. Never exposes the
 * Web App URL or shared secret to the browser — this module only runs
 * on the server (enforced by the `server-only` import above).
 */
export async function callAppsScript(payload: {
  reservationCode: string;
  fullName: string;
  phone: string;
  email: string;
  dateOfVisit: string;
  arrivalTime: string;
  guestCount: string;
  occasion: string;
  specialRequests: string;
}): Promise<AppsScriptResult> {
  const url = process.env.APPS_SCRIPT_WEB_APP_URL;
  const secret = process.env.APPS_SCRIPT_SHARED_SECRET;

  if (!url || !secret) {
    throw new AppsScriptConfigError(
      "Server is missing APPS_SCRIPT_WEB_APP_URL or APPS_SCRIPT_SHARED_SECRET.",
    );
  }

  if (!url.endsWith("/exec")) {
    throw new AppsScriptConfigError(
      "APPS_SCRIPT_WEB_APP_URL must be a deployed Web App URL ending in /exec.",
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, ...payload }),
      redirect: "follow",
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw new AppsScriptUpstreamError("Apps Script request timed out.");
    }
    throw new AppsScriptUpstreamError("Could not reach Apps Script Web App.");
  } finally {
    clearTimeout(timeout);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const rawText = await response.text();

  if (!contentType.includes("application/json")) {
    // Google returns an HTML login/consent page when the deployment's
    // "Who has access" is not set to Anyone, or the URL is wrong.
    throw new AppsScriptConfigError(
      "Apps Script Web App returned HTML instead of JSON. Check that the deployment access is set to Anyone and the URL ends in /exec.",
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new AppsScriptUpstreamError("Apps Script Web App returned malformed JSON.");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as Record<string, unknown>).ok !== "boolean"
  ) {
    throw new AppsScriptUpstreamError("Apps Script Web App returned an unexpected shape.");
  }

  const result = parsed as Record<string, unknown>;

  return {
    ok: Boolean(result.ok),
    recorded: Boolean(result.recorded),
    emailSent: Boolean(result.emailSent),
    reservationCode:
      typeof result.reservationCode === "string"
        ? result.reservationCode
        : payload.reservationCode,
    errorCode: typeof result.errorCode === "string" ? result.errorCode : undefined,
  };
}
