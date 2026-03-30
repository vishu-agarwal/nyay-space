"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CaseStatus, CaseType } from "@/lib/cases";
import { createUserCase, type CreateCaseInput } from "@/lib/case-management-store";
import { AppModal } from "@/components/ui/app-modal";
import { useNyayStorage } from "@/lib/use-nyay-storage";
import { mergeClients } from "@/lib/clients";
import type { Client } from "@/lib/clients";
import { routes } from "@/lib/routes";

const statusOptions: { value: CaseStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "urgent", label: "Urgent" },
  { value: "closed", label: "Closed" },
];

const typeOptions: { value: CaseType; label: string }[] = [
  { value: "civil", label: "Civil" },
  { value: "criminal", label: "Criminal" },
  { value: "family", label: "Family" },
];

function prefixForCaseType(t: CaseType): string {
  switch (t) {
    case "civil":
      return "CV";
    case "criminal":
      return "CR";
    case "family":
      return "FAM";
  }
}

function makeSuggestedId(t: CaseType): string {
  const prefix = prefixForCaseType(t);
  const y = new Date().getFullYear();
  const suffix = Math.floor(Math.random() * 900 + 100);
  return `${prefix}-${y}-${suffix}`;
}

function toClientOptionDisplay(c: Client): string {
  return c.organization ? `${c.name} (${c.organization})` : c.name;
}

export function CreateCaseModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { extraClients } = useNyayStorage();
  const allClients = useMemo(() => mergeClients(extraClients), [extraClients]);

  const [caseType, setCaseType] = useState<CaseType>("civil");
  const [status, setStatus] = useState<CaseStatus>("active");
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState<string>(allClients[0]?.id ?? "");
  const [court, setCourt] = useState("");
  const [stage, setStage] = useState("");
  const [next, setNext] = useState<string>("");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      setError(null);
      setCaseType("civil");
      setStatus("active");
      setId(makeSuggestedId("civil"));
      setTitle("");
      setCourt("");
      setStage("");
      setNext("");
      setClientId(allClients[0]?.id ?? "");
    }, 0);
    return () => window.clearTimeout(t);
  }, [open, allClients]);

  function onGenerateId() {
    setId(makeSuggestedId(caseType));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const input: CreateCaseInput = {
      id,
      title,
      clientId,
      court,
      stage,
      next: next.trim() ? next.trim() : null,
      status,
      caseType,
    };

    const res = createUserCase(input);
    if (!res.ok) {
      setError(res.reason);
      return;
    }

    onOpenChange(false);
    router.push(routes.case(id.trim()));
  }

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title="Add case"
      description="Create a case and start tracking timeline, case notes, and case history in this browser."
    >
      <form onSubmit={handleSubmit} className="space-y-3" aria-label="Add case form">
        <div>
          <label htmlFor="cc-id" className="block text-xs font-medium text-nyay-trust-mid">
            Case ID
            <span className="text-nyay-authority">*</span>
          </label>
          <div className="mt-1 flex gap-2">
            <input
              id="cc-id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30"
              placeholder="e.g. CV-2026-123"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={onGenerateId}
              className="rounded-lg border border-nyay-border bg-nyay-surface px-3 py-2 text-sm font-semibold text-nyay-trust shadow-sm transition-colors hover:bg-nyay-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority"
            >
              Generate
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="cc-title" className="block text-xs font-medium text-nyay-trust-mid">
            Title <span className="text-nyay-authority">*</span>
          </label>
          <input
            id="cc-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30"
            placeholder="What is the case about?"
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="cc-client" className="block text-xs font-medium text-nyay-trust-mid">
            Client <span className="text-nyay-authority">*</span>
          </label>
          <select
            id="cc-client"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30"
          >
            {allClients.map((c) => (
              <option key={c.id} value={c.id}>
                {toClientOptionDisplay(c)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="cc-court" className="block text-xs font-medium text-nyay-trust-mid">
              Court/Forum <span className="text-nyay-authority">*</span>
            </label>
            <input
              id="cc-court"
              value={court}
              onChange={(e) => setCourt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30"
              placeholder="e.g. District Court, Saket"
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="cc-stage" className="block text-xs font-medium text-nyay-trust-mid">
              Stage <span className="text-nyay-authority">*</span>
            </label>
            <input
              id="cc-stage"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30"
              placeholder="e.g. Pleadings"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="cc-next" className="block text-xs font-medium text-nyay-trust-mid">
              Next (optional)
            </label>
            <input
              id="cc-next"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30"
              placeholder="e.g. Apr 2 or 2026-04-02"
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="cc-type" className="block text-xs font-medium text-nyay-trust-mid">
              Case type <span className="text-nyay-authority">*</span>
            </label>
            <select
              id="cc-type"
              value={caseType}
              onChange={(e) => {
                const nextType = e.target.value as CaseType;
                setCaseType(nextType);
                setId(makeSuggestedId(nextType));
              }}
              className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30"
            >
              {typeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="cc-status" className="block text-xs font-medium text-nyay-trust-mid">
            Status <span className="text-nyay-authority">*</span>
          </label>
          <select
            id="cc-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as CaseStatus)}
            className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30"
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
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
            Create case
          </button>
        </div>
      </form>
    </AppModal>
  );
}

