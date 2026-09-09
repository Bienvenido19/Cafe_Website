import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { reservationSchema, sanitizeForSpreadsheet } from "@/lib/validation";
import { generateReservationCode } from "@/lib/reservation-code";
import {
  callAppsScript,
  AppsScriptConfigError,
  AppsScriptUpstreamError,
} from "@/lib/apps-script-client";

export const runtime = "nodejs";

type ApiSuccess = {
  status: "confirmed_pending" | "recorded_email_failed";
  reservationCode: string;
  message: string;
};

type ApiFailure = {
  status: "failed";
  message: string;
};

function fail(message: string, httpStatus: number): NextResponse<ApiFailure> {
  return NextResponse.json({ status: "failed", message }, { status: httpStatus });
}

export async function POST(request: Request): Promise<NextResponse<ApiSuccess | ApiFailure>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("We couldn't read your request. Please try again.", 400);
  }

  let input;
  try {
    input = reservationSchema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      const firstIssue = err.issues[0];
      return fail(firstIssue?.message ?? "Please check the form and try again.", 422);
    }
    return fail("Please check the form and try again.", 422);
  }

  // Honeypot: if it's filled in, silently pretend success so bots don't
  // learn anything, without ever touching the Sheet or sending an email.
  if (input.companyWebsite) {
    return NextResponse.json(
      {
        status: "confirmed_pending",
        reservationCode: generateReservationCode(),
        message:
          "Request received. Your table is pending confirmation. We sent the payment instructions to your email.",
      },
      { status: 200 },
    );
  }

  const reservationCode = generateReservationCode();

  const payload = {
    reservationCode,
    fullName: sanitizeForSpreadsheet(input.fullName),
    phone: sanitizeForSpreadsheet(input.phone),
    email: sanitizeForSpreadsheet(input.email),
    dateOfVisit: input.dateOfVisit,
    arrivalTime: input.arrivalTime,
    guestCount: input.guestCount,
    occasion: sanitizeForSpreadsheet(input.occasion ?? ""),
    specialRequests: sanitizeForSpreadsheet(input.specialRequests ?? ""),
  };

  try {
    const result = await callAppsScript(payload);

    if (!result.ok || !result.recorded) {
      // Recorded=false means Apps Script rejected/failed to save the row.
      console.error("Apps Script reported failure", {
        reservationCode,
        errorCode: result.errorCode,
      });
      return fail(
        "We couldn't record your reservation request right now. Please try again in a moment or contact the café directly.",
        502,
      );
    }

    if (!result.emailSent) {
      return NextResponse.json(
        {
          status: "recorded_email_failed",
          reservationCode: result.reservationCode,
          message:
            "Your request was recorded, but we could not send the email. Please contact the café and provide your reservation code.",
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        status: "confirmed_pending",
        reservationCode: result.reservationCode,
        message:
          "Request received. Your table is pending confirmation. We sent the payment instructions to your email.",
      },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof AppsScriptConfigError) {
      console.error("Apps Script configuration error:", err.message);
      return fail(
        "Reservations are temporarily unavailable due to a configuration issue. Please contact the café directly.",
        500,
      );
    }
    if (err instanceof AppsScriptUpstreamError) {
      console.error("Apps Script upstream error:", err.message);
      return fail(
        "We couldn't reach the reservation system. Please try again in a moment.",
        502,
      );
    }
    console.error("Unexpected reservation error:", err);
    return fail("Something went wrong. Please try again.", 500);
  }
}
