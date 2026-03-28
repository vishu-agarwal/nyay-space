import { PracticeListingKicker } from "@/components/practice/listing-kicker";
import { AdvocateCalendar } from "@/components/practice/advocate-calendar";

export default function CalendarPage() {
  return (
    <div className="min-h-full font-sans text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-7 lg:px-8">
        <header className="border-b border-nyay-border pb-4 sm:pb-5">
          <PracticeListingKicker section="Calendar" />
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

        <main className="mt-5 min-w-0 sm:mt-6" aria-label="Calendar and diary">
          <AdvocateCalendar />
        </main>
      </div>
    </div>
  );
}
