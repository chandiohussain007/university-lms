import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen" style={{ background: '#F8FAFC' }}>
      <Sidebar role="ADMIN" />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Admin Portal" subtitle="System Administration & Academic Operations" />
        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
