"use client";

import { Check, Copy, Mail, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

function CopyButton({ value, label, done }: { value: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable (insecure context / permissions). The value stays visible to copy manually.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="label-caps inline-flex items-center gap-2 text-ink-muted transition-colors hover:text-ink"
    >
      {copied ? <Check className="size-3.5" strokeWidth={1.25} /> : <Copy className="size-3.5" strokeWidth={1.25} />}
      <span aria-live="polite">{copied ? done : label}</span>
    </button>
  );
}

/** Frontend-only ways to reach STAR HILL using officially configured details. */
export function ContactDirect({ email, phone, website }: { email: string | null; phone: string | null; website?: string | null }) {
  const t = useTranslations("contact.direct");

  return (
    <div className="mt-20 grid gap-8 border-t border-line pt-10 md:mt-28 md:grid-cols-12 md:gap-8">
      <h3 className="label-caps text-ink-muted md:col-span-4">{t("heading")}</h3>
      {email || phone ? (
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 md:col-span-8">
          {email ? (
            <li className="space-y-3">
              <p className="label-caps text-ink-muted">{t("email")}</p>
              <p className="font-luxe text-xl break-all">{email}</p>
              <div className="flex flex-wrap gap-6">
                <a href={`mailto:${email}`} className="label-caps link-draw inline-flex items-center gap-2 pb-1">
                  <Mail className="size-3.5" strokeWidth={1.25} />
                  {t("sendEmail")}
                </a>
                <CopyButton value={email} label={t("copy")} done={t("copied")} />
              </div>
            </li>
          ) : null}
          {phone ? (
            <li className="space-y-3">
              <p className="label-caps text-ink-muted">{t("phone")}</p>
              <p className="font-luxe text-xl">{phone}</p>
              <div className="flex flex-wrap gap-6">
                <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="label-caps link-draw inline-flex items-center gap-2 pb-1">
                  <Phone className="size-3.5" strokeWidth={1.25} />
                  {t("call")}
                </a>
                <CopyButton value={phone} label={t("copy")} done={t("copied")} />
              </div>
            </li>
          ) : null}
          {website ? (
            <li className="space-y-3">
              <p className="label-caps text-ink-muted">{t("website")}</p>
              <p className="font-luxe text-xl">{website}</p>
              <a href={`https://${website.replace(/^https?:\/\//, "")}`} target="_blank" rel="noopener noreferrer" className="label-caps link-draw inline-flex items-center gap-2 pb-1">
                {website.replace(/^www\./, "")}
              </a>
            </li>
          ) : null}
        </ul>
      ) : (
        <p className="text-sm text-ink-muted md:col-span-8">{t("pending")}</p>
      )}
    </div>
  );
}
