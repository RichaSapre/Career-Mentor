import { SideNav } from "@/components/nav/SideNav";


export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gradient-soft min-h-screen flex flex-col md:flex-row">
      <SideNav />
      <main className="flex-1 p-6 md:p-8 pt-20 md:pt-8 overflow-y-auto w-full">
        <div className="w-full flex flex-col gap-6">{children}</div>
      </main>
    </div>
  );
}