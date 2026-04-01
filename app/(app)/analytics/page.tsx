"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatDateTime } from "@/lib/utils";
import { FlagBadge } from "@/components/status-badge";

const STATUS_COLORS: Record<string, string> = {
  ENROLLED: "#38bdf8",
  IN_PROGRESS: "#f59e0b",
  COMPLETED: "#00c896",
  ESCALATED: "#ff3366",
};

const PROCEDURE_COLORS = ["#00c896", "#38bdf8", "#a78bfa", "#f59e0b", "#ff6b6b"];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "32px 36px" }}>
        <div className="skeleton" style={{ width: "200px", height: "20px", marginBottom: "12px" }} />
        <div className="skeleton" style={{ width: "300px", height: "40px", marginBottom: "32px" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: "100px", borderRadius: "10px" }} />
          ))}
        </div>
      </div>
    );
  }

  const { summary, patientsByStatus, callsTimeline, escalationsBySeverity, procedureBreakdown, recentCalls } = data;

  return (
    <div style={{ padding: "32px 36px", fontFamily: "var(--font-body)" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
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
          Clinical Analytics
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.8rem",
            color: "var(--text-primary)",
          }}
        >
          Readmission Analytics
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "4px" }}>
          Program performance and patient outcomes
        </p>
      </div>

      {/* Key metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <MetricCard label="Total Patients" value={summary.totalPatients} color="var(--color-green)" suffix="" />
        <MetricCard label="Calls Completed" value={summary.completedCalls} color="#38bdf8" />
        <MetricCard
          label="Escalation Rate"
          value={summary.escalationRate}
          color={summary.escalationRate > 20 ? "var(--color-red)" : "var(--color-amber)"}
          suffix="%"
        />
        <MetricCard
          label="Program Completion"
          value={summary.completionRate}
          color="var(--color-green)"
          suffix="%"
        />
        <MetricCard
          label="Open Escalations"
          value={summary.openEscalations}
          color={summary.openEscalations > 0 ? "var(--color-red)" : "var(--color-green)"}
        />
      </div>

      {/* Charts row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "20px" }}>
        {/* Calls timeline */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <h3 style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "4px" }}>
            Call Activity (Last 14 Days)
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "20px" }}>
            Total calls vs escalations
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={callsTimeline} barSize={12} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,51,102,0.5)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-surface-2)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  color: "var(--text-primary)",
                  fontSize: "0.8rem",
                  fontFamily: "var(--font-mono)",
                }}
                cursor={{ fill: "rgba(255,255,255,0.02)" }}
              />
              <Bar dataKey="calls" fill="#00c896" radius={[3, 3, 0, 0]} name="Calls" />
              <Bar dataKey="escalations" fill="#ff3366" radius={[3, 3, 0, 0]} name="Escalations" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Patient status pie */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <h3 style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "4px" }}>
            Patient Status
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "16px" }}>
            Current distribution
          </p>
          {patientsByStatus.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={patientsByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {patientsByStatus.map((entry: any) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#5a7a9a"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-surface-2)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "6px",
                      color: "var(--text-primary)",
                      fontSize: "0.8rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
                {patientsByStatus.map((s: any) => (
                  <div key={s.status} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "2px",
                          background: STATUS_COLORS[s.status] || "#5a7a9a",
                          display: "inline-block",
                        }}
                      />
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        {s.status.replace("_", " ")}
                      </span>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-primary)", fontWeight: "600" }}>
                      {s.count}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              No patient data yet
            </div>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        {/* Procedure breakdown */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <h3 style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "4px" }}>
            Patients by Procedure
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "20px" }}>Volume breakdown</p>
          {procedureBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={procedureBreakdown} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,51,102,0.5)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="procedure" tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "var(--font-body)" }} axisLine={false} tickLine={false} width={120} />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-surface-2)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "6px",
                    color: "var(--text-primary)",
                    fontSize: "0.8rem",
                  }}
                  cursor={{ fill: "rgba(255,255,255,0.02)" }}
                />
                <Bar dataKey="count" radius={[0, 3, 3, 0]}>
                  {procedureBreakdown.map((_: any, i: number) => (
                    <Cell key={i} fill={PROCEDURE_COLORS[i % PROCEDURE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              No data yet
            </div>
          )}
        </div>

        {/* Escalation severity */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <h3 style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "4px" }}>
            Escalation Severity
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "20px" }}>All-time breakdown</p>
          {escalationsBySeverity.length > 0 ? (
            <div>
              {escalationsBySeverity.map((e: any) => {
                const total = escalationsBySeverity.reduce((sum: number, x: any) => sum + x.count, 0);
                const pct = Math.round((e.count / total) * 100);
                const color = e.severity === "RED" ? "var(--color-red)" : "var(--color-amber)";
                return (
                  <div key={e.severity} style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>
                        {e.severity === "RED" ? "⚑ Red — Critical" : "△ Yellow — Watch"}
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color, fontWeight: "600" }}>
                        {e.count} ({pct}%)
                      </span>
                    </div>
                    <div
                      style={{
                        height: "8px",
                        background: "var(--bg-surface-2)",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          background: color,
                          borderRadius: "4px",
                          transition: "width 1s ease-out",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              No escalations recorded yet
            </div>
          )}
        </div>
      </div>

      {/* Recent calls table */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-primary)" }}>
            Recent Calls
          </h3>
        </div>
        {recentCalls.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            No calls completed yet
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Procedure</th>
                <th>Pain Score</th>
                <th>Flag</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {recentCalls.map((call: any) => (
                <tr key={call.id}>
                  <td style={{ color: "var(--text-primary)", fontWeight: "500" }}>{call.patientName}</td>
                  <td>{call.procedureType}</td>
                  <td>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        color:
                          call.painScore === null
                            ? "var(--text-muted)"
                            : call.painScore >= 8
                            ? "var(--color-red)"
                            : call.painScore >= 5
                            ? "var(--color-amber)"
                            : "var(--color-green)",
                      }}
                    >
                      {call.painScore !== null ? `${call.painScore}/10` : "—"}
                    </span>
                  </td>
                  <td>
                    <FlagBadge flagStatus={call.flagStatus} />
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>
                    {formatDateTime(call.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
  suffix = "",
}: {
  label: string;
  value: number;
  color: string;
  suffix?: string;
}) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        padding: "20px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: "10px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "2rem",
          fontWeight: "600",
          color,
          lineHeight: 1,
        }}
      >
        {value}
        {suffix && <span style={{ fontSize: "1rem", opacity: 0.7 }}>{suffix}</span>}
      </p>
    </div>
  );
}
