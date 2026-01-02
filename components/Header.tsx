"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "../lib/supabaseBrowser";

export function Header() {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const supabase = supabaseBrowser();
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setIsAuthed(!!data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900 dark:from-blue-900 dark:via-blue-950 dark:to-slate-900 text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] px-4 py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between mb-4">
        <Link href="/" className="flex items-center gap-3" aria-label="Go to homepage">
           
          <div className="flex flex-col">
            <h1 className="font-bold text-lg leading-tight tracking-tight text-white drop-shadow-sm">
              Intellibus Tele-Medicine
            </h1>
          </div>
        </Link>
        <button className="md:hidden text-white/80 hover:text-white transition-colors" aria-label="Menu">
          <span className="material-icons-outlined">more_vert</span>
        </button>
      </div>

      {isAuthed && (
        <nav className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar" aria-label="Primary">
          <Link
            href="/dashboard"
            className="flex-shrink-0 bg-white hover:bg-blue-50 text-blue-900 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 font-semibold text-sm px-4 py-2 rounded-xl shadow-sm transition-all duration-200 active:scale-95 flex items-center gap-2"
          >
            Dashboard
          </Link>
          <Link
            href="/patients/new"
            className="flex-shrink-0 bg-white hover:bg-blue-50 text-blue-900 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 font-semibold text-sm px-4 py-2 rounded-xl shadow-sm transition-all duration-200 active:scale-95 flex items-center gap-2"
          >
            New Patient
          </Link>
          <SignOut />
        </nav>
      )}

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </header>
  );
}

function SignOut() {
  const [loading, setLoading] = useState(false);
  const supabase = supabaseBrowser();

  const onSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    window.location.href = "/";
  };

  return (
    <button
      onClick={onSignOut}
      disabled={loading}
      className="flex-shrink-0 bg-white hover:bg-blue-50 text-blue-900 font-semibold text-sm px-4 py-2 rounded-xl shadow-sm transition-all duration-200 active:scale-95 ml-auto flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none"
    >
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}
