"use client";

import { useEffect, useState } from "react";
import { advocateDisplayName, loadAdvocateProfile } from "@/lib/advocate-profile";
import {
  PRACTICE_WHATSAPP_DIGITS,
  practiceWhatsappDisplay,
} from "@/lib/practice-contact";
import { whatsappWebUrl } from "@/lib/phone-contact";
import { AppModal } from "@/components/ui/app-modal";

export type SupportCaseContext = {
  id: string;
  title: string;
  /** Free text: synopsis, court, stage, etc. */
  details: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseContext?: SupportCaseContext | null;
};

function buildFirstContactHeader(
  advocateName: string,
  ctx: SupportCaseContext | null | undefined,
): string {
  const lines = [`Advocate: ${advocateName}`];
  const profile = loadAdvocateProfile();
  if (profile?.whatsapp?.trim()) {
    lines.push(`Advocate WhatsApp: ${profile.whatsapp.trim()}`);
  }
  if (ctx) {
    lines.push(`Case: ${ctx.title} (${ctx.id})`);
    if (ctx.details.trim()) lines.push(`Case details: ${ctx.details.trim()}`);
  }
  return `${lines.join("\n")}\n\n`;
}

export function SupportWhatsAppDraftModal({ open, onOpenChange, caseContext }: Props) {
  const [includeHeader, setIncludeHeader] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open) {
      setIncludeHeader(true);
      setMessage("");
    }
  }, [open]);

  const advocateName = advocateDisplayName();

  const fullBody = includeHeader
    ? `${buildFirstContactHeader(advocateName, caseContext ?? null)}${message.trim()}`
    : message.trim();

  const openWhatsApp = () => {
    const text = fullBody.trim() || message.trim() || "Hello";
    const url = whatsappWebUrl(PRACTICE_WHATSAPP_DIGITS, text);
    window.open(url, "_blank", "noopener,noreferrer");
    onOpenChange(false);
  };

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title="Draft WhatsApp to support"
      description={`Opens WhatsApp Web or the app with ${practiceWhatsappDisplay()}. Nothing is sent until you press Send in WhatsApp.`}
    >
      <div className="space-y-4">
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-nyay-border bg-nyay-canvas/50 p-3 dark:border-white/10 dark:bg-white/5">
          <input
            type="checkbox"
            checked={includeHeader}
            onChange={(e) => setIncludeHeader(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-nyay-border text-nyay-trust focus:ring-nyay-authority/40"
          />
          <span className="text-sm text-nyay-trust dark:text-foreground">
            <span className="font-semibold">First message header</span>
            <span className="mt-0.5 block text-nyay-muted">
              Prefix with advocate name
              {caseContext ? ", case name, and case details" : ""} so support has context.
            </span>
          </span>
        </label>

        <div>
          <label
            htmlFor="support-wa-message"
            className="block text-xs font-medium text-nyay-trust-mid dark:text-foreground/90"
          >
            Your message
          </label>
          <textarea
            id="support-wa-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Type what you want to send after the header…"
            className="mt-1 w-full resize-y rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:bg-nyay-canvas dark:text-foreground"
          />
        </div>

        <div className="rounded-lg border border-dashed border-nyay-border bg-nyay-canvas/30 p-3 dark:border-white/15 dark:bg-white/5">
          <p className="text-xs font-semibold uppercase tracking-wide text-nyay-muted">Preview</p>
          <pre className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap wrap-break-word text-xs text-nyay-trust dark:text-foreground/90">
            {fullBody.trim() || "—"}
          </pre>
        </div>

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg border border-nyay-border px-4 py-2.5 text-sm font-semibold text-nyay-trust-mid transition-colors hover:bg-nyay-canvas dark:border-white/15 dark:text-foreground dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={openWhatsApp}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-nyay-surface dark:focus-visible:ring-offset-[#122238]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Open WhatsApp
          </button>
        </div>
      </div>
    </AppModal>
  );
}
