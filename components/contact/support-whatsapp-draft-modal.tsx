"use client";

import { useEffect, useState } from "react";
import { advocateDisplayName, loadAdvocateProfile } from "@/lib/advocate-profile";
import {
  PRACTICE_WHATSAPP_DIGITS,
  practiceWhatsappDisplay,
} from "@/lib/practice-contact";
import { whatsappWebUrl } from "@/lib/phone-contact";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
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
            <WhatsAppIcon className="h-4 w-4" />
            Open WhatsApp
          </button>
        </div>
      </div>
    </AppModal>
  );
}
