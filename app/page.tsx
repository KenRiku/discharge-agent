import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If user is logged in, go to dashboard
  if (session) {
    redirect("/dashboard");
  }

  // Show public landing page for unauthenticated users
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-base)",
        backgroundImage: `
          radial-gradient(ellipse at 30% 20%, rgba(0,200,150,0.06) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, rgba(59,130,246,0.06) 0%, transparent 50%)
        `,
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

      {/* Header */}
      <header style={{ padding: "20px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
                fontSize: "1.5rem",
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              AfterCall
            </h1>
          </div>

          <nav style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <Link
              href="/login"
              style={{
                padding: "8px 20px",
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontSize: "0.9rem",
                borderRadius: "6px",
                transition: "all 0.2s",
              }}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              style={{
                padding: "8px 20px",
                background: "var(--color-green)",
                color: "#020810",
                textDecoration: "none",
                fontSize: "0.9rem",
                borderRadius: "6px",
                fontWeight: "600",
                boxShadow: "0 0 20px rgba(0,200,150,0.2)",
                transition: "all 0.2s",
              }}
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", padding: "40px 20px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              color: "var(--color-green)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            AI-Powered Healthcare Follow-Up
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              color: "var(--text-primary)",
              lineHeight: "1.1",
              margin: "0 0 24px 0",
              letterSpacing: "-0.02em",
            }}
          >
            Automated Post-Discharge<br />
            <span style={{ color: "var(--color-green)" }}>Patient Care</span>
          </h1>

          <p
            style={{
              fontSize: "1.2rem",
              color: "var(--text-secondary)",
              lineHeight: "1.6",
              maxWidth: "600px",
              margin: "0 auto 40px auto",
            }}
          >
            AfterCall conducts structured follow-up calls with discharged patients,
            detecting complications early and escalating red flags to clinical staff automatically.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            <Link
              href="/signup"
              style={{
                display: "inline-block",
                padding: "12px 32px",
                background: "var(--color-green)",
                color: "#020810",
                textDecoration: "none",
                fontSize: "1rem",
                fontWeight: "600",
                borderRadius: "8px",
                boxShadow: "0 0 30px rgba(0,200,150,0.3)",
                transition: "all 0.2s",
              }}
            >
              Start Free Trial
            </Link>

            <Link
              href="/login"
              style={{
                display: "inline-block",
                padding: "12px 32px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
                textDecoration: "none",
                fontSize: "1rem",
                borderRadius: "8px",
                transition: "all 0.2s",
              }}
            >
              Demo Login
            </Link>
          </div>

          {/* Demo credentials callout */}
          <div
            style={{
              marginTop: "40px",
              display: "inline-block",
              background: "rgba(0,200,150,0.04)",
              border: "1px solid rgba(0,200,150,0.15)",
              borderRadius: "8px",
              padding: "16px 24px",
              textAlign: "left",
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
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--text-secondary)", margin: "2px 0" }}>
              Email: admin@aftercall.app
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--text-muted)", margin: "2px 0" }}>
              Password: Demo@AfterCall2024
            </p>
          </div>
        </div>
      </main>

      {/* Features */}
      <section style={{ padding: "60px 20px", background: "rgba(0,0,0,0.1)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem",
              color: "var(--text-primary)",
              textAlign: "center",
              marginBottom: "40px",
            }}
          >
            How It Works
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px" }}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  background: "var(--color-blue)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  color: "#020810",
                  margin: "0 auto 16px",
                  boxShadow: "0 0 20px rgba(59,130,246,0.2)",
                }}
              >
                📞
              </div>
              <h3 style={{ color: "var(--text-primary)", marginBottom: "12px" }}>Automated Calls</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.5" }}>
                AI conducts structured follow-up calls at 1, 3, and 7 days post-discharge
              </p>
            </div>

            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  background: "var(--color-green)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  color: "#020810",
                  margin: "0 auto 16px",
                  boxShadow: "0 0 20px rgba(0,200,150,0.2)",
                }}
              >
                🏥
              </div>
              <h3 style={{ color: "var(--text-primary)", marginBottom: "12px" }}>Clinical Intelligence</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.5" }}>
                Detects red flags and complications using procedure-specific protocols
              </p>
            </div>

            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  background: "var(--color-red)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  color: "#020810",
                  margin: "0 auto 16px",
                  boxShadow: "0 0 20px rgba(255,51,102,0.2)",
                }}
              >
                ⚡
              </div>
              <h3 style={{ color: "var(--text-primary)", marginBottom: "12px" }}>Instant Escalation</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.5" }}>
                Automatically alerts clinical staff when intervention is needed
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}