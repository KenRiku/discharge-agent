"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDateTime, formatRelativeDate, getProcedureIcon } from "@/lib/utils";

export default function EscalationsPage() {
  const [escalations, setEscalations] = useState<any[]>([]);
  const [resolved, setResolved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);

  const fetchEscalations = async () => {
    const [openRes, resolvedRes] = await Promise.all([
      fetch("/api/escalations"),
      fetch("/api/escalations?resolved=true"),
    ]);
    const openData = await openRes.json();
    const resolvedData = await resolvedRes.json();
    setEscalations(openData.escalations || []);
    setResolved(resolvedData.escalations || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEscalations();
    const interval = setInterval(fetchEscalations, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      await fetch(`/api/escalations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolve: true }),
      });
      await fetchEscalations();
    } finally {
      setResolvingId(null);
    }
  };

  const redEscalations = escalations.filter((e) => e.severity === "RED");
  const yellowEscalations = escalations.filter((e) => e.severity === "YELLOW");

  return (
    <div style={{ padding: "32px 36px", fontFamily: "var(--font-body)" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "var(--color-red)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          Clinical Escalations
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.8rem",
            color: "var(--text-primary)",
          }}
        >
          Escalation Queue
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "4px" }}>
          Patients requiring immediate human callback — auto-refreshes every 15 seconds
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
        <div
          style={{
            padding: "16px 20px",
            background: redEscalations.length > 0 ? "rgba(255,51,102,0.08)" : "var(--bg-surface)",
            border: `1px solid ${redEscalations.length > 0 ? "rgba(255,51,102,0.4)" : "var(--border-color)"}`,
            borderRadius: "8px",
            boxShadow: redEscalations.length > 0 ? "0 0 20px rgba(255,51,102,0.1)" : undefined,
          }}
        >
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--color-red)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
            ⚑ Red — Critical
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "2rem", fontWeight: "600", color: "var(--color-red)", lineHeight: 1 }}>
            {loading ? "—" : redEscalations.length}
          </p>
        </div>
        <div
          style={{
            padding: "16px 20px",
            background: yellowEscalations.length > 0 ? "rgba(245,158,11,0.06)" : "var(--bg-surface)",
            border: `1px solid ${yellowEscalations.length > 0 ? "rgba(245,158,11,0.3)" : "var(--border-color)"}`,
            borderRadius: "8px",
          }}
        >
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--color-amber)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
            △ Yellow — Watch
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "2rem", fontWeight: "600", color: "var(--color-amber)", lineHeight: 1 }}>
            {loading ? "—" : yellowEscalations.length}
          </p>
        </div>
        <div
          style={{
            padding: "16px 20px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
          }}
        >
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
            ✓ Resolved (all time)
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "2rem", fontWeight: "600", color: "var(--color-green)", lineHeight: 1 }}>
            {loading ? "—" : resolved.length}
          </p>
        </div>
      </div>

      {/* Open escalations */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: `1px solid ${escalations.length > 0 ? "rgba(255,51,102,0.3)" : "var(--border-color)"}`,
          borderRadius: "10px",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {escalations.length > 0 && (
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--color-red)",
                display: "inline-block",
                boxShadow: "0 0 8px rgba(255,51,102,0.6)",
                animation: "alertPulse 2s ease-in-out infinite",
              }}
            />
          )}
          <h2 style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-primary)" }}>
            Active Escalations ({escalations.length})
          </h2>
        </div>

        {loading ? (
          <div style={{ padding: "20px" }}>
            {[1, 2].map((i) => (
              <div key={i} className="skeleton" style={{ height: "80px", marginBottom: "8px", borderRadius: "8px" }} />
            ))}
          </div>
        ) : escalations.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>✓</div>
            <p style={{ color: "var(--color-green)", fontWeight: "600", fontSize: "0.95rem" }}>
              No active escalations
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "6px" }}>
              All patients are stable. Great work!
            </p>
          </div>
        ) : (
          <div>
            {escalations.map((esc, i) => (
              <EscalationCard
                key={esc.id}
                escalation={esc}
                onResolve={handleResolve}
                resolving={resolvingId === esc.id}
                isLast={i === escalations.length - 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resolved escalations */}
      {resolved.length > 0 && (
        <div>
          <button
            onClick={() => setShowResolved(!showResolved)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "0.8rem",
              cursor: "pointer",
              padding: "0 0 12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {showResolved ? "▲" : "▼"} {resolved.length} resolved escalation{resolved.length !== 1 ? "s" : ""}
          </button>

          {showResolved && (
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-color)",
                borderRadius: "10px",
                overflow: "hidden",
                opacity: 0.7,
              }}
            >
              {resolved.map((esc, i) => (
                <ResolvedRow key={esc.id} escalation={esc} isLast={i === resolved.length - 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EscalationCard({
  escalation,
  onResolve,
  resolving,
  isLast,
}: {
  escalation: any;
  onResolve: (id: string) => void;
  resolving: boolean;
  isLast: boolean;
}) {
  const isRed = escalation.severity === "RED";

  return (
    <div
      style={{
        padding: "20px",
        borderBottom: isLast ? "none" : "1px solid var(--border-subtle)",
        background: isRed ? "rgba(255,51,102,0.02)" : "rgba(245,158,11,0.02)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
        {/* Severity indicator */}
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "8px",
            background: isRed ? "rgba(255,51,102,0.1)" : "rgba(245,158,11,0.1)",
            border: `1px solid ${isRed ? "rgba(255,51,102,0.4)" : "rgba(245,158,11,0.4)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.1rem",
            flexShrink: 0,
            color: isRed ? "var(--color-red)" : "var(--color-amber)",
          }}
        >
          {isRed ? "⚑" : "△"}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <Link
              href={`/patients/${escalation.patient.id}`}
              style={{ color: "var(--text-primary)", fontWeight: "600", fontSize: "0.95rem", textDecoration: "none" }}
            >
              {escalation.patient.name}
            </Link>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                padding: "2px 8px",
                borderRadius: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: "600",
                color: isRed ? "var(--color-red)" : "var(--color-amber)",
                background: isRed ? "rgba(255,51,102,0.1)" : "rgba(245,158,11,0.1)",
                border: `1px solid ${isRed ? "rgba(255,51,102,0.3)" : "rgba(245,158,11,0.3)"}`,
              }}
            >
              {escalation.severity}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.9rem" }}>{getProcedureIcon(escalation.patient.procedureType)}</span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
              {escalation.patient.procedureType} · {escalation.patient.phone}
            </span>
          </div>

          <div
            style={{
              padding: "10px 14px",
              background: isRed ? "rgba(255,51,102,0.06)" : "rgba(245,158,11,0.06)",
              border: `1px solid ${isRed ? "rgba(255,51,102,0.2)" : "rgba(245,158,11,0.2)"}`,
              borderRadius: "6px",
              marginBottom: "10px",
            }}
          >
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: "1.5" }}>
              {escalation.reason}
            </p>
          </div>

          {escalation.call?.summary && (
            <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: "12px" }}>
              {escalation.call.summary}
            </p>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => onResolve(escalation.id)}
              disabled={resolving}
              className="btn-primary"
              style={{ fontSize: "0.8rem", padding: "7px 16px" }}
            >
              {resolving ? "Resolving..." : "✓ Mark Contacted"}
            </button>
            <Link
              href={`/patients/${escalation.patient.id}`}
              className="btn-secondary"
              style={{ fontSize: "0.8rem", padding: "6px 14px" }}
            >
              Patient Record →
            </Link>
            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginLeft: "auto" }}>
              {formatRelativeDate(escalation.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResolvedRow({ escalation, isLast }: { escalation: any; isLast: boolean }) {
  return (
    <div
      style={{
        padding: "14px 20px",
        borderBottom: isLast ? "none" : "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <span style={{ color: "var(--color-green)", fontSize: "0.9rem", flexShrink: 0 }}>✓</span>
      <div style={{ flex: 1 }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: "500" }}>
          {escalation.patient.name}
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
          {escalation.reason} · Resolved by {escalation.resolvedBy?.name || "staff"}
        </p>
      </div>
      <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", flexShrink: 0 }}>
        {formatRelativeDate(escalation.resolvedAt)}
      </span>
    </div>
  );
}
