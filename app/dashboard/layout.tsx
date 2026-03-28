import { DashboardHeader } from "./dashboard-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="nyay-dashboard-shell flex min-h-0 flex-1 flex-col">
      <DashboardHeader />
      <div className="flex-1">{children}</div>
    </div>
  );
}
