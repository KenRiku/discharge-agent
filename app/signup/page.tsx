"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const roles = [
  { value: "NURSE", label: "Nurse" },
  { value: "COORDINATOR", label: "Discharge Coordinator" },
  { value: "ADMIN", label: "Administrator" },
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "NURSE",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Sign-up failed");
        setLoading(false);
        return;
      }

      // Sign in automatically after signup
      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Account created. Please sign in.");
        router.push("/login");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
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

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                background: "var(--color-green)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                color: "#020810",
                boxShadow: "0 0 20px rgba(0,200,150,0.3)",
              }}
            >
              ⊕
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.75rem",
                color: "var(--text-primary)",
              }}
            >
              AfterCall
            </h1>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Create your clinical account
          </p>
        </div>

        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            padding: "32px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}
        >
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: "600",
              color: "var(--text-primary)",
              marginBottom: "20px",
            }}
          >
            New Account
          </h2>

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
              }}
            >
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "5px", fontWeight: "500" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Dr. Jane Smith"
                  required
                  className="input-field"
                  autoComplete="name"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "5px", fontWeight: "500" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@hospital.org"
                  required
                  className="input-field"
                  autoComplete="email"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "5px", fontWeight: "500" }}>
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="input-field"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "5px", fontWeight: "500" }}>
                  Role
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="input-field"
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: "100%", padding: "11px", marginTop: "6px" }}
              >
                {loading ? "Creating account..." : "Create Account →"}
              </button>
            </div>
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
              Already have an account?{" "}
              <Link href="/login" style={{ color: "var(--color-green)", textDecoration: "none", fontWeight: "500" }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
