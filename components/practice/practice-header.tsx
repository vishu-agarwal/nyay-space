"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MaskIcon } from "@/components/icons/mask-icon";
import {
  getCalendarWorkItems,
  localISODate,
  type CalendarWorkItem,
} from "@/lib/calendar-reminders";
import { loadCustomCalendarEvents } from "@/lib/calendar-custom-events";
import { loadAdvocateProfile } from "@/lib/advocate-profile";
import { normalizeIndiaWhatsappDigits, whatsappWebUrl } from "@/lib/phone-contact";
import { PRACTICE_WHATSAPP_DIGITS } from "@/lib/practice-contact";
import { GlobalSearch } from "@/components/practice/global-search";
import { NyayLogoLink } from "@/components/nyay-logo-link";
import { routes } from "@/lib/routes";

const nav = [
  { href: routes.tasks, label: "To-Do", match: "exact" as const },
  { href: routes.calendar, label: "Calendar", match: "prefix" as const },
  { href: routes.cases, label: "Cases", match: "prefix" as const },
  { href: routes.clients, label: "Clients", match: "prefix" as const },
  { href: routes.documents, label: "Documents", match: "prefix" as const },
];

function isActive(pathname: string, href: string, match: "exact" | "prefix") {
  if (match === "exact") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navLinkClass(active: boolean) {
  return [
    "block rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 md:inline-block md:py-2",
    active
      ? "bg-nyay-authority-soft text-nyay-trust shadow-sm ring-1 ring-nyay-authority/35 dark:bg-nyay-authority/15 dark:text-nyay-authority dark:ring-nyay-authority/30"
      : "text-nyay-trust-mid hover:bg-nyay-canvas hover:text-nyay-trust dark:text-foreground/85 dark:hover:bg-white/5 dark:hover:text-foreground",
  ].join(" ");
}

const REMINDER_STORAGE_KEY = "nyay-calendar-reminder-ids";
const REMINDER_PREFS_STORAGE_KEY = "nyay-calendar-reminder-prefs";
const ALERT_NOTIFICATIONS_ENABLED_KEY = "nyay-calendar-alert-notifications-enabled";

type ReminderLead = "on-day" | "1-day" | "2-day";
type ToastItem = { id: string; title: string; message: string };

function loadReminderIds(): Set<string> {
  try {
    const raw = localStorage.getItem(REMINDER_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function loadReminderPrefs(): Record<string, ReminderLead> {
  try {
    const raw = localStorage.getItem(REMINDER_PREFS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, ReminderLead> = {};
    for (const [id, lead] of Object.entries(parsed as Record<string, unknown>)) {
      if (lead === "on-day" || lead === "1-day" || lead === "2-day") out[id] = lead;
    }
    return out;
  } catch {
    return {};
  }
}

function loadAlertNotificationsEnabled(): boolean {
  const raw = localStorage.getItem(ALERT_NOTIFICATIONS_ENABLED_KEY);
  if (raw == null) return true;
  return raw === "1";
}

function saveAlertNotificationsEnabled(enabled: boolean) {
  localStorage.setItem(ALERT_NOTIFICATIONS_ENABLED_KEY, enabled ? "1" : "0");
}

function leadToDays(lead: ReminderLead): number {
  if (lead === "2-day") return 2;
  if (lead === "1-day") return 1;
  return 0;
}

function isoDayDiff(fromIso: string, toIso: string): number {
  const from = new Date(fromIso + "T12:00:00").getTime();
  const to = new Date(toIso + "T12:00:00").getTime();
  if (Number.isNaN(from) || Number.isNaN(to)) return 0;
  return Math.round((to - from) / (24 * 60 * 60 * 1000));
}

export function PracticeHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [todayKey, setTodayKey] = useState("");
  const [dueAlerts, setDueAlerts] = useState<
    Array<{ item: CalendarWorkItem; until: number; lead: ReminderLead }>
  >([]);
  const [alertNotificationsEnabled, setAlertNotificationsEnabled] = useState(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [notifiedKeys, setNotifiedKeys] = useState<Set<string>>(() => new Set());
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen && !alertsOpen) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (menuOpen && target && !mobileMenuRef.current?.contains(target)) {
        setMenuOpen(false);
      }
      if (alertsOpen && target && !alertsRef.current?.contains(target)) {
        setAlertsOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [menuOpen, alertsOpen]);

  useEffect(() => {
    const tk = localISODate(new Date());
    setTodayKey(tk);
    const reminderIds = loadReminderIds();
    const reminderPrefs = loadReminderPrefs();
    const allItems = [...getCalendarWorkItems(), ...loadCustomCalendarEvents()];
    const due = allItems
      .filter((it) => reminderIds.has(it.id))
      .map((it) => {
        const lead = reminderPrefs[it.id] ?? "1-day";
        const until = isoDayDiff(tk, it.date);
        return { item: it, until, lead };
      })
      .filter((x) => x.until >= 0 && x.until <= leadToDays(x.lead))
      .sort((a, b) => {
        const c = a.item.date.localeCompare(b.item.date);
        if (c !== 0) return c;
        return (a.item.time ?? "").localeCompare(b.item.time ?? "");
      })
      .slice(0, 10);
    setDueAlerts(due);
    setAlertNotificationsEnabled(loadAlertNotificationsEnabled());
  }, [pathname]);

  useEffect(() => {
    if (!alertNotificationsEnabled || dueAlerts.length === 0 || !todayKey) return;
    const newRows = dueAlerts.filter((row) => !notifiedKeys.has(`${row.item.id}:${row.lead}:${todayKey}`));
    if (newRows.length === 0) return;

    const first = newRows[0];
    const id = `${Date.now()}-a`;
    setToasts((prev) => [
      ...prev,
      {
        id,
        title: "Reminder due",
        message: `${first.item.title} · ${first.until === 0 ? "Today" : first.until === 1 ? "Tomorrow" : `In ${first.until} days`}`,
      },
    ]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);

    setNotifiedKeys((prev) => {
      const next = new Set(prev);
      for (const row of newRows) next.add(`${row.item.id}:${row.lead}:${todayKey}`);
      return next;
    });
  }, [alertNotificationsEnabled, dueAlerts, notifiedKeys, todayKey]);

  const sendDueOnWhatsApp = () => {
    if (dueAlerts.length === 0) return;
    const profile = loadAdvocateProfile();
    const target = normalizeIndiaWhatsappDigits(profile?.whatsapp ?? "") || PRACTICE_WHATSAPP_DIGITS;
    const lines = dueAlerts.slice(0, 8).map(
      (row, idx) =>
        `${idx + 1}. ${row.item.title} (${row.item.caseId || "Unassigned"}) - ${row.item.date}${row.item.time ? ` ${row.item.time}` : ""}`,
    );
    const text = `NyaySpace reminders:\n${lines.join("\n")}`;
    window.open(whatsappWebUrl(target, text), "_blank", "noopener,noreferrer");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-nyay-border/90 bg-nyay-surface/90 shadow-[0_1px_0_rgba(201,162,39,0.12)] backdrop-blur-md dark:bg-[color-mix(in_srgb,var(--nyay-surface)_92%,transparent)] dark:shadow-[0_1px_0_rgba(212,184,74,0.1)]">
      <div className="mx-auto flex h-18 max-w-7xl min-w-0 items-center gap-2 px-2 sm:px-3 lg:px-4">
        <NyayLogoLink className="shrink-0" />

        <div className="flex min-w-0 flex-1 justify-end md:justify-start">
          <GlobalSearch />
        </div>

        <div className="relative flex shrink-0 items-center gap-1 sm:gap-2">
          <div ref={alertsRef} className="relative">
            <button
              type="button"
              onClick={() => setAlertsOpen((o) => !o)}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-nyay-border text-nyay-trust transition hover:bg-nyay-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nyay-authority dark:border-white/15 dark:text-foreground dark:hover:bg-white/5"
              aria-expanded={alertsOpen}
              aria-label="Open reminders"
              title="Reminders"
            >
              <MaskIcon name="bell" className="h-5 w-5" />
              {dueAlerts.length > 0 ? (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-nyay-authority" />
              ) : null}
            </button>
            {alertsOpen ? (
              <div className="absolute right-0 top-12 z-70 w-[min(24rem,calc(100vw-1rem))] rounded-xl border border-nyay-border bg-nyay-surface p-3 nyay-card-shadow">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-nyay-trust dark:text-foreground">Reminders</p>
                  <button
                    type="button"
                    onClick={() =>
                      setAlertNotificationsEnabled((prev) => {
                        const next = !prev;
                        saveAlertNotificationsEnabled(next);
                        return next;
                      })
                    }
                    className="rounded border border-nyay-border px-2 py-1 text-[11px] text-nyay-muted hover:text-nyay-trust dark:hover:text-foreground"
                  >
                    {alertNotificationsEnabled ? "Pause popups" : "Enable popups"}
                  </button>
                </div>
                {dueAlerts.length === 0 ? (
                  <p className="text-xs text-nyay-muted">No due reminders right now.</p>
                ) : (
                  <ul className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
                    {dueAlerts.map(({ item, until }) => (
                      <li key={`${item.id}-${item.date}`} className="rounded-lg border border-nyay-border px-2 py-1.5">
                        <p className="text-xs font-medium text-nyay-trust dark:text-foreground">{item.title}</p>
                        <p className="text-[11px] text-nyay-muted">
                          {item.date}
                          {item.time ? ` · ${item.time}` : ""}
                          {" · "}
                          {until === 0 ? "Today" : until === 1 ? "Tomorrow" : `In ${until} days`}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-2 flex items-center justify-between gap-2">
                  <Link
                    href={routes.calendar}
                    className="text-xs font-medium text-nyay-authority-rich hover:underline dark:text-nyay-authority"
                    onClick={() => setAlertsOpen(false)}
                  >
                    Open calendar
                  </Link>
                  <button
                    type="button"
                    onClick={sendDueOnWhatsApp}
                    disabled={dueAlerts.length === 0}
                    className="rounded-md bg-[#25D366] px-2.5 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Send on WhatsApp
                  </button>
                </div>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-nyay-border text-nyay-trust transition hover:bg-nyay-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nyay-authority md:hidden dark:border-white/15 dark:text-foreground dark:hover:bg-white/5"
            aria-expanded={menuOpen}
            aria-controls="practice-mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? (
              <span className="sr-only">Close</span>
            ) : (
              <span className="sr-only">Menu</span>
            )}
            <span
              className="relative flex h-5 w-5 flex-col justify-center gap-[5px]"
              aria-hidden
            >
              <span
                className={[
                  "block h-0.5 w-full rounded-full bg-current transition duration-200 ease-out",
                  menuOpen ? "translate-y-[7px] rotate-45" : "",
                ].join(" ")}
              />
              <span
                className={[
                  "block h-0.5 w-full rounded-full bg-current transition duration-200 ease-out",
                  menuOpen ? "scale-x-0 opacity-0" : "opacity-100",
                ].join(" ")}
              />
              <span
                className={[
                  "block h-0.5 w-full rounded-full bg-current transition duration-200 ease-out",
                  menuOpen ? "-translate-y-[7px] -rotate-45" : "",
                ].join(" ")}
              />
            </span>
          </button>

          <nav className="hidden flex-wrap gap-1 md:flex" aria-label="Practice">
            {nav.map(({ href, label, match }) => {
              const active = isActive(pathname, href, match);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={navLinkClass(active)}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div
        ref={mobileMenuRef}
        id="practice-mobile-nav"
        className={[
          "border-t border-nyay-border/80 bg-nyay-surface/95 backdrop-blur-md md:hidden dark:border-white/10 dark:bg-[color-mix(in_srgb,var(--nyay-surface)_95%,transparent)]",
          menuOpen ? "block" : "hidden",
        ].join(" ")}
      >
        <nav
          className="mx-auto flex max-w-7xl flex-col gap-1 py-2.5 nyay-page-x"
          aria-label="Practice mobile"
        >
          {nav.map(({ href, label, match }) => {
            const active = isActive(pathname, href, match);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={navLinkClass(active)}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="pointer-events-none fixed bottom-3 right-3 z-70 flex w-[min(22rem,calc(100vw-1.5rem))] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className="pointer-events-auto rounded-lg border border-nyay-border bg-nyay-surface px-3 py-2 nyay-card-shadow"
          >
            <div className="flex items-start gap-2">
              <span className="mt-0.5 rounded-md bg-nyay-authority-soft p-1 text-nyay-authority-rich dark:text-nyay-authority">
                <MaskIcon name="bell" className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-nyay-trust dark:text-foreground">{t.title}</p>
                <p className="text-[11px] leading-snug text-nyay-muted">{t.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className="rounded px-1 text-[11px] text-nyay-muted hover:text-nyay-trust dark:hover:text-foreground"
                aria-label="Dismiss reminder"
              >
                x
              </button>
            </div>
          </div>
        ))}
      </div>
    </header>
  );
}
