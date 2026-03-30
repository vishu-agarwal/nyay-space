"use client";

import type { CaseStatus, CaseType } from "@/lib/cases";

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

export function CaseStatusTypeEditor({
  status,
  caseType,
  onStatusChange,
  onTypeChange,
}: {
  status: CaseStatus;
  caseType: CaseType;
  onStatusChange: (next: CaseStatus) => void;
  onTypeChange: (next: CaseType) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="grid w-full gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="cse-status" className="block text-xs font-medium text-nyay-trust-mid">
            Case status <span className="text-nyay-authority">*</span>
          </label>
          <select
            id="cse-status"
            value={status}
            onChange={(e) => onStatusChange(e.target.value as CaseStatus)}
            className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30"
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cse-type" className="block text-xs font-medium text-nyay-trust-mid">
            Case type <span className="text-nyay-authority">*</span>
          </label>
          <select
            id="cse-type"
            value={caseType}
            onChange={(e) => onTypeChange(e.target.value as CaseType)}
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
    </div>
  );
}

