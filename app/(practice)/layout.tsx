import { PracticeQuickAddFab } from "@/components/practice/quick-add-fab";
import { PracticeHeader } from "@/components/practice/practice-header";

export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="nyay-dashboard-shell flex min-h-0 flex-1 flex-col">
      <PracticeHeader />
      <div className="flex-1">{children}</div>
      <PracticeQuickAddFab />
    </div>
  );
}
