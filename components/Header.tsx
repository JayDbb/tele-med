"use client";

import Link from "next/link";
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
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="header shell">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className="pill">Phase 1</div>
        <div style={{ fontWeight: 700, fontSize: 18 }}>TeleHealth MVP</div>
      </div>
      {isAuthed && (
        <nav className="nav">
          <Link href="/dashboard" className="button secondary">
            Dashboard
          </Link>
          <Link href="/patients/new" className="button secondary">
            New Patient
          </Link>
          <SignOut />
        </nav>
      )}
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
    <button className="button secondary" onClick={onSignOut} disabled={loading}>
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}

