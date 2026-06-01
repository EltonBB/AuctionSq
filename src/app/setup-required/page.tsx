import Link from "next/link";

export default function SetupRequiredPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-24 text-slate-100">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
        <h1 className="text-2xl font-black">Supabase Setup Required</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          This build runs in production mode only. Set valid Supabase environment variables and reload:
        </p>
        <pre className="mt-4 overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-blue-200">
{`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...`}
        </pre>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-blue-700"
        >
          Retry Home
        </Link>
      </div>
    </main>
  );
}
