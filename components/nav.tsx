"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "◈" },
  { href: "/patients", label: "Patients", icon: "⬡" },
  { href: "/escalations", label: "Escalations", icon: "⚠" },
  { href: "/simulator", label: "Simulator", icon: "◎" },
  { href: "/analytics", label: "Analytics", icon: "⬢" },
];

export function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <nav
      style={{
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border-color)",
        width: "220px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "0",
        flexShrink: 0,
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "24px 20px 20px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              background: "var(--color-green)",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              color: "#020810",
              fontWeight: "700",
              flexShrink: 0,
            }}
          >
            ⊕
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.25rem",
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            AfterCall
          </span>
        </div>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            color: "var(--color-green)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginLeft: "38px",
          }}
        >
          Discharge AI
        </p>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, padding: "12px 10px" }}>
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const isEscalations = item.href === "/escalations";
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 10px",
                borderRadius: "6px",
                marginBottom: "2px",
                textDecoration: "none",
                background: active ? "rgba(0,200,150,0.08)" : "transparent",
                border: active ? "1px solid rgba(0,200,150,0.2)" : "1px solid transparent",
                color: active ? "var(--color-green)" : "var(--text-muted)",
                fontSize: "0.85rem",
                fontWeight: active ? "600" : "400",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-muted)";
                }
              }}
            >
              <span
                style={{
                  fontSize: "0.9rem",
                  width: "18px",
                  textAlign: "center",
                  color: isEscalations ? "var(--color-red)" : "inherit",
                }}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* User info + logout */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ marginBottom: "12px" }}>
          <p
            style={{
              color: "var(--text-primary)",
              fontSize: "0.8rem",
              fontWeight: "600",
              marginBottom: "2px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {session?.user?.name}
          </p>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              color: "var(--color-green)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {(session?.user as any)?.role}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="btn-secondary"
          style={{ width: "100%", fontSize: "0.8rem", padding: "7px 12px" }}
        >
          {signingOut ? "Signing out..." : "Sign Out"}
        </button>
      </div>
    </nav>
  );
}
