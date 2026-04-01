"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatDateTime, formatRelativeDate } from "@/lib/utils";
import { FlagBadge, PatientStatusBadge } from "@/components/status-badge";

interface DashboardData {
  stats: {
    totalPatients: number;
    callsToday: number;
    openEscalations: number;
    escalatedPatients: number;
    pendingCalls: number;
  };
  recentEscalations: any[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });

    // Poll for escalations every 30s
    const interval = setInterval(() => {
      fetch("/api/dashboard")
        .then((r) => r.json())
        .then(setData);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const stats = data?.stats;
  const escalations = data?.recentEscalations || [];

  return (
    <div style={{ padding: "32px 36px", fontFamily: "var(--font-body)" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "var(--color-green)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          Clinical Dashboard
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.8rem",
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
            marginBottom: "4px",
          }}
        >
          Good {getTimeOfDay()},{" "}
          <span style={{ color: "var(--color-green)" }}>
            {session?.user?.name?.split(" ")[0]}
          </span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Alert banner if escalations exist */}
      {!loading && escalations.length > 0 && (
        <div
          style={{
            background: "rgba(255,51,102,0.08)",
            border: "1px solid rgba(255,51,102,0.3)",
            borderRadius: "8px",
            padding: "14px 20px",
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "1rem",
                color: "var(--color-red)",
                animation: "alertPulse 2s ease-in-out infinite",
              }}
            >
              ⚑
            </span>
            <div>
              <p style={{ color: "var(--color-red)", fontWeight: "600", fontSize: "0.875rem" }}>
                {escalations.length} patient{escalations.length > 1 ? "s" : ""} require{escalations.length === 1 ? "s" : ""} immediate attention
              </p>
              <p style={{ color: "rgba(255,51,102,0.7)", fontSize: "0.8rem" }}>
                Red-flag symptoms detected — human callback required
              </p>
            </div>
          </div>
          <Link
            href="/escalations"
            style={{
              padding: "7px 16px",
              background: "rgba(255,51,102,0.15)",
              border: "1px solid rgba(255,51,102,0.4)",
              borderRadius: "6px",
              color: "var(--color-red)",
              textDecoration: "none",
              fontSize: "0.8rem",
              fontWeight: "600",
              whiteSpace: "nowrap",
            }}
          >
            View Escalations →
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <StatCard
          label="Total Patients"
          value={loading ? null : stats?.totalPatients ?? 0}
          icon="⬡"
          color="var(--color-green)"
          href="/patients"
        />
        <StatCard
          label="Calls Today"
          value={loading ? null : stats?.callsToday ?? 0}
          icon="◎"
          color="#38bdf8"
          href="/patients"
        />
        <StatCard
          label="Open Escalations"
          value={loading ? null : stats?.openEscalations ?? 0}
          icon="⚑"
          color={stats?.openEscalations ? "var(--color-red)" : "var(--color-green)"}
          href="/escalations"
          urgent={!!stats?.openEscalations}
        />
        <StatCard
          label="Overdue Calls"
          value={loading ? null : stats?.pendingCalls ?? 0}
          icon="⏱"
          color={stats?.pendingCalls ? "var(--color-amber)" : "var(--color-green)"}
          href="/patients"
        />
      </div>

      {/* Two-column bottom section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px" }}>
        {/* Escalation queue */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "18px 20px",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h2 style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-primary)" }}>
                Active Escalations
              </h2>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Patients requiring immediate callback
              </p>
            </div>
            <Link
              href="/escalations"
              style={{ fontSize: "0.75rem", color: "var(--color-green)", textDecoration: "none" }}
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: "20px" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: "60px", marginBottom: "8px" }} />
              ))}
            </div>
          ) : escalations.length === 0 ? (
            <div
              style={{
                padding: "48px 20px",
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>✓</div>
              <p style={{ fontSize: "0.875rem", color: "var(--color-green)", fontWeight: "500" }}>
                No active escalations
              </p>
              <p style={{ fontSize: "0.8rem", marginTop: "4px" }}>All patients are stable</p>
            </div>
          ) : (
            <div>
              {escalations.map((esc: any, i: number) => (
                <EscalationRow key={esc.id} escalation={esc} isLast={i === escalations.length - 1} />
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <h2 style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "16px" }}>
            Quick Actions
          </h2>

          <div style={{ display: "grid", gap: "10px" }}>
            <ActionCard
              href="/patients/new"
              icon="+"
              title="Enroll Patient"
              desc="Add newly discharged patient"
              color="var(--color-green)"
            />
            <ActionCard
              href="/simulator"
              icon="◎"
              title="Run Simulator"
              desc="Test AI call flow"
              color="#38bdf8"
            />
            <ActionCard
              href="/patients"
              icon="⬡"
              title="Patient List"
              desc="View all patients"
              color="#a78bfa"
            />
            <ActionCard
              href="/analytics"
              icon="⬢"
              title="Analytics"
              desc="Readmission metrics"
              color="var(--color-amber)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function StatCard({
  label,
  value,
  icon,
  color,
  href,
  urgent,
}: {
  label: string;
  value: number | null;
  icon: string;
  color: string;
  href: string;
  urgent?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          background: "var(--bg-surface)",
          border: urgent
            ? "1px solid rgba(255,51,102,0.4)"
            : "1px solid var(--border-color)",
          borderRadius: "10px",
          padding: "20px",
          cursor: "pointer",
          transition: "all 0.15s",
          boxShadow: urgent ? "0 0 20px rgba(255,51,102,0.1)" : undefined,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = color;
          (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px rgba(0,0,0,0.3)`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = urgent ? "rgba(255,51,102,0.4)" : "var(--border-color)";
          (e.currentTarget as HTMLElement).style.boxShadow = urgent ? "0 0 20px rgba(255,51,102,0.1)" : "";
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
          <span style={{ fontSize: "0.9rem", color: color }}>{icon}</span>
          {urgent && value !== null && value > 0 && (
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--color-red)",
                boxShadow: "0 0 8px rgba(255,51,102,0.6)",
                animation: "pulseRed 1.5s ease-in-out infinite",
              }}
            />
          )}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "2rem",
            fontWeight: "600",
            color: value === null ? "transparent" : color,
            lineHeight: 1,
            marginBottom: "6px",
          }}
        >
          {value === null ? (
            <div className="skeleton" style={{ width: "40px", height: "32px", borderRadius: "4px" }} />
          ) : (
            value
          )}
        </div>
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "500" }}>
          {label}
        </p>
      </div>
    </Link>
  );
}

function EscalationRow({ escalation, isLast }: { escalation: any; isLast: boolean }) {
  return (
    <Link
      href={`/patients/${escalation.patient.id}`}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          padding: "14px 20px",
          borderBottom: isLast ? "none" : "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          transition: "background 0.1s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: escalation.severity === "RED" ? "var(--color-red)" : "var(--color-amber)",
            flexShrink: 0,
            boxShadow:
              escalation.severity === "RED"
                ? "0 0 8px rgba(255,51,102,0.6)"
                : "0 0 8px rgba(245,158,11,0.6)",
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: "500" }}>
            {escalation.patient.name}
          </p>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.75rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {escalation.reason}
          </p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: escalation.severity === "RED" ? "var(--color-red)" : "var(--color-amber)",
              fontWeight: "600",
            }}
          >
            {escalation.severity}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
            {formatRelativeDate(escalation.createdAt)}
          </div>
        </div>
      </div>
    </Link>
  );
}

function ActionCard({
  href,
  icon,
  title,
  desc,
  color,
}: {
  href: string;
  icon: string;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px 14px",
          borderRadius: "8px",
          background: "var(--bg-surface-2)",
          border: "1px solid var(--border-subtle)",
          cursor: "pointer",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = color;
          (e.currentTarget as HTMLElement).style.background = `rgba(255,255,255,0.03)`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
          (e.currentTarget as HTMLElement).style.background = "var(--bg-surface-2)";
        }}
      >
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "8px",
            background: `rgba(${colorToRgb(color)}, 0.1)`,
            border: `1px solid rgba(${colorToRgb(color)}, 0.2)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1rem",
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div>
          <p style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: "500" }}>
            {title}
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{desc}</p>
        </div>
      </div>
    </Link>
  );
}

function colorToRgb(color: string): string {
  if (color.includes("green")) return "0,200,150";
  if (color.includes("red")) return "255,51,102";
  if (color.includes("amber")) return "245,158,11";
  if (color.includes("38bdf8")) return "56,189,248";
  if (color.includes("a78bfa")) return "167,139,250";
  return "255,255,255";
}
