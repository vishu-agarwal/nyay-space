import { PracticeQuickAddFab } from "@/components/practice/quick-add-fab";
import { PracticeHeader } from "@/components/practice/practice-header";
import { PracticeBreadcrumbs } from "@/components/practice/practice-breadcrumbs";

export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="nyay-dashboard-shell flex min-h-0 flex-1 flex-col">
      <PracticeHeader />
      <div className="min-h-0 flex-1 overflow-y-auto nyay-page-x">
        <div className="mx-auto max-w-7xl nyay-page-y">
          <PracticeBreadcrumbs />
          {children}
        </div>
      </div>
      <PracticeQuickAddFab />
    </div>
  );
}
