"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ClientFormModal } from "@/components/clients/client-form-modal";
import {
  CLIENTS_SEED,
  mergeClients,
  type Client,
} from "@/lib/clients";
import {
  matters,
  mattersForClientId,
} from "@/lib/cases";
import { effectiveClientId } from "@/lib/matter-client-overrides";
import { useNyayStorage } from "@/lib/use-nyay-storage";
import { routes } from "@/lib/routes";

function newClientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `cl-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  }
  return `cl-${Date.now().toString(36)}`;
}

export default function ClientsPage() {
  const { extraClients, overrides } = useNyayStorage();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  const allClients = useMemo(
    () => mergeClients(extraClients),
    [extraClients],
  );

  const matterCount = useCallback(
    (clientId: string) =>
      matters.filter((m) => effectiveClientId(m, overrides) === clientId)
        .length,
    [overrides],
  );

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (c: Client) => {
    setEditing(c);
    setModalOpen(true);
  };

  const onModalOpenChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) setEditing(null);
  };

  return (
    <div className="min-h-full font-sans text-foreground">
      <header className="mb-5 flex flex-col gap-3 border-b border-nyay-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-nyay-trust sm:text-3xl dark:text-foreground">
            Client management
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-nyay-muted">
            Track clients and open a profile to link matters. New clients are stored in this
            browser for the demo.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="shrink-0 rounded-lg bg-nyay-trust px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-nyay-trust/20 transition-all hover:bg-nyay-trust-mid focus:outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority focus-visible:ring-offset-2 focus-visible:ring-offset-nyay-canvas dark:bg-nyay-trust-mid dark:hover:bg-nyay-trust-soft dark:focus-visible:ring-offset-[#0a1628]"
        >
          Add client
        </button>
      </header>

        <section aria-labelledby="clients-list-heading">
          <h2
            id="clients-list-heading"
            className="mb-3 flex items-center gap-2 text-lg font-semibold text-nyay-trust dark:text-foreground"
          >
            <span className="h-1 w-6 rounded-full bg-nyay-authority" aria-hidden />
            All clients
          </h2>
          <div className="overflow-hidden rounded-xl border border-nyay-border bg-nyay-surface nyay-card-shadow">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-nyay-border bg-nyay-canvas dark:bg-nyay-trust/10">
                    <th className="px-4 py-3 font-semibold text-nyay-trust dark:text-foreground">
                      Client
                    </th>
                    <th className="px-4 py-3 font-semibold text-nyay-trust dark:text-foreground">
                      Contact
                    </th>
                    <th className="px-4 py-3 font-semibold text-nyay-trust dark:text-foreground">
                      Matters
                    </th>
                    <th className="px-4 py-3 font-semibold text-nyay-trust dark:text-foreground">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allClients.map((c) => {
                    const seedCount = mattersForClientId(c.id).length;
                    const effectiveCount = matterCount(c.id);
                    const hasLinkOverrides = effectiveCount !== seedCount;
                    const isExtra = !CLIENTS_SEED.some((s) => s.id === c.id);
                    return (
                      <tr
                        key={c.id}
                        className="border-b border-nyay-border/60 last:border-0 hover:bg-nyay-canvas/50 dark:hover:bg-nyay-trust/5"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={routes.client(c.id)}
                            className="group block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority/50"
                          >
                            <span className="font-medium text-nyay-trust group-hover:text-nyay-trust-mid dark:text-foreground dark:group-hover:text-foreground">
                              {c.name}
                            </span>
                            {c.organization ? (
                              <span className="mt-0.5 block text-xs text-nyay-muted">
                                {c.organization}
                              </span>
                            ) : null}
                            {isExtra ? (
                              <span className="mt-1 inline-block rounded-full bg-nyay-authority-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-nyay-authority-fg dark:text-nyay-authority">
                                Added locally
                              </span>
                            ) : null}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-nyay-muted">
                          <span className="block">{c.email}</span>
                          <span className="mt-0.5 block tabular-nums">{c.phone}</span>
                        </td>
                        <td className="px-4 py-3 tabular-nums font-medium text-nyay-trust-mid dark:text-foreground">
                          {effectiveCount}
                          {hasLinkOverrides ? (
                            <span className="ml-1 text-xs font-normal text-nyay-muted">
                              (incl. links)
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => openEdit(c)}
                            className="rounded-lg border border-nyay-border px-3 py-1.5 text-xs font-semibold text-nyay-trust-mid transition-colors hover:bg-nyay-canvas dark:border-white/15 dark:text-foreground dark:hover:bg-white/5"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      <ClientFormModal
        open={modalOpen}
        onOpenChange={onModalOpenChange}
        mode={editing ? "edit" : "add"}
        initialClient={editing ?? undefined}
        buildNewId={newClientId}
      />
    </div>
  );
}
