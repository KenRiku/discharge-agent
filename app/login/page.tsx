"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-base)",
        backgroundImage: `
          radial-gradient(ellipse at 30% 20%, rgba(0,200,150,0.06) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, rgba(59,130,246,0.06) 0%, transparent 50%)
        `,
        padding: "20px",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* Grid lines background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(26,51,102,0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26,51,102,0.2) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", maxWidth: "400px", position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                background: "var(--color-green)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                color: "#020810",
                fontWeight: "800",
                boxShadow: "0 0 30px rgba(0,200,150,0.3)",
              }}
            >
              ⊕
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2rem",
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              AfterCall
            </h1>
          </div>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              color: "var(--color-green)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            AI Discharge Follow-Up System
          </p>
        </div>

        {/* Login card */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            padding: "32px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset",
          }}
        >
          <h2
            style={{
              fontSize: "1.1rem",
              fontWeight: "600",
              color: "var(--text-primary)",
              marginBottom: "6px",
            }}
          >
            Sign In
          </h2>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              marginBottom: "24px",
            }}
          >
            Access your clinical dashboard
          </p>

          {error && (
            <div
              style={{
                background: "rgba(255,51,102,0.1)",
                border: "1px solid rgba(255,51,102,0.3)",
                borderRadius: "6px",
                padding: "10px 14px",
                marginBottom: "20px",
                color: "var(--color-red)",
                fontSize: "0.8rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: "500",
                  color: "var(--text-secondary)",
                  marginBottom: "6px",
                  letterSpacing: "0.04em",
                }}
              >
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@hospital.org"
                required
                className="input-field"
                autoComplete="email"
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: "500",
                  color: "var(--text-secondary)",
                  marginBottom: "6px",
                  letterSpacing: "0.04em",
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input-field"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: "100%", padding: "11px" }}
            >
              {loading ? (
                <span style={{ opacity: 0.7 }}>Signing in...</span>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: "20px",
              paddingTop: "20px",
              borderTop: "1px solid var(--border-subtle)",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              No account?{" "}
              <Link
                href="/signup"
                style={{ color: "var(--color-green)", textDecoration: "none", fontWeight: "500" }}
              >
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials */}
        <div
          style={{
            marginTop: "16px",
            background: "rgba(0,200,150,0.04)",
            border: "1px solid rgba(0,200,150,0.15)",
            borderRadius: "8px",
            padding: "12px 16px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              color: "var(--color-green)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Demo Credentials
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            admin@aftercall.app
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Demo@AfterCall2024
          </p>
        </div>
      </div>
    </div>
  );
}
