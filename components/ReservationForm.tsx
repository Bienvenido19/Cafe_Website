"use client";

import { useMemo, useState, type FormEvent } from "react";
import { reservationSchema } from "@/lib/validation";
import { siteConfig } from "@/lib/site-config";

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  dateOfVisit: string;
  arrivalTime: string;
  guestCount: string;
  occasion: string;
  specialRequests: string;
  companyWebsite: string; // honeypot
};

type SubmitOutcome =
  | { kind: "idle" }
  | { kind: "success"; message: string; reservationCode: string }
  | { kind: "partial"; message: string; reservationCode: string }
  | { kind: "error"; message: string };

const initialState: FormState = {
  fullName: "",
  phone: "",
  email: "",
  dateOfVisit: "",
  arrivalTime: siteConfig.seatingWindows[1].value,
  guestCount: siteConfig.guestCountOptions[1].value,
  occasion: "",
  specialRequests: "",
  companyWebsite: "",
};

function todayInManila(): string {
  // en-CA gives YYYY-MM-DD, which matches <input type="date"> min format.
  return new Intl.DateTimeFormat("en-CA", { timeZone: siteConfig.timezone }).format(
    new Date(),
  );
}

export function ReservationForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [outcome, setOutcome] = useState<SubmitOutcome>({ kind: "idle" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const minDate = useMemo(() => todayInManila(), []);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return; // prevent duplicate clicks

    const parsed = reservationSchema.safeParse(form);

    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormState | undefined;
        if (key && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      setOutcome({ kind: "idle" });
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setOutcome({ kind: "idle" });

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = (await response.json()) as {
        status: "confirmed_pending" | "recorded_email_failed" | "failed";
        reservationCode?: string;
        message: string;
      };

      if (data.status === "confirmed_pending" && data.reservationCode) {
        setOutcome({
          kind: "success",
          message: data.message,
          reservationCode: data.reservationCode,
        });
        setForm(initialState);
      } else if (data.status === "recorded_email_failed" && data.reservationCode) {
        setOutcome({
          kind: "partial",
          message: data.message,
          reservationCode: data.reservationCode,
        });
        setForm(initialState);
      } else {
        setOutcome({ kind: "error", message: data.message });
      }
    } catch {
      setOutcome({
        kind: "error",
        message: "We couldn't send your request. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (outcome.kind === "success" || outcome.kind === "partial") {
    return (
      <div className="py-space-xl text-center space-y-space-md">
        <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center mx-auto text-on-tertiary-fixed">
          <span className="material-symbols-outlined text-2xl">
            {outcome.kind === "success" ? "check_circle" : "info"}
          </span>
        </div>
        <div className="space-y-1">
          <h3 className="font-headline-md text-headline-md text-primary-container">
            {outcome.kind === "success" ? "Request received." : "Request recorded."}
          </h3>
          <p className="font-subheading text-subheading italic text-on-surface">
            Your table is pending confirmation.
          </p>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
          {outcome.message}
        </p>
        <p className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
          Reservation code: <span className="text-secondary">{outcome.reservationCode}</span>
        </p>
        <div className="pt-space-sm">
          <button
            type="button"
            className="font-label-sm text-label-sm uppercase tracking-wider text-secondary underline underline-offset-4"
            onClick={() => setOutcome({ kind: "idle" })}
          >
            Make another request
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-space-md" onSubmit={handleSubmit} noValidate>
      {/* Honeypot field: hidden from sighted and screen-reader users, real
          visitors never fill this in. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto w-px h-px overflow-hidden">
        <label htmlFor="companyWebsite">Leave this field empty</label>
        <input
          id="companyWebsite"
          name="companyWebsite"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.companyWebsite}
          onChange={(e) => updateField("companyWebsite", e.target.value)}
        />
      </div>

      {outcome.kind === "error" && (
        <div
          role="alert"
          className="p-space-sm rounded border border-error/40 bg-error-container text-on-error-container font-body-sm text-body-sm"
        >
          {outcome.message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
        <Field
          id="fullName"
          label="Full Name"
          error={errors.fullName}
        >
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            placeholder="e.g. Maria Clara Santos"
            className={inputClasses(Boolean(errors.fullName))}
            value={form.fullName}
            maxLength={100}
            onChange={(e) => updateField("fullName", e.target.value)}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
          />
        </Field>

        <Field id="emailAddress" label="Email Address" error={errors.email}>
          <input
            id="emailAddress"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="name@domain.ph"
            className={inputClasses(Boolean(errors.email))}
            value={form.email}
            maxLength={254}
            onChange={(e) => updateField("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "emailAddress-error" : undefined}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
        <Field id="phoneNumber" label="Phone Number" error={errors.phone}>
          <input
            id="phoneNumber"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            placeholder="+63 9XX XXX XXXX"
            className={inputClasses(Boolean(errors.phone))}
            value={form.phone}
            maxLength={20}
            onChange={(e) => updateField("phone", e.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phoneNumber-error" : undefined}
          />
        </Field>

        <Field id="guestCount" label="Guests" error={errors.guestCount}>
          <select
            id="guestCount"
            name="guestCount"
            className={inputClasses(Boolean(errors.guestCount))}
            value={form.guestCount}
            onChange={(e) => updateField("guestCount", e.target.value)}
          >
            {siteConfig.guestCountOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field id="resDate" label="Date" error={errors.dateOfVisit}>
          <input
            id="resDate"
            name="dateOfVisit"
            type="date"
            required
            min={minDate}
            className={inputClasses(Boolean(errors.dateOfVisit))}
            value={form.dateOfVisit}
            onChange={(e) => updateField("dateOfVisit", e.target.value)}
            aria-invalid={Boolean(errors.dateOfVisit)}
            aria-describedby={errors.dateOfVisit ? "resDate-error" : undefined}
          />
        </Field>
      </div>

      <Field id="seatingTime" label="Preferred Seating Window" error={errors.arrivalTime}>
        <select
          id="seatingTime"
          name="arrivalTime"
          className={inputClasses(Boolean(errors.arrivalTime))}
          value={form.arrivalTime}
          onChange={(e) => updateField("arrivalTime", e.target.value)}
        >
          {siteConfig.seatingWindows.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <Field id="occasion" label="Special Occasion (Optional)" error={errors.occasion}>
        <input
          id="occasion"
          name="occasion"
          type="text"
          placeholder="Casual catch-up, quiet work session, birthday morning"
          className={inputClasses(Boolean(errors.occasion))}
          value={form.occasion}
          maxLength={120}
          onChange={(e) => updateField("occasion", e.target.value)}
        />
      </Field>

      <Field
        id="specialRequest"
        label="Special Request & Dietary Notes"
        error={errors.specialRequests}
      >
        <textarea
          id="specialRequest"
          name="specialRequests"
          rows={3}
          placeholder="Dietary restrictions, patio preference, low table near natural light, high chair..."
          className={inputClasses(Boolean(errors.specialRequests)) + " resize-none"}
          value={form.specialRequests}
          maxLength={500}
          onChange={(e) => updateField("specialRequests", e.target.value)}
        />
      </Field>

      <div className="pt-space-xs">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-space-md bg-primary-container text-surface rounded hover:bg-on-surface-variant transition-colors duration-200 font-label-md text-label-md tracking-wider uppercase flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span>{isSubmitting ? "Sending request…" : "Send reservation request"}</span>
          <span className="material-symbols-outlined text-sm">calendar_month</span>
        </button>
      </div>
    </form>
  );
}

function inputClasses(hasError: boolean): string {
  return [
    "w-full bg-surface-container-low px-space-sm py-2.5 rounded border text-body-md font-body-md text-on-surface focus:outline-none transition-colors placeholder:text-outline-variant",
    hasError ? "border-error" : "border-outline-variant focus:border-primary-container",
  ].join(" ");
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col space-y-1">
      <label
        className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant"
        htmlFor={id}
      >
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="font-body-sm text-body-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
