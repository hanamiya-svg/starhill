"use client";

import { ArrowDownToLine, Mail, Phone } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { SelectField, TextAreaField, TextField } from "@/components/ui/FormField";
import { trackEvent } from "@/lib/analytics";
import { checkBrochure, triggerBrochureDownload, type BrochureStatus } from "@/lib/brochure-download";

/**
 * Frontend-only lead form.
 *
 * Nothing here leaves the browser: there is no backend, no storage and no
 * analytics of personal data. Values live in React state only, and are
 * cleared once the visitor has finished (or the page is hidden/unloaded).
 */

type Purpose = "brochure" | "meeting" | "both";
type Values = {
  fullName: string;
  phone: string;
  email: string;
  property: string;
  date: string;
  message: string;
};
type FieldName = keyof Values;
type Errors = Partial<Record<FieldName, string>>;

type Result = {
  purpose: Purpose;
  /** null when the purpose didn't include the brochure. */
  brochure: "started" | "manual" | "missing" | null;
  /** Snapshot of a prepared (never sent) meeting request. */
  prepared: Values | null;
};

const EMPTY: Values = { fullName: "", phone: "", email: "", property: "any", date: "", message: "" };
const PURPOSES: Purpose[] = ["brochure", "meeting", "both"];
const PROPERTY_OPTIONS = ["any", "crystal", "diamond", "penthouse"] as const;
const FIELD_ORDER: FieldName[] = ["fullName", "phone", "email", "property", "date", "message"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS_RE = /^[+\d\s().-]+$/;

function todayISO() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const includesBrochure = (p: Purpose) => p === "brochure" || p === "both";
const includesMeeting = (p: Purpose) => p === "meeting" || p === "both";

type BrochureFormProps = {
  brochurePath: string;
  brochureFilename: string;
  contactEmail: string | null;
  contactPhone: string | null;
};

export function BrochureForm({ brochurePath, brochureFilename, contactEmail, contactPhone }: BrochureFormProps) {
  const t = useTranslations("contact");
  const locale = useLocale();
  const reduce = useReducedMotion();

  const [purpose, setPurpose] = useState<Purpose>("brochure");
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [showSummary, setShowSummary] = useState(false);
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const submittingRef = useRef(false);
  const startedRef = useRef(false);
  const brochureStatus = useRef<BrochureStatus>("unknown");
  const brochureCheck = useRef<Promise<BrochureStatus> | null>(null);

  // Wipe everything if the page is hidden into the back/forward cache.
  useEffect(() => {
    const wipe = () => {
      setValues(EMPTY);
      setResult(null);
      setErrors({});
    };
    window.addEventListener("pagehide", wipe);
    return () => window.removeEventListener("pagehide", wipe);
  }, []);

  useEffect(() => {
    if (result) resultHeadingRef.current?.focus();
  }, [result]);

  const ensureBrochureCheck = useCallback(() => {
    if (!brochureCheck.current) {
      brochureCheck.current = checkBrochure(brochurePath).then((s) => {
        brochureStatus.current = s;
        return s;
      });
    }
    return brochureCheck.current;
  }, [brochurePath]);

  const onFirstInteraction = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackEvent("lead_form_started", { locale });
    // Check the PDF early so the download can start synchronously on submit.
    void ensureBrochureCheck();
  };

  const validate = (v: Values): Errors => {
    const e: Errors = {};
    if (v.fullName.trim().length < 2) e.fullName = t("errors.fullNameRequired");
    const phone = v.phone.trim();
    const digits = phone.replace(/\D/g, "");
    if (!phone) e.phone = t("errors.phoneRequired");
    else if (!PHONE_CHARS_RE.test(phone) || digits.length < 6 || digits.length > 15) e.phone = t("errors.phoneInvalid");
    const email = v.email.trim();
    if (!email) e.email = t("errors.emailRequired");
    else if (!EMAIL_RE.test(email)) e.email = t("errors.emailInvalid");
    if (v.date && v.date < todayISO()) e.date = t("errors.dateInvalid");
    return e;
  };

  const update = (name: FieldName) => (event: { target: { value: string } }) => {
    const value = event.target.value;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear an error as soon as it's fixed, but don't nag while typing otherwise.
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        const fresh = validate({ ...values, [name]: value })[name];
        if (fresh) next[name] = fresh;
        else delete next[name];
        return next;
      });
    }
  };

  const onBlur = (name: FieldName) => () => {
    if (!values[name] || !showSummary) return;
    const fresh = validate(values)[name];
    setErrors((prev) => {
      const next = { ...prev };
      if (fresh) next[name] = fresh;
      else delete next[name];
      return next;
    });
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const found = validate(values);
    setErrors(found);
    const invalid = FIELD_ORDER.filter((f) => found[f]);
    if (invalid.length) {
      setShowSummary(true);
      formRef.current?.querySelector<HTMLElement>(`#${invalid[0]}`)?.focus();
      return;
    }

    submittingRef.current = true;
    setWorking(true);
    setShowSummary(false);
    trackEvent("lead_form_submitted", { purpose, locale });

    let brochure: Result["brochure"] = null;
    if (includesBrochure(purpose)) {
      const status = brochureStatus.current !== "unknown" ? brochureStatus.current : await ensureBrochureCheck();
      if (status === "available") {
        brochure = triggerBrochureDownload(brochurePath, brochureFilename) ? "started" : "manual";
        trackEvent("brochure_downloaded", { purpose, locale });
      } else {
        brochure = "missing";
        // Allow a retry later (e.g. the file is uploaded while the page is open).
        brochureCheck.current = null;
        brochureStatus.current = "unknown";
      }
    }

    let prepared: Values | null = null;
    if (includesMeeting(purpose)) {
      prepared = { ...values };
      trackEvent("meeting_requested", { purpose, locale });
    }

    // Personal details are no longer needed in the form itself.
    setValues(EMPTY);
    setResult({ purpose, brochure, prepared });
    setWorking(false);
    // The guard stays engaged until "Start again": the form remains in the DOM
    // during its exit animation, and repeat clicks must not trigger repeat downloads.
  };

  const reset = () => {
    submittingRef.current = false;
    setResult(null);
    setValues(EMPTY);
    setErrors({});
    setPurpose("brochure");
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("input")?.focus());
  };

  const clearPrepared = () => setResult((r) => (r ? { ...r, prepared: null } : r));

  const errorCount = Object.keys(errors).length;
  const fade = {
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduce ? 0 : -8 },
    transition: { duration: reduce ? 0.2 : 0.6, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {result ? (
        <motion.div key="result" {...fade}>
          <ResultPanel
            result={result}
            headingRef={resultHeadingRef}
            brochurePath={brochurePath}
            brochureFilename={brochureFilename}
            contactEmail={contactEmail}
            contactPhone={contactPhone}
            onClearPrepared={clearPrepared}
            onStartAgain={reset}
          />
        </motion.div>
      ) : (
        <motion.form
          key="form"
          {...fade}
          ref={formRef}
          noValidate
          onSubmit={onSubmit}
          onFocusCapture={onFirstInteraction}
          aria-describedby="form-privacy"
        >
          <fieldset className="border-0 p-0">
            <legend className="label-caps mb-6 text-ink-muted">{t("purpose.legend")}</legend>
            <div className="flex flex-wrap gap-x-8 gap-y-4 border-b border-line pb-6 sm:gap-x-12">
              {PURPOSES.map((p) => (
                <label key={p} className="group relative flex cursor-pointer items-center gap-3 py-1">
                  <input
                    type="radio"
                    name="purpose"
                    value={p}
                    checked={purpose === p}
                    onChange={() => setPurpose(p)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden
                    className="flex size-4 items-center justify-center rounded-full border border-line-strong transition-colors peer-checked:border-ink peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-ink"
                  >
                    <span
                      className={`size-2 rounded-full bg-ink transition-transform duration-300 ${
                        purpose === p ? "scale-100" : "scale-0"
                      }`}
                    />
                  </span>
                  <span
                    className={`text-[0.9375rem] transition-colors ${
                      purpose === p ? "text-ink" : "text-ink-muted group-hover:text-ink"
                    }`}
                  >
                    {t(`purpose.${p}`)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {showSummary && errorCount > 0 ? (
            <p role="alert" className="mt-8 border-l-2 border-[#8a3b2e] pl-4 text-sm text-[#8a3b2e]">
              {t("errors.summary", { count: errorCount })}
            </p>
          ) : null}

          <div className="mt-10 grid gap-x-16 gap-y-6 md:mt-14 md:grid-cols-2">
            <div className="space-y-6">
              <TextField
                id="fullName"
                label={t("fields.fullName")}
                required
                requiredLabel={t("fields.required")}
                autoComplete="name"
                placeholder={t("fields.fullNamePlaceholder")}
                value={values.fullName}
                onChange={update("fullName")}
                onBlur={onBlur("fullName")}
                error={errors.fullName}
                maxLength={120}
              />
              <TextField
                id="phone"
                type="tel"
                inputMode="tel"
                label={t("fields.phone")}
                required
                requiredLabel={t("fields.required")}
                autoComplete="tel"
                placeholder={t("fields.phonePlaceholder")}
                value={values.phone}
                onChange={update("phone")}
                onBlur={onBlur("phone")}
                error={errors.phone}
                maxLength={32}
              />
              <TextField
                id="email"
                type="email"
                inputMode="email"
                label={t("fields.email")}
                required
                requiredLabel={t("fields.required")}
                autoComplete="email"
                spellCheck={false}
                placeholder={t("fields.emailPlaceholder")}
                value={values.email}
                onChange={update("email")}
                onBlur={onBlur("email")}
                error={errors.email}
                maxLength={254}
              />
            </div>
            <div className="space-y-6">
              <SelectField
                id="property"
                label={t("fields.property")}
                value={values.property}
                onChange={update("property")}
                options={PROPERTY_OPTIONS.map((o) => ({ value: o, label: t(`fields.propertyOptions.${o}`) }))}
              />
              <TextField
                id="date"
                type="date"
                label={t("fields.date")}
                // Set on focus (client-only) to avoid a server/client date mismatch.
                onFocus={(e) => (e.currentTarget.min = todayISO())}
                value={values.date}
                onChange={update("date")}
                onBlur={onBlur("date")}
                error={errors.date}
              />
              <TextAreaField
                id="message"
                label={t("fields.message")}
                placeholder={t("fields.messagePlaceholder")}
                value={values.message}
                onChange={update("message")}
                maxLength={2000}
              />
            </div>
          </div>

          <p className="label-caps mt-4 text-ink-muted">{t("fields.requiredNote")}</p>

          <button
            type="submit"
            disabled={working}
            aria-busy={working || undefined}
            className="group mt-10 flex min-h-16 w-full items-center justify-center gap-4 bg-forest px-6 py-5 text-white transition-colors duration-300 hover:bg-obsidian focus-visible:outline-offset-4 disabled:cursor-wait disabled:opacity-80"
          >
            <Mail className="size-4 shrink-0 transition-transform duration-500 group-hover:-translate-y-0.5" strokeWidth={1.25} />
            <span className="label-caps text-xs tracking-[0.24em]">
              {working ? t("submit.working") : t(`submit.${purpose}`)}
            </span>
          </button>

          <p id="form-privacy" className="mt-6 max-w-3xl text-xs leading-relaxed text-ink-muted">
            {t("privacy")}
          </p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

function ResultPanel({
  result,
  headingRef,
  brochurePath,
  brochureFilename,
  contactEmail,
  contactPhone,
  onClearPrepared,
  onStartAgain,
}: {
  result: Result;
  headingRef: React.Ref<HTMLHeadingElement>;
  brochurePath: string;
  brochureFilename: string;
  contactEmail: string | null;
  contactPhone: string | null;
  onClearPrepared: () => void;
  onStartAgain: () => void;
}) {
  const t = useTranslations("contact");
  const { purpose, brochure, prepared } = result;

  // Never claim the brochure is ready when the PDF isn't actually there.
  const brochureMissing = brochure === "missing";
  const effective: Purpose = purpose === "both" && brochureMissing ? "meeting" : purpose;
  const title =
    effective === "brochure"
      ? brochureMissing
        ? t("result.brochureUnavailableTitle")
        : t("result.brochureTitle")
      : effective === "meeting"
        ? t("result.meetingTitle")
        : t("result.bothTitle");
  const body =
    effective === "brochure"
      ? brochureMissing
        ? null
        : t("result.brochureBody")
      : effective === "meeting"
        ? t("result.meetingBody")
        : t("result.bothBody");

  const mailto =
    contactEmail && prepared
      ? `mailto:${contactEmail}?subject=${encodeURIComponent(t("mailSubject"))}&body=${encodeURIComponent(
          [
            `${t("fields.fullName")}: ${prepared.fullName}`,
            `${t("fields.phone")}: ${prepared.phone}`,
            `${t("fields.email")}: ${prepared.email}`,
            prepared.property !== "any" && `${t("fields.property")}: ${t(`fields.propertyOptions.${prepared.property}`)}`,
            prepared.date && `${t("fields.date")}: ${prepared.date}`,
            prepared.message && `\n${prepared.message}`,
          ]
            .filter(Boolean)
            .join("\n"),
        )}`
      : null;

  const summaryRows: [string, string][] = prepared
    ? (
        [
          [t("fields.fullName"), prepared.fullName],
          [t("fields.phone"), prepared.phone],
          [t("fields.email"), prepared.email],
          [t("fields.property"), prepared.property !== "any" ? t(`fields.propertyOptions.${prepared.property}`) : ""],
          [t("fields.date"), prepared.date],
          [t("fields.message"), prepared.message],
        ] as [string, string][]
      ).filter(([, v]) => v)
    : [];

  return (
    <div className="grid gap-12 border-t border-ink pt-10 md:grid-cols-12 md:gap-8">
      <div className="md:col-span-5">
        <h3 ref={headingRef} tabIndex={-1} className="font-luxe text-[clamp(1.8rem,3vw,2.75rem)] leading-tight text-ink focus:outline-none">
          {title}
        </h3>
        {body ? (
          <p role="status" className="mt-6 max-w-md text-[0.9375rem] leading-[1.8] text-ink-muted">
            {body}
          </p>
        ) : null}

        {brochure === "started" || brochure === "manual" ? (
          <div className="mt-10">
            <a
              href={brochurePath}
              download={brochureFilename}
              className="group inline-flex min-h-14 items-center gap-4 border border-ink px-6 py-4 transition-colors duration-300 hover:bg-ink hover:text-ivory"
            >
              <ArrowDownToLine className="size-4" strokeWidth={1.25} />
              <span className="label-caps">{t("result.downloadLink")}</span>
            </a>
            <p className="mt-4 text-xs text-ink-muted">{t("result.downloadHint")}</p>
          </div>
        ) : null}

        {brochure === "missing" ? (
          <p role={body ? undefined : "status"} className="mt-10 border-l-2 border-champagne pl-4 text-sm leading-relaxed text-ink">
            {t("result.brochureMissing")}
          </p>
        ) : null}
      </div>

      <div className="md:col-span-6 md:col-start-7">
        {prepared ? (
          <div>
            <p className="label-caps text-ink-muted">{t("result.summaryTitle")}</p>
            <dl className="mt-6">
              {summaryRows.map(([label, value]) => (
                <div key={label} className="grid gap-1 border-t border-line py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
                  <dt className="label-caps pt-0.5 text-ink-muted">{label}</dt>
                  <dd className="text-sm break-words whitespace-pre-line">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line pt-6">
              {mailto ? (
                <a href={mailto} className="label-caps link-draw inline-flex items-center gap-2 pb-1">
                  <Mail className="size-3.5" strokeWidth={1.25} />
                  {t("result.emailRequest")}
                </a>
              ) : null}
              {contactPhone ? (
                <a
                  href={`tel:${contactPhone.replace(/[^\d+]/g, "")}`}
                  className="label-caps link-draw inline-flex items-center gap-2 pb-1"
                >
                  <Phone className="size-3.5" strokeWidth={1.25} />
                  {t("direct.call")}
                </a>
              ) : null}
              <button type="button" onClick={onClearPrepared} className="label-caps link-draw pb-1 text-ink-muted">
                {t("result.clear")}
              </button>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onStartAgain}
          className={`label-caps link-draw pb-1 ${prepared ? "mt-10" : ""}`}
        >
          {t("result.startAgain")}
        </button>
      </div>
    </div>
  );
}
