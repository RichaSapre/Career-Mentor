import Link from "next/link";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function WelcomePage() {
  return (
    <main className="bg-gradient-soft min-h-screen flex flex-col items-center justify-center px-6 text-center">
      
      {/* Big Title */}
      <h1 className={`${playfair.className} text-6xl md:text-7xl font-semibold tracking-tight`}>
        Career Mentor
      </h1>

      <p className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl">
        Get personalized career recommendations and real-time market insights.
      </p>

      {/* Large Buttons */}
      <div className="mt-10 flex flex-col md:flex-row gap-6 w-full max-w-xl">
        <Link
          href="/login"
          className="flex-1 rounded-2xl bg-white text-[#070A18] py-4 text-lg font-semibold hover:opacity-90 transition"
        >
          Login
        </Link>

        <Link
          href="/signup"
          className="flex-1 rounded-2xl bg-white/15 py-4 text-lg font-semibold hover:bg-white/25 transition"
        >
          Register
        </Link>
      </div>

      {/* Secondary Link */}
      <div className="mt-8 text-base text-white/70">
        Want to explore without signing in?{" "}
        <Link href="/market" className="underline font-semibold">
          Market Analysis
        </Link>
      </div>

    </main>
  );
}