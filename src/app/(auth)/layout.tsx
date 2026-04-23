export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-gradient-soft min-h-screen px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </main>
  );
  
}
