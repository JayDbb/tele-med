"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { login, signup } from "../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "signin") {
        await login(email, password);
        router.push("/dashboard");
      } else {
        await signup(email, password);
        setSignupSuccess(true);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (signupSuccess) {
    return (
      <main className="shell fade-in">
        <div className="card" style={{ maxWidth: 420, margin: "24px auto" }}>
          <h1 style={{ marginBottom: 8 }}>Check your email</h1>
          <div className="stack">
            <div className="pill" style={{ background: "#d1fae5", color: "#065f46" }}>
              ✓ Account created successfully
            </div>
            <p style={{ color: "#475569", marginTop: 0 }}>
              We've sent a verification link to <strong>{email}</strong>. Please check your email and click the link to verify your account before signing in.
            </p>
            <button
              className="button secondary"
              onClick={() => {
                setSignupSuccess(false);
                setMode("signin");
                setEmail("");
                setPassword("");
              }}
            >
              Back to sign in
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="shell fade-in">
      <div className="card" style={{ maxWidth: 420, margin: "24px auto" }}>
        <h1 style={{ marginBottom: 8 }}>Sign in</h1>
        <p style={{ color: "#475569", marginTop: 0 }}>
          Secure access to your TeleHealth dashboard.
        </p>
        <form className="stack" onSubmit={onSubmit}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className={`button ${mode === "signin" ? "" : "secondary"}`}
              onClick={() => setMode("signin")}
              disabled={loading}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`button success ${mode === "signup" ? "" : "secondary"}`}
              onClick={() => setMode("signup")}
              disabled={loading}
            >
              Sign up
            </button>
          </div>
          <label className="stack">
            <span className="label">Email</span>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label className="stack">
            <span className="label">Password</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && (
            <div className="pill" style={{ background: "#fef2f2", color: "#b91c1c" }}>
              {error}
            </div>
          )}
          <button 
            className={mode === "signup" ? "button success" : "button"} 
            type="submit" 
            disabled={loading}
          >
            {loading
              ? mode === "signin"
                ? "Signing in..."
                : "Creating account..."
              : mode === "signin"
              ? "Sign in"
              : "Create account"}
          </button>
        </form>
      </div>
    </main>
  );
}

