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
  type ClientMeeting,
  type ClientReminder,
  saveClientWorkspacePartial,
  useClientWorkspaceMap,
} from "@/lib/client-workspace";
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
  const workspaceMap = useClientWorkspaceMap();
  const [linkMatterId, setLinkMatterId] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingWhen, setMeetingWhen] = useState("");
  const [meetingMode, setMeetingMode] = useState<ClientMeeting["mode"]>("office");

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
        <div className="mx-auto max-w-7xl py-12 text-center text-sm text-nyay-muted nyay-page-x">
          Loading…
        </div>
      </div>
    );
  }

  if (!clientId || !client) {
    notFound();
  }

  const workspace = workspaceMap[clientId] ?? {
    clientId,
    specialNotes: "",
    consultationNotes: "",
    adviceLog: "",
    documentsSummary: "",
    reminders: [] as ClientReminder[],
    meetings: [] as ClientMeeting[],
  };

  const saveTextField = (
    key: "specialNotes" | "consultationNotes" | "adviceLog" | "documentsSummary",
    value: string,
  ) => {
    saveClientWorkspacePartial(clientId, { [key]: value });
  };

  const addReminder = () => {
    const title = reminderTitle.trim();
    const dueOn = reminderDate.trim();
    if (!title || !dueOn) return;
    const next: ClientReminder = {
      id: `rem-${Date.now().toString(36)}`,
      title,
      dueOn,
      done: false,
    };
    saveClientWorkspacePartial(clientId, { reminders: [...workspace.reminders, next] });
    setReminderTitle("");
    setReminderDate("");
  };

  const toggleReminder = (id: string) => {
    saveClientWorkspacePartial(clientId, {
      reminders: workspace.reminders.map((r) =>
        r.id === id ? { ...r, done: !r.done } : r,
      ),
    });
  };

  const deleteReminder = (id: string) => {
    saveClientWorkspacePartial(clientId, {
      reminders: workspace.reminders.filter((r) => r.id !== id),
    });
  };

  const addMeeting = () => {
    const title = meetingTitle.trim();
    const when = meetingWhen.trim();
    if (!title || !when) return;
    const next: ClientMeeting = {
      id: `meet-${Date.now().toString(36)}`,
      title,
      when,
      mode: meetingMode,
    };
    saveClientWorkspacePartial(clientId, { meetings: [...workspace.meetings, next] });
    setMeetingTitle("");
    setMeetingWhen("");
    setMeetingMode("office");
  };

  const matterOptions = matters.map((m) => ({
    id: m.id,
    label: `${m.id} — ${m.title}`,
    current: effectiveClientId(m, overrides),
  }));

  return (
    <div className="min-h-full font-sans text-foreground">
      <header className="relative overflow-hidden rounded-2xl border border-white/15 bg-nyay-trust-soft nyay-hero-shadow dark:border-white/10 dark:bg-nyay-trust-mid">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-nyay-authority/15 blur-3xl"
            aria-hidden
          />
          <div className="relative px-5 py-6 text-white sm:px-6 sm:py-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-nyay-authority">
              Client
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
            <dl className="mt-6 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-2">
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
              <div className="mt-5 border-t border-white/10 pt-5">
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

      <section className="mt-6 grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-nyay-border bg-nyay-surface px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-nyay-muted">
            Total matters
          </p>
          <p className="mt-1 text-xl font-semibold text-nyay-trust dark:text-foreground">
            {linkedMatters.length}
          </p>
        </div>
        <div className="rounded-xl border border-nyay-border bg-nyay-surface px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-nyay-muted">
            Active
          </p>
          <p className="mt-1 text-xl font-semibold text-nyay-trust dark:text-foreground">
            {linkedMatters.filter((m) => m.status !== "closed").length}
          </p>
        </div>
        <div className="rounded-xl border border-nyay-border bg-nyay-surface px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-nyay-muted">
            Open reminders
          </p>
          <p className="mt-1 text-xl font-semibold text-nyay-trust dark:text-foreground">
            {workspace.reminders.filter((r) => !r.done).length}
          </p>
        </div>
        <div className="rounded-xl border border-nyay-border bg-nyay-surface px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-nyay-muted">
            Meetings logged
          </p>
          <p className="mt-1 text-xl font-semibold text-nyay-trust dark:text-foreground">
            {workspace.meetings.length}
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-xl border border-nyay-border bg-nyay-surface p-4 nyay-card-shadow">
            <h2 className="text-base font-semibold text-nyay-trust dark:text-foreground">
              Special client notes
            </h2>
            <p className="mt-1 text-xs text-nyay-muted">
              Important relationship context, preferences, or sensitivity flags.
            </p>
            <textarea
              value={workspace.specialNotes}
              onChange={(e) => saveTextField("specialNotes", e.target.value)}
              rows={4}
              placeholder="e.g., prefers post-lunch calls, priority for urgent injunction updates..."
              className="mt-3 w-full resize-y rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:text-foreground"
            />
          </div>
          <div className="rounded-xl border border-nyay-border bg-nyay-surface p-4 nyay-card-shadow">
            <h2 className="text-base font-semibold text-nyay-trust dark:text-foreground">
              Consultation and advice log
            </h2>
            <textarea
              value={workspace.consultationNotes}
              onChange={(e) => saveTextField("consultationNotes", e.target.value)}
              rows={4}
              placeholder="Consultation meeting notes..."
              className="mt-3 w-full resize-y rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:text-foreground"
            />
            <textarea
              value={workspace.adviceLog}
              onChange={(e) => saveTextField("adviceLog", e.target.value)}
              rows={4}
              placeholder="Advice given to client..."
              className="mt-3 w-full resize-y rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:text-foreground"
            />
          </div>
          <div className="rounded-xl border border-nyay-border bg-nyay-surface p-4 nyay-card-shadow">
            <h2 className="text-base font-semibold text-nyay-trust dark:text-foreground">
              Client documents and case file summary
            </h2>
            <textarea
              value={workspace.documentsSummary}
              onChange={(e) => saveTextField("documentsSummary", e.target.value)}
              rows={4}
              placeholder="Track received documents, pending files, affidavit sets, IDs, and correspondence."
              className="mt-3 w-full resize-y rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:text-foreground"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-nyay-border bg-nyay-surface p-4 nyay-card-shadow">
            <h2 className="text-base font-semibold text-nyay-trust dark:text-foreground">
              Reminders
            </h2>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={reminderTitle}
                onChange={(e) => setReminderTitle(e.target.value)}
                placeholder="Reminder title"
                className="w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:text-foreground"
              />
              <input
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                placeholder="Due date / hearing date"
                className="w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:text-foreground"
              />
              <button
                type="button"
                onClick={addReminder}
                className="rounded-lg bg-nyay-trust px-3 py-2 text-xs font-semibold text-white hover:bg-nyay-trust-mid"
              >
                Add
              </button>
            </div>
            <ul className="mt-3 space-y-2">
              {workspace.reminders.length === 0 ? (
                <li className="text-xs text-nyay-muted">No reminders yet.</li>
              ) : (
                workspace.reminders.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-nyay-border px-3 py-2 text-sm"
                  >
                    <div>
                      <p
                        className={`font-medium ${
                          r.done
                            ? "text-nyay-muted line-through"
                            : "text-nyay-trust dark:text-foreground"
                        }`}
                      >
                        {r.title}
                      </p>
                      <p className="text-xs text-nyay-muted">{r.dueOn}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => toggleReminder(r.id)}
                        className="rounded-md border border-nyay-border px-2 py-1 text-xs text-nyay-trust-mid dark:text-foreground"
                      >
                        {r.done ? "Reopen" : "Done"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteReminder(r.id)}
                        className="rounded-md border border-nyay-border px-2 py-1 text-xs text-nyay-trust-mid dark:text-foreground"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="rounded-xl border border-nyay-border bg-nyay-surface p-4 nyay-card-shadow">
            <h2 className="text-base font-semibold text-nyay-trust dark:text-foreground">
              Meetings and consultations
            </h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <input
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="Meeting agenda/title"
                className="rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:text-foreground"
              />
              <input
                value={meetingWhen}
                onChange={(e) => setMeetingWhen(e.target.value)}
                placeholder="Date and time"
                className="rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:text-foreground"
              />
              <select
                value={meetingMode}
                onChange={(e) => setMeetingMode(e.target.value as ClientMeeting["mode"])}
                className="rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:text-foreground"
              >
                <option value="office">Office</option>
                <option value="court">Court</option>
                <option value="call">Call</option>
                <option value="video">Video</option>
              </select>
              <button
                type="button"
                onClick={addMeeting}
                className="rounded-lg bg-nyay-trust px-3 py-2 text-xs font-semibold text-white hover:bg-nyay-trust-mid"
              >
                Add meeting
              </button>
            </div>
            <ul className="mt-3 space-y-2">
              {workspace.meetings.length === 0 ? (
                <li className="text-xs text-nyay-muted">No meetings logged yet.</li>
              ) : (
                workspace.meetings.map((m) => (
                  <li
                    key={m.id}
                    className="rounded-lg border border-nyay-border px-3 py-2 text-sm text-nyay-trust dark:text-foreground"
                  >
                    <p className="font-medium">{m.title}</p>
                    <p className="text-xs text-nyay-muted">
                      {m.when} • {m.mode}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>

      <div className="mt-6">
        <EntityPracticeNotes entity="client" entityId={clientId} />
      </div>

      <section aria-labelledby="matters-heading" className="mt-6">
          <h2
            id="matters-heading"
            className="mb-3 flex items-center gap-2 text-lg font-semibold text-nyay-trust dark:text-foreground"
          >
            <span className="h-1 w-8 rounded-full bg-nyay-authority" aria-hidden />
            Linked matters (case-wise view)
          </h2>
          {linkedMatters.length === 0 ? (
            <div className="rounded-xl border border-dashed border-nyay-border bg-nyay-surface px-5 py-7 text-center">
              <p className="font-medium text-nyay-trust dark:text-foreground">No matters yet</p>
              <p className="mt-1 text-sm text-nyay-muted">
                Link a matter below. Demo data uses your browser storage for assignments.
              </p>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {linkedMatters.map((m) => (
                <li
                  key={m.id}
                  className="rounded-xl border border-nyay-border bg-nyay-surface p-3 nyay-card-shadow"
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
                      {m.caseType.toUpperCase()} • {m.court}
                    </p>
                    <p className="mt-1 text-xs text-nyay-muted">
                      Stage: {m.stage}
                      {m.next ? ` • Next: ${m.next}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-nyay-muted">
                      {unlinkable(m)
                        ? "Linked in this browser — you can remove the link."
                        : "From practice records."}
                    </p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link
                      href={routes.case(m.id)}
                      className="rounded-lg bg-nyay-trust px-3 py-1.5 text-xs font-semibold text-white hover:bg-nyay-trust-mid"
                    >
                      Open case
                    </Link>
                    {unlinkable(m) ? (
                      <button
                        type="button"
                        onClick={() => handleUnlink(m.id)}
                        className="shrink-0 rounded-lg border border-nyay-border px-3 py-1.5 text-xs font-semibold text-nyay-trust-mid transition-colors hover:bg-nyay-canvas dark:text-foreground dark:hover:bg-nyay-trust/10"
                      >
                        Remove link
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
      </section>

      <section
        aria-labelledby="link-matter-heading"
        className="mt-6 rounded-xl border border-nyay-border bg-nyay-surface p-4 nyay-card-shadow"
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
          <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:items-end">
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
