"use client";

import type { Client } from "@/lib/clients";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import {
  normalizeIndiaWhatsappDigits,
  telHref,
  whatsappWebUrl,
} from "@/lib/phone-contact";

type Props = {
  client: Client;
  className?: string;
  /** Light-on-dark header variant. */
  variant?: "default" | "onDark";
};

export function ClientContactActions({ client, className = "", variant = "default" }: Props) {
  const telDigits = client.phone.replace(/\D/g, "");
  const tel = telDigits.length >= 8 ? telHref(client.phone) : null;
  const waRaw = client.whatsappPhone?.trim() || client.phone;
  const waDigits = normalizeIndiaWhatsappDigits(waRaw);
  const waClient = waDigits.length >= 10 ? whatsappWebUrl(waDigits) : null;

  const linkBase =
    variant === "onDark"
      ? "inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/10"
      : "inline-flex items-center gap-1.5 rounded-lg border border-nyay-border bg-nyay-canvas px-2.5 py-1.5 text-xs font-semibold text-nyay-trust-mid transition-colors hover:bg-nyay-canvas/80 dark:border-white/15 dark:bg-white/5 dark:text-foreground dark:hover:bg-white/10";

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tel ? (
        <a href={tel} className={linkBase}>
          <PhoneIcon />
          Call
        </a>
      ) : null}
      {waClient ? (
        <a
          href={waClient}
          target="_blank"
          rel="noopener noreferrer"
          className={linkBase}
        >
          <WhatsAppIcon className="h-3.5 w-3.5 shrink-0" />
          WhatsApp
        </a>
      ) : null}
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  );
}
