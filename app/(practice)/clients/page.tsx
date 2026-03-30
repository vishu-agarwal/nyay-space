"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { MaskIcon } from "@/components/icons/mask-icon";
import { ClientFormModal } from "@/components/clients/client-form-modal";
import {
  CLIENTS_SEED,
  mergeClients,
  type Client,
} from "@/lib/clients";
import { useClientWorkspaceMap } from "@/lib/client-workspace";
import {
  matters,
} from "@/lib/cases";
import { effectiveClientId } from "@/lib/matter-client-overrides";
import { useNyayStorage } from "@/lib/use-nyay-storage";
import { routes } from "@/lib/routes";
import { FilterOptionsMenu } from "@/components/practice/filter-options-menu";
import { SearchFilterToolbar } from "@/components/practice/search-filter-toolbar";

function newClientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `cl-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  }
  return `cl-${Date.now().toString(36)}`;
}

export default function ClientsPage() {
  const { extraClients, overrides } = useNyayStorage();
  const workspaceMap = useClientWorkspaceMap();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "needsFollowUp">("all");
  const [view, setView] = useState<"list" | "card">("card");

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

  const activeMatterCount = useCallback(
    (clientId: string) =>
      matters.filter(
        (m) =>
          effectiveClientId(m, overrides) === clientId &&
          m.status !== "closed",
      ).length,
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

  const cards = useMemo(() => {
    return allClients.map((client) => {
      const linked = matters.filter(
        (m) => effectiveClientId(m, overrides) === client.id,
      );
      const active = linked.filter((m) => m.status !== "closed");
      const upcoming = linked
        .map((m) => m.next)
        .filter((v): v is string => Boolean(v))
        .slice(0, 2);
      const workspace = workspaceMap[client.id] ?? {
        clientId: client.id,
        specialNotes: "",
        consultationNotes: "",
        adviceLog: "",
        documentsSummary: "",
        reminders: [],
        meetings: [],
      };
      const pendingReminders = workspace.reminders.filter((r) => !r.done).length;
      const lastMeeting = workspace.meetings[workspace.meetings.length - 1];
      return {
        client,
        linkedCount: linked.length,
        activeCount: active.length,
        pendingReminders,
        upcoming,
        hasNotes:
          Boolean(workspace.specialNotes) || Boolean(workspace.consultationNotes),
        lastMeeting,
      };
    });
  }, [allClients, overrides, workspaceMap]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards.filter((item) => {
      const matchesSearch =
        q.length === 0 ||
        item.client.name.toLowerCase().includes(q) ||
        (item.client.organization ?? "").toLowerCase().includes(q) ||
        item.client.phone.toLowerCase().includes(q) ||
        item.client.email.toLowerCase().includes(q);
      if (!matchesSearch) return false;
      if (filter === "active") return item.activeCount > 0;
      if (filter === "needsFollowUp") return item.pendingReminders > 0;
      return true;
    });
  }, [cards, filter, query]);

  const totalActive = useMemo(
    () => allClients.filter((c) => activeMatterCount(c.id) > 0).length,
    [activeMatterCount, allClients],
  );
  const totalNeedsFollowUp = useMemo(
    () =>
      allClients.filter(
        (c) => (workspaceMap[c.id]?.reminders ?? []).some((r) => !r.done),
      )
        .length,
    [allClients, workspaceMap],
  );

  return (
    <div className="min-h-full font-sans text-foreground">
      <header className="mb-5 flex flex-col gap-3 border-b border-nyay-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-nyay-trust sm:text-3xl dark:text-foreground">
            Client management
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-nyay-muted">
            Keep every client detail, matters, notes, reminders, and meeting context in one
            searchable workspace.
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
          Client workspace
        </h2>
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-nyay-border bg-nyay-surface px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-nyay-muted">
              Total clients
            </p>
            <p className="mt-1 text-2xl font-semibold text-nyay-trust dark:text-foreground">
              {allClients.length}
            </p>
          </div>
          <div className="rounded-xl border border-nyay-border bg-nyay-surface px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-nyay-muted">
              Active clients
            </p>
            <p className="mt-1 text-2xl font-semibold text-nyay-trust dark:text-foreground">
              {totalActive}
            </p>
          </div>
          <div className="rounded-xl border border-nyay-border bg-nyay-surface px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-nyay-muted">
              Need follow-up
            </p>
            <p className="mt-1 text-2xl font-semibold text-nyay-trust dark:text-foreground">
              {totalNeedsFollowUp}
            </p>
          </div>
        </div>
        <SearchFilterToolbar
          searchLabel="Search clients"
          searchPlaceholder="Search client name, phone, email, company..."
          query={query}
          onQueryChange={setQuery}
          view={view}
          onViewChange={setView}
        >
          <FilterOptionsMenu
            title="Client state"
            tone="trust"
            options={
              [
                { key: "all", label: "All clients" },
                { key: "active", label: "Active clients" },
                { key: "needsFollowUp", label: "Needs follow-up" },
              ] as const
            }
            value={filter}
            onChange={setFilter}
            defaultValue="all"
          />
        </SearchFilterToolbar>
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-nyay-border bg-nyay-surface px-5 py-10 text-center text-sm text-nyay-muted">
            No clients match your search.
          </div>
        ) : view === "list" ? (
          <div className="overflow-hidden rounded-xl border border-nyay-border bg-nyay-surface nyay-card-shadow">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
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
                      Reminders
                    </th>
                    <th className="px-4 py-3 font-semibold text-nyay-trust dark:text-foreground">
                      Last meeting
                    </th>
                    <th className="px-4 py-3 font-semibold text-nyay-trust dark:text-foreground">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const c = item.client;
                    const isExtra = !CLIENTS_SEED.some((s) => s.id === c.id);
                    return (
                      <tr
                        key={c.id}
                        className="border-b border-nyay-border/60 last:border-0 hover:bg-nyay-canvas/50 dark:hover:bg-nyay-trust/5"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={routes.client(c.id)}
                            className="font-medium text-nyay-trust hover:underline dark:text-foreground"
                          >
                            {c.name}
                          </Link>
                          {c.organization ? (
                            <p className="mt-0.5 text-xs text-nyay-muted">{c.organization}</p>
                          ) : null}
                          {isExtra ? (
                            <span className="mt-1 inline-block rounded-full bg-nyay-authority-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-nyay-authority-fg dark:text-nyay-authority">
                              Local
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-nyay-muted">
                          <p className="tabular-nums">{c.phone}</p>
                          <p className="truncate">{c.email}</p>
                        </td>
                        <td className="px-4 py-3 font-medium text-nyay-trust-mid dark:text-foreground">
                          {matterCount(c.id)}
                        </td>
                        <td className="px-4 py-3 font-medium text-nyay-trust-mid dark:text-foreground">
                          {item.pendingReminders}
                        </td>
                        <td className="px-4 py-3 text-nyay-muted">
                          {item.lastMeeting?.when ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={routes.client(c.id)}
                              className="rounded-lg bg-nyay-trust px-3 py-1.5 text-xs font-semibold text-white hover:bg-nyay-trust-mid"
                            >
                              Open
                            </Link>
                            <button
                              type="button"
                              onClick={() => openEdit(c)}
                              className="rounded-lg border border-nyay-border px-3 py-1.5 text-xs font-semibold text-nyay-trust-mid transition-colors hover:bg-nyay-canvas dark:border-white/15 dark:text-foreground dark:hover:bg-white/5"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => {
              const c = item.client;
              const isExtra = !CLIENTS_SEED.some((s) => s.id === c.id);
              const effectiveCount = matterCount(c.id);
              const hasLinkOverrides = effectiveCount !== item.linkedCount;
              return (
                <article
                  key={c.id}
                  className="rounded-xl border border-nyay-border bg-nyay-surface p-4 nyay-card-shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={routes.client(c.id)}
                        className="font-semibold text-nyay-trust hover:underline dark:text-foreground"
                      >
                        {c.name}
                      </Link>
                      {c.organization ? (
                        <p className="mt-0.5 text-xs text-nyay-muted">{c.organization}</p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1">
                      {isExtra ? (
                        <span className="inline-block rounded-full bg-nyay-authority-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-nyay-authority-fg dark:text-nyay-authority">
                          Local
                        </span>
                      ) : null}
                      <Link
                        href={routes.client(c.id)}
                        title="Open client workspace"
                        aria-label="Open client workspace"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-nyay-border text-nyay-trust-mid transition-colors hover:bg-nyay-canvas dark:border-white/15 dark:text-foreground dark:hover:bg-white/5"
                      >
                        <MaskIcon name="chevron-right" className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        title="Edit client"
                        aria-label="Edit client"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-nyay-border text-nyay-trust-mid transition-colors hover:bg-nyay-canvas dark:border-white/15 dark:text-foreground dark:hover:bg-white/5"
                      >
                        <MaskIcon name="document-lines" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-nyay-muted">
                    <p>{c.phone}</p>
                    <p className="truncate">{c.email}</p>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-md bg-nyay-canvas px-2 py-1">
                      <p className="font-semibold text-nyay-trust dark:text-foreground">
                        {effectiveCount}
                      </p>
                      <p className="text-nyay-muted">Matters</p>
                    </div>
                    <div className="rounded-md bg-nyay-canvas px-2 py-1">
                      <p className="font-semibold text-nyay-trust dark:text-foreground">
                        {item.pendingReminders}
                      </p>
                      <p className="text-nyay-muted">Reminders</p>
                    </div>
                    <div className="rounded-md bg-nyay-canvas px-2 py-1">
                      <p className="font-semibold text-nyay-trust dark:text-foreground">
                        {item.hasNotes ? "Yes" : "No"}
                      </p>
                      <p className="text-nyay-muted">Notes</p>
                    </div>
                  </div>
                  {item.upcoming.length > 0 ? (
                    <p className="mt-3 text-xs text-nyay-muted">
                      Upcoming: {item.upcoming.join(" • ")}
                    </p>
                  ) : null}
                  {item.lastMeeting ? (
                    <p className="mt-1 text-xs text-nyay-muted">
                      Last meeting: {item.lastMeeting.when}
                    </p>
                  ) : null}
                  {hasLinkOverrides ? (
                    <p className="mt-1 text-xs text-nyay-muted">
                      Includes linked matters from this browser.
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
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
