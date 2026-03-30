"use client";

import { useState } from "react";
import {
  SupportWhatsAppDraftModal,
  type SupportCaseContext,
} from "@/components/contact/support-whatsapp-draft-modal";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";

type Props = {
  caseContext: SupportCaseContext;
  variant?: "onDark" | "surface";
};

export function CaseSupportWhatsAppTrigger({ caseContext, variant = "onDark" }: Props) {
  const [open, setOpen] = useState(false);

  const btn =
    variant === "onDark"
      ? "inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority/60"
      : "inline-flex items-center gap-2 rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-xs font-semibold text-nyay-trust transition-colors hover:bg-nyay-canvas/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority/40 dark:border-white/15 dark:bg-white/5 dark:text-foreground";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={btn}>
        <WhatsAppIcon />
        Draft message to support
      </button>
      <SupportWhatsAppDraftModal open={open} onOpenChange={setOpen} caseContext={caseContext} />
    </>
  );
}
