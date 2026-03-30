"use client";

import { useEffect, useState } from "react";
import type { Client } from "@/lib/clients";
import { upsertExtraClient } from "@/lib/clients";
import { AppModal } from "@/components/ui/app-modal";

export type ClientFormMode = "add" | "edit";

export type ClientFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ClientFormMode;
  /** Required for edit; ignored for add. */
  initialClient?: Client | null;
  onSaved?: (client: Client) => void;
  buildNewId: () => string;
};

function emptyForm() {
  return {
    name: "",
    email: "",
    phone: "",
    whatsappPhone: "",
    organization: "",
    notes: "",
  };
}

export function ClientFormModal({
  open,
  onOpenChange,
  mode,
  initialClient,
  onSaved,
  buildNewId,
}: ClientFormModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (mode === "edit" && initialClient) {
      setForm({
        name: initialClient.name,
        email: initialClient.email,
        phone: initialClient.phone,
        whatsappPhone: initialClient.whatsappPhone ?? "",
        organization: initialClient.organization ?? "",
        notes: initialClient.notes ?? "",
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, mode, initialClient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const n = form.name.trim();
    const em = form.email.trim();
    const ph = form.phone.trim();
    if (!n || !em || !ph) {
      setError("Name, email, and phone are required.");
      return;
    }
    const wa = form.whatsappPhone.trim();
    const client: Client = {
      id: mode === "edit" && initialClient ? initialClient.id : buildNewId(),
      name: n,
      email: em,
      phone: ph,
      organization: form.organization.trim() || undefined,
      notes: form.notes.trim() || undefined,
      whatsappPhone: wa || undefined,
    };
    upsertExtraClient(client);
    onSaved?.(client);
    onOpenChange(false);
  };

  const title = mode === "add" ? "Add client" : "Edit client";
  const description =
    mode === "add"
      ? "Saved in this browser for the demo. You can link matters from the client profile."
      : "Updates are stored locally in this browser.";

  return (
    <AppModal open={open} onOpenChange={onOpenChange} title={title} description={description}>
      <form id="client-form-modal-form" onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label
            htmlFor="cfm-name"
            className="block text-xs font-medium text-nyay-trust-mid dark:text-foreground/90"
          >
            Name <span className="text-nyay-authority">*</span>
          </label>
          <input
            id="cfm-name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:bg-nyay-canvas dark:text-foreground"
            autoComplete="name"
          />
        </div>
        <div>
          <label
            htmlFor="cfm-email"
            className="block text-xs font-medium text-nyay-trust-mid dark:text-foreground/90"
          >
            Email <span className="text-nyay-authority">*</span>
          </label>
          <input
            id="cfm-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:bg-nyay-canvas dark:text-foreground"
            autoComplete="email"
          />
        </div>
        <div>
          <label
            htmlFor="cfm-phone"
            className="block text-xs font-medium text-nyay-trust-mid dark:text-foreground/90"
          >
            Phone <span className="text-nyay-authority">*</span>
          </label>
          <input
            id="cfm-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:bg-nyay-canvas dark:text-foreground"
            autoComplete="tel"
            placeholder="+91 …"
          />
        </div>
        <div>
          <label
            htmlFor="cfm-wa"
            className="block text-xs font-medium text-nyay-trust-mid dark:text-foreground/90"
          >
            WhatsApp number
          </label>
          <input
            id="cfm-wa"
            type="tel"
            value={form.whatsappPhone}
            onChange={(e) => setForm((f) => ({ ...f, whatsappPhone: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:bg-nyay-canvas dark:text-foreground"
            autoComplete="tel"
            placeholder="Optional if same as phone"
          />
        </div>
        <div>
          <label
            htmlFor="cfm-org"
            className="block text-xs font-medium text-nyay-trust-mid dark:text-foreground/90"
          >
            Organization
          </label>
          <input
            id="cfm-org"
            value={form.organization}
            onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:bg-nyay-canvas dark:text-foreground"
          />
        </div>
        <div>
          <label
            htmlFor="cfm-notes"
            className="block text-xs font-medium text-nyay-trust-mid dark:text-foreground/90"
          >
            Notes
          </label>
          <textarea
            id="cfm-notes"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={3}
            className="mt-1 w-full resize-y rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:bg-nyay-canvas dark:text-foreground"
          />
        </div>
        {error ? (
          <p className="text-sm text-red-700 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg border border-nyay-border px-4 py-2.5 text-sm font-semibold text-nyay-trust-mid transition-colors hover:bg-nyay-canvas dark:border-white/15 dark:text-foreground dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-nyay-trust px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-nyay-trust/20 transition-all hover:bg-nyay-trust-mid focus:outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority focus-visible:ring-offset-2 focus-visible:ring-offset-nyay-surface dark:bg-nyay-trust-mid dark:hover:bg-nyay-trust-soft dark:focus-visible:ring-offset-[#122238]"
          >
            {mode === "add" ? "Save client" : "Save changes"}
          </button>
        </div>
      </form>
    </AppModal>
  );
}
