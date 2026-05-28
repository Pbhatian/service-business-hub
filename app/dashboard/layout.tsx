import { Sidebar } from "@/components/shared/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen aurora-bg bg-grid-pattern">
      <Sidebar />
      <main className="ml-64 flex-1 min-h-screen">{children}</main>
    </div>
  );
}
