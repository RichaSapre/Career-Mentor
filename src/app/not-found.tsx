import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="bg-gradient-soft min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md space-y-6">
        <h1 className="text-6xl font-bold text-heading">404</h1>
        <p className="text-lg text-muted">
          This page could not be found.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/welcome"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-btn-primary-bg text-btn-primary-text px-6 py-3 font-semibold hover:bg-btn-primary-hover transition-all"
          >
            <Home className="w-4 h-4" />
            Go to Home
          </Link>
          <Link
            href="/market"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 font-semibold text-body hover:border-border-hover transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Explore Market
          </Link>
        </div>
      </div>
    </main>
  );
}
