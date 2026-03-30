import { AdvocateCalendar } from "@/components/practice/advocate-calendar";

export default function CalendarPage() {
  return (
    <div className="min-h-full font-sans text-foreground">
      <header className="border-b border-nyay-border pb-3 sm:pb-4">
        <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-nyay-trust sm:text-2xl dark:text-foreground">
          Calendar &amp; reminders
        </h1>
        <p className="mt-1.5 text-xs leading-relaxed text-nyay-muted sm:text-sm">
          Hearings, deadlines, mediations, and meetings in one diary. Tap a day to add a local
          event or focus that date; use the arrows to change months. Open a row to go to the
          matter when a case ID is set. Your added events stay in this browser until you wire up a
          backend.
        </p>
      </header>

      <main className="mt-4 min-w-0 sm:mt-5" aria-label="Calendar and diary">
        <AdvocateCalendar />
      </main>
    </div>
  );
}
