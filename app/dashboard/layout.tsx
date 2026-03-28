import { DashboardHeader } from "./dashboard-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="nyay-dashboard-shell flex min-h-full flex-col">
      <DashboardHeader />
      <div className="flex-1">{children}</div>
    </div>
  );
}
