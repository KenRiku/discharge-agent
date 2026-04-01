"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate, getProcedureIcon } from "@/lib/utils";

interface Message {
  role: "agent" | "patient";
  content: string;
}

function SimulatorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams.get("patientId");
  const scheduleId = searchParams.get("scheduleId");

  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [callState, setCallState] = useState<"idle" | "active" | "complete">("idle");
  const [analysis, setAnalysis] = useState<any>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/patients")
      .then((r) => r.json())
      .then((d) => {
        setPatients(d.patients || []);
        if (patientId) {
          const found = d.patients?.find((p: any) => p.id === patientId);
          if (found) setSelectedPatient(found);
        }
      });
  }, [patientId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const startCall = async () => {
    if (!selectedPatient) return;
    setCallState("active");
    setLoading(true);
    setTranscript([]);
    setAnalysis(null);

    const res = await fetch("/api/simulator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: selectedPatient.id,
        transcript: [],
        patientMessage: null,
        scheduleId,
      }),
    });
    const data = await res.json();
    setTranscript([{ role: "agent", content: data.agentResponse }]);
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || callState !== "active") return;

    const userMsg = input.trim();
    setInput("");
    const newTranscript = [...transcript, { role: "patient" as const, content: userMsg }];
    setTranscript(newTranscript);
    setLoading(true);

    const res = await fetch("/api/simulator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: selectedPatient.id,
        transcript,
        patientMessage: userMsg,
        scheduleId,
      }),
    });

    const data = await res.json();
    setTranscript([...newTranscript, { role: "agent", content: data.agentResponse }]);

    if (data.isComplete) {
      setCallState("complete");
      setAnalysis(data.analysis);
      setCallId(data.callId);
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetCall = () => {
    setCallState("idle");
    setTranscript([]);
    setAnalysis(null);
    setCallId(null);
    setInput("");
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "var(--font-body)" }}>
      {/* Header bar */}
      <div
        style={{
          padding: "18px 28px",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          background: "var(--bg-surface)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link href="/patients" style={{ color: "var(--text-muted)", fontSize: "0.8rem", textDecoration: "none" }}>
              ←
            </Link>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                color: "var(--color-green)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              AfterCall Simulator
            </p>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--text-primary)", marginTop: "2px" }}>
            AI Call Simulator
          </h1>
        </div>

        <div style={{ display: "flex", align: "center", gap: "12px" }}>
          {callState === "active" && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "var(--color-red)",
                  display: "inline-block",
                  animation: "alertPulse 1.5s ease-in-out infinite",
                }}
              />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--color-red)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Live
              </span>
            </div>
          )}
          {callState === "complete" && (
            <button onClick={resetCall} className="btn-secondary" style={{ fontSize: "0.8rem" }}>
              ↺ New Call
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "300px 1fr", overflow: "hidden" }}>
        {/* Left sidebar - Patient selection */}
        <div
          style={{
            borderRight: "1px solid var(--border-color)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "var(--bg-surface)",
          }}
        >
          <div style={{ padding: "16px", borderBottom: "1px solid var(--border-subtle)" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "10px" }}>
              Select Patient
            </p>
            <select
              className="input-field"
              value={selectedPatient?.id || ""}
              onChange={(e) => {
                const p = patients.find((pt) => pt.id === e.target.value);
                setSelectedPatient(p || null);
                resetCall();
              }}
              disabled={callState === "active"}
            >
              <option value="">Choose patient...</option>
              {patients.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {selectedPatient && (
            <div style={{ padding: "16px", flex: 1, overflow: "auto" }}>
              {/* Patient info */}
              <div
                style={{
                  background: "var(--bg-surface-2)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "14px",
                  marginBottom: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "1.1rem" }}>{getProcedureIcon(selectedPatient.procedureType)}</span>
                  <div>
                    <p style={{ color: "var(--text-primary)", fontWeight: "600", fontSize: "0.875rem" }}>
                      {selectedPatient.name}
                    </p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                      {selectedPatient.procedureType}
                    </p>
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                  <p>Discharged: {formatDate(selectedPatient.dischargeDate)}</p>
                  <p>Phone: {selectedPatient.phone}</p>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
                  How it works
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { num: "1", text: "Click Start Call to begin the AI check-in" },
                    { num: "2", text: "Respond as the patient to AI questions" },
                    { num: "3", text: "Report symptoms honestly to test escalation" },
                    { num: "4", text: "Call completes automatically after key questions" },
                  ].map((step) => (
                    <div key={step.num} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          background: "rgba(0,200,150,0.1)",
                          border: "1px solid rgba(0,200,150,0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.6rem",
                          color: "var(--color-green)",
                          flexShrink: 0,
                          marginTop: "1px",
                        }}
                      >
                        {step.num}
                      </span>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
                        {step.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Red flag test scenarios */}
              <div style={{ marginTop: "20px" }}>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
                  Test Scenarios
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <ScenarioChip
                    label="Report pain 8+/10"
                    color="var(--color-red)"
                    onClick={() => setInput("My pain is about a 9 out of 10, it's really bad")}
                    disabled={callState !== "active"}
                  />
                  <ScenarioChip
                    label="Stopped medications"
                    color="var(--color-amber)"
                    onClick={() => setInput("No, I stopped taking my medications because they made me feel sick")}
                    disabled={callState !== "active"}
                  />
                  <ScenarioChip
                    label="Chest tightness"
                    color="var(--color-red)"
                    onClick={() => setInput("Yes, I've been having chest tightness and shortness of breath")}
                    disabled={callState !== "active"}
                  />
                  <ScenarioChip
                    label="Recovering well"
                    color="var(--color-green)"
                    onClick={() => setInput("I'm feeling much better, pain is about a 3 and I'm taking all my medications")}
                    disabled={callState !== "active"}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Chat interface */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Chat messages */}
          <div
            style={{
              flex: 1,
              overflow: "auto",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {callState === "idle" && !transcript.length && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: "16px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    background: "rgba(0,200,150,0.08)",
                    border: "2px solid rgba(0,200,150,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                  }}
                >
                  ◎
                </div>
                <div>
                  <p style={{ color: "var(--text-primary)", fontWeight: "600", fontSize: "1rem", marginBottom: "6px" }}>
                    Ready to Simulate
                  </p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                    {selectedPatient
                      ? "Click Start Call to begin the AI check-in flow"
                      : "Select a patient on the left, then start the call"}
                  </p>
                </div>
                {selectedPatient && callState === "idle" && (
                  <button
                    onClick={startCall}
                    className="btn-primary"
                    style={{ padding: "12px 28px", fontSize: "0.95rem" }}
                  >
                    ◎ Start Call
                  </button>
                )}
              </div>
            )}

            {transcript.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "agent" ? "flex-start" : "flex-end",
                  animation: "slideUp 0.3s ease-out",
                }}
              >
                {msg.role === "agent" && (
                  <div style={{ marginRight: "8px", flexShrink: 0 }}>
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "8px",
                        background: "rgba(0,200,150,0.1)",
                        border: "1px solid rgba(0,200,150,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.8rem",
                        color: "var(--color-green)",
                        fontWeight: "700",
                      }}
                    >
                      ⊕
                    </div>
                  </div>
                )}
                <div className={msg.role === "agent" ? "chat-agent" : "chat-patient"}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                    {msg.role === "agent" ? "AfterCall AI" : "Patient (you)"}
                  </p>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", gap: "8px" }}>
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "8px",
                    background: "rgba(0,200,150,0.1)",
                    border: "1px solid rgba(0,200,150,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    color: "var(--color-green)",
                    flexShrink: 0,
                  }}
                >
                  ⊕
                </div>
                <div className="chat-agent" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Analyzing
                  </span>
                  <span style={{ display: "flex", gap: "3px" }}>
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        style={{
                          width: "4px",
                          height: "4px",
                          borderRadius: "50%",
                          background: "var(--color-green)",
                          display: "inline-block",
                          animation: `blink 1.2s step-end infinite ${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}

            {/* Call complete analysis */}
            {callState === "complete" && analysis && (
              <div
                style={{
                  border: `1px solid ${analysis.flagStatus === "RED" ? "rgba(255,51,102,0.4)" : analysis.flagStatus === "YELLOW" ? "rgba(245,158,11,0.4)" : "rgba(0,200,150,0.4)"}`,
                  borderRadius: "10px",
                  overflow: "hidden",
                  animation: "slideUp 0.4s ease-out",
                }}
              >
                <div
                  style={{
                    padding: "14px 18px",
                    background: analysis.flagStatus === "RED"
                      ? "rgba(255,51,102,0.1)"
                      : analysis.flagStatus === "YELLOW"
                      ? "rgba(245,158,11,0.1)"
                      : "rgba(0,200,150,0.1)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: analysis.flagStatus === "RED" ? "var(--color-red)" : analysis.flagStatus === "YELLOW" ? "var(--color-amber)" : "var(--color-green)", marginBottom: "4px" }}>
                    {analysis.flagStatus === "RED" ? "⚑ Escalation Required" : analysis.flagStatus === "YELLOW" ? "△ Watch" : "✓ Call Complete"}
                  </p>
                  <p style={{ fontWeight: "600", fontSize: "0.9rem", color: "var(--text-primary)" }}>
                    {analysis.summary}
                  </p>
                </div>
                <div style={{ padding: "16px 18px", background: "var(--bg-surface)", display: "flex", gap: "20px", flexWrap: "wrap" }}>
                  <MetricPill label="Pain Score" value={analysis.painScore !== null ? `${analysis.painScore}/10` : "—"} color={getPainColor(analysis.painScore)} />
                  <MetricPill label="Medications" value={analysis.medAdherence === null ? "—" : analysis.medAdherence ? "Compliant" : "Non-compliant"} color={analysis.medAdherence ? "var(--color-green)" : "var(--color-red)"} />
                  {analysis.flagReason && <MetricPill label="Flag Reason" value={analysis.flagReason} color="var(--color-red)" />}
                </div>
                {callId && (
                  <div style={{ padding: "12px 18px", background: "var(--bg-surface-2)", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: "10px" }}>
                    <Link href={`/patients/${selectedPatient?.id}`} className="btn-primary" style={{ fontSize: "0.8rem", padding: "7px 14px" }}>
                      View Patient Record →
                    </Link>
                    {(analysis.flagStatus === "RED" || analysis.flagStatus === "YELLOW") && (
                      <Link href="/escalations" className="btn-danger" style={{ fontSize: "0.8rem", padding: "7px 14px" }}>
                        ⚑ View Escalation
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input area */}
          {callState === "active" && (
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid var(--border-color)",
                background: "var(--bg-surface)",
                flexShrink: 0,
              }}
            >
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
                Respond as patient
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your response as the patient... (Enter to send)"
                  className="input-field"
                  rows={2}
                  style={{ flex: 1, resize: "none" }}
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="btn-primary"
                  style={{ alignSelf: "flex-end", padding: "10px 20px" }}
                >
                  Send →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScenarioChip({ label, color, onClick, disabled }: { label: string; color: string; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "6px 10px",
        borderRadius: "6px",
        border: `1px solid ${color}30`,
        background: `${color}10`,
        color: disabled ? "var(--text-muted)" : color,
        fontSize: "0.72rem",
        cursor: disabled ? "not-allowed" : "pointer",
        textAlign: "left",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.15s",
        fontFamily: "var(--font-body)",
      }}
    >
      {label}
    </button>
  );
}

function MetricPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>
        {label}
      </p>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: "600", color }}>
        {value}
      </p>
    </div>
  );
}

function getPainColor(score: number | null): string {
  if (score === null) return "var(--text-muted)";
  if (score >= 8) return "var(--color-red)";
  if (score >= 5) return "var(--color-amber)";
  return "var(--color-green)";
}

export default function SimulatorPage() {
  return (
    <Suspense fallback={<div style={{ padding: "32px", color: "var(--text-muted)" }}>Loading simulator...</div>}>
      <SimulatorContent />
    </Suspense>
  );
}
