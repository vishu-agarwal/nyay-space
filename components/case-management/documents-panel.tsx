"use client";

import { useMemo, useState } from "react";
import { AppModal } from "@/components/ui/app-modal";
import { MaskIcon } from "@/components/icons/mask-icon";
import { FilterOptionsMenu } from "@/components/practice/filter-options-menu";
import type { CaseDocument } from "@/lib/cases";

const docKindLabel: Record<CaseDocument["kind"], string> = {
  pleading: "Pleading",
  order: "Order",
  evidence: "Evidence",
  correspondence: "Correspondence",
};

function DocIcon() {
  return <MaskIcon name="document-lines" className="h-4 w-4" />;
}

export function DocumentsPanel({
  documents,
}: {
  documents: CaseDocument[];
}) {
  const [filterKind, setFilterKind] = useState<CaseDocument["kind"] | "all">("all");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState<CaseDocument | null>(null);

  const kindOptions = useMemo(
    () =>
      [
        { key: "all" as const, label: "All" },
        { key: "pleading" as const, label: "Pleadings" },
        { key: "order" as const, label: "Orders" },
        { key: "evidence" as const, label: "Evidence" },
        { key: "correspondence" as const, label: "Correspondence" },
      ] as const,
    [],
  );

  const filtered = useMemo(() => {
    if (filterKind === "all") return documents;
    return documents.filter((d) => d.kind === filterKind);
  }, [documents, filterKind]);

  return (
    <>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-nyay-trust dark:text-foreground">
        <span className="h-1 w-8 rounded-full bg-nyay-authority" aria-hidden />
        Documents
      </h2>

      <div className="rounded-xl border border-nyay-border bg-nyay-surface p-3 nyay-card-shadow">
        <FilterOptionsMenu
          title="Doc type"
          tone="trust"
          options={kindOptions}
          value={filterKind}
          onChange={(next) => setFilterKind(next)}
          defaultValue="all"
        />

        <div className="mt-3">
          {(filtered ?? []).length === 0 ? (
            <div className="rounded-xl border border-dashed border-nyay-border bg-nyay-canvas/40 px-4 py-8 text-center">
              <p className="font-medium text-nyay-trust">No documents</p>
              <p className="mt-1 text-xs text-nyay-muted">Try a different document type.</p>
            </div>
          ) : (
            <ul className="divide-y divide-nyay-border/80">
              {filtered.map((doc) => (
                <li key={doc.id} id={`document-${doc.id}`} className="scroll-mt-24">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDoc(doc);
                      setPreviewOpen(true);
                    }}
                    className="flex w-full items-start gap-3 rounded-lg px-3 py-3.5 text-left transition-colors hover:bg-nyay-canvas/80 dark:hover:bg-nyay-trust/10"
                  >
                    <span
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-nyay-trust/5 text-nyay-authority ring-1 ring-nyay-authority/25 dark:bg-nyay-authority/10"
                      aria-hidden
                    >
                      <DocIcon />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-nyay-trust dark:text-foreground">
                        {doc.name}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-nyay-muted">
                        <span className="font-medium text-nyay-trust-mid dark:text-foreground/80">
                          {docKindLabel[doc.kind]}
                        </span>
                        <span className="text-nyay-muted/50">·</span>
                        <span>Updated {doc.updated}</span>
                        {doc.pages != null ? (
                          <>
                            <span className="text-nyay-muted/50">·</span>
                            <span className="tabular-nums">{doc.pages} pp.</span>
                          </>
                        ) : null}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-3 text-center text-xs text-nyay-muted">
          Preview and versioning connect here in production.
        </p>
      </div>

      <AppModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={activeDoc ? activeDoc.name : "Document"}
        description={activeDoc ? docKindLabel[activeDoc.kind] : undefined}
      >
        {activeDoc ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-nyay-border bg-nyay-canvas p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-nyay-muted">
                  Updated
                </p>
                <p className="mt-1 text-sm font-medium text-nyay-trust">{activeDoc.updated}</p>
              </div>
              <div className="rounded-xl border border-nyay-border bg-nyay-canvas p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-nyay-muted">
                  Pages
                </p>
                <p className="mt-1 text-sm font-medium text-nyay-trust">
                  {activeDoc.pages != null ? `${activeDoc.pages} pp.` : "—"}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-nyay-border bg-nyay-canvas/40 px-3 py-4">
              <p className="text-sm font-medium text-nyay-trust">Preview placeholder</p>
              <p className="mt-1 text-xs text-nyay-muted">
                This demo doesn’t have backend file previews yet. In production, this modal will embed the PDF/doc viewer.
              </p>
            </div>
          </div>
        ) : null}
      </AppModal>
    </>
  );
}

