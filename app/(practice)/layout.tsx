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
      <div className="min-h-0 flex-1 nyay-page-x">{children}</div>
      <PracticeQuickAddFab />
    </div>
  );
}
