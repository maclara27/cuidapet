import { BottomNav } from "@/components/bottom-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col justify-between pb-20">
      <main className="flex-1 flex flex-col">{children}</main>
      <BottomNav />
    </div>
  );
}

