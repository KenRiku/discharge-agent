"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate, formatDateTime, formatRelativeDate, getProcedureIcon } from "@/lib/utils";
import { FlagBadge, PatientStatusBadge } from "@/components/status-badge";

export default function PatientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCall, setExpandedCall] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/patients/${id}`)
      .then((r) => {
        if (!r.ok) {
          router.push("/patients");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) {
          setPatient(d.patient);
          setLoading(false);
        }
      });
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: "32px 36px" }}>
        <div className="skeleton" style={{ width: "200px", height: "20px", marginBottom: "16px" }} />
        <div className="skeleton" style={{ width: "320px", height: "40px", marginBottom: "32px" }} />
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
          <div className="skeleton" style={{ height: "300px", borderRadius: "10px" }} />
          <div className="skeleton" style={{ height: "300px", borderRadius: "10px" }} />
        </div>
      </div>
    );
  }

  if (!patient) return null;

  const openEscalations = patient.escalations?.filter((e: any) => !e.resolvedAt) || [];

  return (
    <div style={{ padding: "32px 36px", fontFamily: "var(--font-body)" }}>
      {/* Back nav */}
      <Link
        href="/patients"
        style={{ color: "var(--text-muted)", fontSize: "0.8rem", textDecoration: "none" }}
      >
        ← Back to Patients
      </Link>

      {/* Patient header */}
      <div style={{ marginTop: "20px", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
              <span style={{ fontSize: "1.5rem" }}>{getProcedureIcon(patient.procedureType)}</span>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2rem",
                  color: "var(--text-primary)",
                  letterSpacing: "-0.01em",
                }}
              >
                {patient.name}
              </h1>
              <PatientStatusBadge status={patient.status} />
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              {patient.procedureType} · Discharged {formatDate(patient.dischargeDate)} · {patient.phone}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
            <Link
              href={`/simulator?patientId=${patient.id}`}
              className="btn-primary"
            >
              ◎ Simulate Call
            </Link>
          </div>
        </div>

        {/* Open escalation alert */}
        {openEscalations.length > 0 && (
          <div
            style={{
              marginTop: "16px",
              background: "rgba(255,51,102,0.08)",
              border: "1px solid rgba(255,51,102,0.3)",
              borderRadius: "8px",
              padding: "12px 16px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            <span style={{ color: "var(--color-red)", fontSize: "1rem", flexShrink: 0 }}>⚑</span>
            <div style={{ flex: 1 }}>
              <p style={{ color: "var(--color-red)", fontWeight: "600", fontSize: "0.875rem" }}>
                Active Escalation — Human callback required
              </p>
              {openEscalations.map((esc: any) => (
                <p key={esc.id} style={{ color: "rgba(255,51,102,0.8)", fontSize: "0.8rem", marginTop: "2px" }}>
                  {esc.reason} · {formatRelativeDate(esc.createdAt)}
                </p>
              ))}
            </div>
            <Link href="/escalations" style={{ color: "var(--color-red)", fontSize: "0.8rem", textDecoration: "none", flexShrink: 0 }}>
              Manage →
            </Link>
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 340px", gap: "20px" }}>
        {/* Left: Timeline */}
        <div>
          {/* Call schedules */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-color)",
              borderRadius: "10px",
              overflow: "hidden",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                padding: "18px 20px",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <h2 style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-primary)" }}>
                Follow-up Schedule
              </h2>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Automated AI check-in calls
              </p>
            </div>

            <div style={{ padding: "8px 0" }}>
              {patient.callSchedules.map((schedule: any) => (
                <ScheduleRow key={schedule.id} schedule={schedule} patient={patient} />
              ))}
            </div>
          </div>

          {/* Completed calls */}
          {patient.calls && patient.calls.length > 0 && (
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
                }}
              >
                <h2 style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-primary)" }}>
                  Call History
                </h2>
              </div>

              <div>
                {patient.calls.map((call: any, i: number) => (
                  <CallHistoryRow
                    key={call.id}
                    call={call}
                    expanded={expandedCall === call.id}
                    onToggle={() => setExpandedCall(expandedCall === call.id ? null : call.id)}
                    isLast={i === patient.calls.length - 1}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Patient info */}
        <div>
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-color)",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "16px" }}>
              Patient Details
            </h3>

            <InfoRow label="Date of Birth" value={formatDate(patient.dob)} />
            <InfoRow label="Phone" value={patient.phone} />
            <InfoRow label="Procedure" value={patient.procedureType} />
            <InfoRow label="Discharge Date" value={formatDate(patient.dischargeDate)} />
            <InfoRow label="Enrolled By" value={`${patient.enrolledBy?.name}`} />
            <InfoRow label="Enrolled" value={formatRelativeDate(patient.createdAt)} />

            {patient.notes && (
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)" }}>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Notes</p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>{patient.notes}</p>
              </div>
            )}
          </div>

          {/* Latest metrics */}
          {patient.calls && patient.calls.length > 0 && (
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-color)",
                borderRadius: "10px",
                padding: "20px",
              }}
            >
              <h3 style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "16px" }}>
                Latest Call Metrics
              </h3>
              <LatestMetrics call={patient.calls[0]} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScheduleRow({ schedule, patient }: { schedule: any; patient: any }) {
  const isCompleted = schedule.status === "COMPLETED";
  const isPending = schedule.status === "PENDING";
  const date = new Date(schedule.scheduledDate);
  const isPast = date < new Date();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "12px 20px",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      {/* Day indicator */}
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "8px",
          border: `1px solid ${isCompleted ? "rgba(0,200,150,0.3)" : isPast ? "rgba(255,51,102,0.3)" : "var(--border-color)"}`,
          background: isCompleted ? "rgba(0,200,150,0.08)" : isPast ? "rgba(255,51,102,0.06)" : "var(--bg-surface-2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Day
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "1rem",
            fontWeight: "600",
            color: isCompleted ? "var(--color-green)" : isPast ? "var(--color-red)" : "var(--text-primary)",
            lineHeight: 1,
          }}
        >
          {schedule.scheduledDay}
        </span>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
          <p style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: "500" }}>
            {formatDate(schedule.scheduledDate)}
          </p>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              padding: "2px 7px",
              borderRadius: "4px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: "500",
              color: isCompleted ? "var(--color-green)" : isPast ? "var(--color-red)" : "#38bdf8",
              background: isCompleted ? "rgba(0,200,150,0.08)" : isPast ? "rgba(255,51,102,0.08)" : "rgba(56,189,248,0.08)",
              border: `1px solid ${isCompleted ? "rgba(0,200,150,0.2)" : isPast ? "rgba(255,51,102,0.2)" : "rgba(56,189,248,0.2)"}`,
            }}
          >
            {isCompleted ? "✓ Done" : isPast ? "Overdue" : "Scheduled"}
          </span>
        </div>
        {schedule.call && (
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Pain: {schedule.call.painScore ?? "—"}/10 · Meds:{" "}
            {schedule.call.medAdherence === null
              ? "—"
              : schedule.call.medAdherence
              ? "✓ Compliant"
              : "✗ Non-compliant"}
          </p>
        )}
      </div>

      {isPending && (
        <Link
          href={`/simulator?patientId=${patient.id}&scheduleId=${schedule.id}`}
          style={{
            padding: "6px 14px",
            borderRadius: "6px",
            background: "rgba(0,200,150,0.08)",
            border: "1px solid rgba(0,200,150,0.2)",
            color: "var(--color-green)",
            textDecoration: "none",
            fontSize: "0.78rem",
            fontWeight: "500",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Start Call
        </Link>
      )}
    </div>
  );
}

function CallHistoryRow({
  call,
  expanded,
  onToggle,
  isLast,
}: {
  call: any;
  expanded: boolean;
  onToggle: () => void;
  isLast: boolean;
}) {
  return (
    <div style={{ borderBottom: isLast ? "none" : "1px solid var(--border-subtle)" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          transition: "background 0.1s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
            <span style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: "500" }}>
              {formatDateTime(call.completedAt || call.startedAt)}
            </span>
            <FlagBadge flagStatus={call.flagStatus} />
          </div>
          {call.summary && (
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", lineHeight: "1.4" }}>
              {call.summary}
            </p>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
          {call.painScore !== null && (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Pain</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", fontWeight: "600", color: getPainColor(call.painScore), lineHeight: 1 }}>
                {call.painScore}
              </p>
            </div>
          )}
          <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            {expanded ? "▲" : "▼"}
          </span>
        </div>
      </button>

      {expanded && (
        <div
          style={{
            padding: "0 20px 20px",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "16px",
              marginTop: "16px",
            }}
          >
            Call Transcript
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {Array.isArray(call.transcript) &&
              call.transcript.map((msg: any, i: number) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: msg.role === "agent" ? "flex-start" : "flex-end",
                  }}
                >
                  <div className={msg.role === "agent" ? "chat-agent" : "chat-patient"}>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                      {msg.role === "agent" ? "AfterCall AI" : "Patient"}
                    </p>
                    {msg.content}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "12px",
        paddingBottom: "10px",
        marginBottom: "10px",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", flexShrink: 0 }}>{label}</span>
      <span style={{ color: "var(--text-primary)", fontSize: "0.8rem", textAlign: "right" }}>{value}</span>
    </div>
  );
}

function LatestMetrics({ call }: { call: any }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
      <div
        style={{
          padding: "12px",
          background: "var(--bg-surface-2)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>Pain Score</p>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "1.8rem", fontWeight: "600", lineHeight: 1, color: getPainColor(call.painScore) }}>
          {call.painScore ?? "—"}
        </p>
        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>/10</p>
      </div>
      <div
        style={{
          padding: "12px",
          background: "var(--bg-surface-2)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>Medications</p>
        <p style={{ fontSize: "1.1rem", lineHeight: 1, marginBottom: "4px", color: call.medAdherence ? "var(--color-green)" : "var(--color-red)" }}>
          {call.medAdherence === null ? "—" : call.medAdherence ? "✓" : "✗"}
        </p>
        <p style={{ fontSize: "0.7rem", color: call.medAdherence === null ? "var(--text-muted)" : call.medAdherence ? "var(--color-green)" : "var(--color-red)" }}>
          {call.medAdherence === null ? "Unknown" : call.medAdherence ? "Compliant" : "Non-compliant"}
        </p>
      </div>
    </div>
  );
}

function getPainColor(score: number | null): string {
  if (score === null) return "var(--text-muted)";
  if (score >= 8) return "var(--color-red)";
  if (score >= 5) return "var(--color-amber)";
  return "var(--color-green)";
}
