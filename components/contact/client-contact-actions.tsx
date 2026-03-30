"use client";

import type { Client } from "@/lib/clients";
import { MaskIcon } from "@/components/icons/mask-icon";
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
  return <MaskIcon name="phone" className="h-3.5 w-3.5 shrink-0" />;
}
