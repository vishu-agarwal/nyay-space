"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  CLIENTS_SEED,
  loadExtraClients,
  mergeClients,
  saveExtraClients,
  type Client,
} from "@/lib/clients";
import {
  matters,
  mattersForClientId,
} from "@/lib/cases";
import { effectiveClientId } from "@/lib/matter-client-overrides";
import { useNyayStorage } from "@/lib/use-nyay-storage";

function newClientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `cl-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  }
  return `cl-${Date.now().toString(36)}`;
}

export default function ClientsPage() {
  const { extraClients, overrides } = useNyayStorage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const n = name.trim();
    const em = email.trim();
    const ph = phone.trim();
    if (!n || !em || !ph) {
      setFormError("Name, email, and phone are required.");
      return;
    }
    const next: Client = {
      id: newClientId(),
      name: n,
      email: em,
      phone: ph,
      organization: organization.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    const mergedExtra = [...loadExtraClients(), next];
    saveExtraClients(mergedExtra);
    setName("");
    setEmail("");
    setPhone("");
    setOrganization("");
    setNotes("");
  };

  return (
    <div className="min-h-full font-sans text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 border-b border-nyay-border pb-6">
          <p className="text-sm font-semibold tracking-wide text-nyay-authority uppercase">
            <Link href="/dashboard" className="transition-colors hover:text-nyay-authority-rich">
              Nyay Space
            </Link>
            <span className="text-nyay-muted/70"> / </span>
            Clients
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-nyay-trust sm:text-3xl dark:text-foreground">
            Client management
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-nyay-muted">
            Track clients and open a profile to link matters. New clients are stored in this
            browser for the demo.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section aria-labelledby="clients-list-heading">
            <h2
              id="clients-list-heading"
              className="mb-4 flex items-center gap-2 text-lg font-semibold text-nyay-trust dark:text-foreground"
            >
              <span className="h-1 w-6 rounded-full bg-nyay-authority" aria-hidden />
              All clients
            </h2>
            <div className="overflow-hidden rounded-xl border border-nyay-border bg-nyay-surface nyay-card-shadow">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
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
                              href={`/dashboard/clients/${encodeURIComponent(c.id)}`}
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="add-client-heading"
            className="rounded-xl border border-nyay-border border-t-4 border-t-nyay-authority bg-nyay-surface p-5 nyay-card-shadow lg:sticky lg:top-24 lg:self-start"
          >
            <h2
              id="add-client-heading"
              className="text-base font-semibold text-nyay-trust dark:text-foreground"
            >
              Add client
            </h2>
            <p className="mt-1 text-xs text-nyay-muted">
              Saved in this browser (demo). Open the profile to link cases.
            </p>
            <form onSubmit={handleAdd} className="mt-4 space-y-3">
              <div>
                <label htmlFor="client-name" className="block text-xs font-medium text-nyay-trust-mid dark:text-foreground/90">
                  Name <span className="text-nyay-authority">*</span>
                </label>
                <input
                  id="client-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:bg-nyay-canvas dark:text-foreground"
                  autoComplete="name"
                />
              </div>
              <div>
                <label htmlFor="client-email" className="block text-xs font-medium text-nyay-trust-mid dark:text-foreground/90">
                  Email <span className="text-nyay-authority">*</span>
                </label>
                <input
                  id="client-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:bg-nyay-canvas dark:text-foreground"
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="client-phone" className="block text-xs font-medium text-nyay-trust-mid dark:text-foreground/90">
                  Phone <span className="text-nyay-authority">*</span>
                </label>
                <input
                  id="client-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:bg-nyay-canvas dark:text-foreground"
                  autoComplete="tel"
                />
              </div>
              <div>
                <label htmlFor="client-org" className="block text-xs font-medium text-nyay-trust-mid dark:text-foreground/90">
                  Organization
                </label>
                <input
                  id="client-org"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:bg-nyay-canvas dark:text-foreground"
                />
              </div>
              <div>
                <label htmlFor="client-notes" className="block text-xs font-medium text-nyay-trust-mid dark:text-foreground/90">
                  Notes
                </label>
                <textarea
                  id="client-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-1 w-full resize-y rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:bg-nyay-canvas dark:text-foreground"
                />
              </div>
              {formError ? (
                <p className="text-sm text-red-700 dark:text-red-400" role="alert">
                  {formError}
                </p>
              ) : null}
              <button
                type="submit"
                className="w-full rounded-lg bg-nyay-trust px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-nyay-trust/20 transition-all hover:bg-nyay-trust-mid hover:shadow-lg hover:shadow-nyay-trust/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority focus-visible:ring-offset-2 focus-visible:ring-offset-nyay-surface dark:bg-nyay-trust-mid dark:hover:bg-nyay-trust-soft dark:focus-visible:ring-offset-[#122238]"
              >
                Save client
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
