"use client";

import Link from "next/link";
import { useParams, notFound, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { EntityPracticeNotes } from "@/components/notes/entity-practice-notes";
import { ClientFormModal } from "@/components/clients/client-form-modal";
import { ClientContactActions } from "@/components/contact/client-contact-actions";
import { SupportWhatsAppDraftModal } from "@/components/contact/support-whatsapp-draft-modal";
import { matters, type Matter } from "@/lib/cases";
import {
  CLIENTS_SEED,
  mergeClients,
  saveExtraClients,
} from "@/lib/clients";
import {
  clearMatterClientOverride,
  effectiveClientId,
  loadMatterClientOverrides,
  saveMatterClientOverrides,
  setMatterLinkedClient,
} from "@/lib/matter-client-overrides";
import { useNyayStorage } from "@/lib/use-nyay-storage";
import { routes } from "@/lib/routes";

function newClientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `cl-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  }
  return `cl-${Date.now().toString(36)}`;
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params.id;
  const clientId = typeof rawId === "string" ? rawId : rawId?.[0] ?? "";

  const { extraClients, overrides, hydrated } = useNyayStorage();
  const [linkMatterId, setLinkMatterId] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const allClients = useMemo(
    () => mergeClients(extraClients),
    [extraClients],
  );

  const client = useMemo(
    () => allClients.find((c) => c.id === clientId),
    [allClients, clientId],
  );

  const linkedMatters = useMemo(() => {
    if (!clientId) return [];
    return matters.filter((m) => effectiveClientId(m, overrides) === clientId);
  }, [clientId, overrides]);

  const unlinkable = useCallback(
    (m: Matter) => Boolean(overrides[m.id]),
    [overrides],
  );

  const handleLink = () => {
    if (!linkMatterId || !clientId) return;
    setMatterLinkedClient(linkMatterId, clientId);
    setLinkMatterId("");
  };

  const handleUnlink = (matterId: string) => {
    clearMatterClientOverride(matterId);
  };

  const handleRemoveClient = () => {
    if (!clientId) return;
    const isSeed = CLIENTS_SEED.some((c) => c.id === clientId);
    if (isSeed) return;
    const nextExtra = extraClients.filter((c) => c.id !== clientId);
    saveExtraClients(nextExtra);
    const cleared = { ...loadMatterClientOverrides() };
    for (const mid of Object.keys(cleared)) {
      if (cleared[mid] === clientId) delete cleared[mid];
    }
    saveMatterClientOverrides(cleared);
    router.push(routes.clients);
  };

  if (!hydrated) {
    return (
      <div className="min-h-full font-sans text-foreground">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-nyay-muted">
          Loading…
        </div>
      </div>
    );
  }

  if (!clientId || !client) {
    notFound();
  }

  const matterOptions = matters.map((m) => ({
    id: m.id,
    label: `${m.id} — ${m.title}`,
    current: effectiveClientId(m, overrides),
  }));

  return (
    <div className="min-h-full font-sans text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-nyay-muted" aria-label="Breadcrumb">
          <Link
            href={routes.home}
            className="font-semibold text-nyay-authority transition-colors hover:text-nyay-authority-rich"
          >
            Nyay Space
          </Link>
          <span className="text-nyay-muted/70"> / </span>
          <Link
            href={routes.clients}
            className="font-medium text-nyay-trust-mid transition-colors hover:text-nyay-trust dark:text-foreground/90"
          >
            Clients
          </Link>
          <span className="text-nyay-muted/70"> / </span>
          <span className="text-nyay-trust dark:text-foreground">{client.name}</span>
        </nav>

        <header className="relative overflow-hidden rounded-2xl border border-white/15 bg-nyay-trust-soft nyay-hero-shadow dark:border-white/10 dark:bg-nyay-trust-mid">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-nyay-authority/15 blur-3xl"
            aria-hidden
          />
          <div className="relative px-6 py-8 text-white sm:px-8 sm:py-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-nyay-authority">
              Client
            </p>
            <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{client.name}</h1>
                {client.organization ? (
                  <p className="mt-2 text-sm text-white/80">{client.organization}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority/60"
                >
                  Edit client
                </button>
                <button
                  type="button"
                  onClick={() => setSupportOpen(true)}
                  className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority/60"
                >
                  Draft message to support
                </button>
              </div>
            </div>
            <dl className="mt-8 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-nyay-authority/90">
                  Email
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  <a href={`mailto:${client.email}`} className="text-white underline-offset-2 hover:underline">
                    {client.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-nyay-authority/90">
                  Phone
                </dt>
                <dd className="mt-1 space-y-2">
                  <span className="block text-sm font-medium tabular-nums text-white">{client.phone}</span>
                  <ClientContactActions client={client} variant="onDark" />
                </dd>
              </div>
              {client.notes ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-nyay-authority/90">
                    Notes
                  </dt>
                  <dd className="mt-1 text-sm text-white/85">{client.notes}</dd>
                </div>
              ) : null}
            </dl>
            {!CLIENTS_SEED.some((c) => c.id === clientId) ? (
              <div className="mt-6 border-t border-white/10 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    if (
                      typeof window !== "undefined" &&
                      window.confirm("Remove this client from this browser? Linked matter overrides for this client will be cleared.")
                    ) {
                      handleRemoveClient();
                    }
                  }}
                  className="rounded-lg border border-white/25 bg-white/5 px-3 py-2 text-xs font-semibold text-white/90 transition-colors hover:bg-white/10"
                >
                  Remove local client
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <div className="mt-10">
          <EntityPracticeNotes entity="client" entityId={clientId} />
        </div>

        <section aria-labelledby="matters-heading" className="mt-10">
          <h2
            id="matters-heading"
            className="mb-4 flex items-center gap-2 text-lg font-semibold text-nyay-trust dark:text-foreground"
          >
            <span className="h-1 w-8 rounded-full bg-nyay-authority" aria-hidden />
            Linked matters
          </h2>
          {linkedMatters.length === 0 ? (
            <div className="rounded-xl border border-dashed border-nyay-border bg-nyay-surface px-6 py-10 text-center">
              <p className="font-medium text-nyay-trust dark:text-foreground">No matters yet</p>
              <p className="mt-1 text-sm text-nyay-muted">
                Link a matter below. Demo data uses your browser storage for assignments.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {linkedMatters.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-nyay-border bg-nyay-surface px-4 py-3 nyay-card-shadow"
                >
                  <div className="min-w-0">
                    <Link
                      href={routes.case(m.id)}
                      className="font-mono text-xs text-nyay-authority-rich outline-none hover:underline focus-visible:ring-2 focus-visible:ring-nyay-authority/50 dark:text-nyay-authority"
                    >
                      {m.id}
                    </Link>
                    <p className="mt-0.5 font-medium text-nyay-trust dark:text-foreground">{m.title}</p>
                    <p className="mt-1 text-xs text-nyay-muted">
                      {unlinkable(m)
                        ? "Linked in this browser — you can remove the link."
                        : "From practice records."}
                    </p>
                  </div>
                  {unlinkable(m) ? (
                    <button
                      type="button"
                      onClick={() => handleUnlink(m.id)}
                      className="shrink-0 rounded-lg border border-nyay-border px-3 py-1.5 text-xs font-semibold text-nyay-trust-mid transition-colors hover:bg-nyay-canvas dark:text-foreground dark:hover:bg-nyay-trust/10"
                    >
                      Remove link
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          aria-labelledby="link-matter-heading"
          className="mt-8 rounded-xl border border-nyay-border bg-nyay-surface p-5 nyay-card-shadow"
        >
          <h2
            id="link-matter-heading"
            className="text-base font-semibold text-nyay-trust dark:text-foreground"
          >
            Link a matter
          </h2>
          <p className="mt-1 text-xs text-nyay-muted">
            Assign any matter to this client. This updates listings and the case header for this browser.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="min-w-0 flex-1">
              <span className="block text-xs font-medium text-nyay-trust-mid dark:text-foreground/90">
                Matter
              </span>
              <select
                value={linkMatterId}
                onChange={(e) => setLinkMatterId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:bg-nyay-canvas dark:text-foreground"
              >
                <option value="">Select a matter…</option>
                {matterOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                    {o.current === clientId ? " (already here)" : ""}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={handleLink}
              disabled={!linkMatterId}
              className="rounded-lg bg-nyay-trust px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-nyay-trust/20 transition-all hover:bg-nyay-trust-mid hover:shadow-lg hover:shadow-nyay-trust/25 disabled:pointer-events-none disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority focus-visible:ring-offset-2 focus-visible:ring-offset-nyay-surface dark:bg-nyay-trust-mid dark:hover:bg-nyay-trust-soft dark:focus-visible:ring-offset-[#122238]"
            >
              Link to client
            </button>
          </div>
        </section>
      </div>

      <ClientFormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        initialClient={client}
        buildNewId={newClientId}
      />
      <SupportWhatsAppDraftModal open={supportOpen} onOpenChange={setSupportOpen} />
    </div>
  );
}
