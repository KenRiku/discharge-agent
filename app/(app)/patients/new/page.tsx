"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewPatientPage() {
  const router = useRouter();
  const [procedures, setProcedures] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    dob: "",
    phone: "",
    procedureType: "",
    dischargeDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    fetch("/api/procedures")
      .then((r) => r.json())
      .then((d) => setProcedures(d.procedures || []));
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Patient name is required";
    if (!form.dob) errs.dob = "Date of birth is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!form.procedureType) errs.procedureType = "Procedure type is required";
    if (!form.dischargeDate) errs.dischargeDate = "Discharge date is required";
    return errs;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ submit: data.error || "Failed to create patient" });
        setLoading(false);
        return;
      }

      setSuccessMsg("Patient enrolled successfully!");
      setTimeout(() => router.push("/patients"), 1200);
    } catch {
      setErrors({ submit: "Something went wrong" });
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "32px 36px", fontFamily: "var(--font-body)", maxWidth: "680px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <Link
          href="/patients"
          style={{ color: "var(--text-muted)", fontSize: "0.8rem", textDecoration: "none" }}
        >
          ← Back to Patients
        </Link>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "var(--color-green)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: "6px",
            marginTop: "16px",
          }}
        >
          Patient Enrollment
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.8rem",
            color: "var(--text-primary)",
          }}
        >
          Enroll New Patient
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "6px" }}>
          Follow-up calls will be automatically scheduled for Day 1, 3, and 7 post-discharge.
        </p>
      </div>

      {/* Success message */}
      {successMsg && (
        <div
          style={{
            background: "rgba(0,200,150,0.1)",
            border: "1px solid rgba(0,200,150,0.3)",
            borderRadius: "8px",
            padding: "14px 18px",
            marginBottom: "20px",
            color: "var(--color-green)",
            fontSize: "0.875rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          ✓ {successMsg}
        </div>
      )}

      {errors.submit && (
        <div
          style={{
            background: "rgba(255,51,102,0.1)",
            border: "1px solid rgba(255,51,102,0.3)",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "20px",
            color: "var(--color-red)",
            fontSize: "0.875rem",
          }}
        >
          ⚠ {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
            borderRadius: "10px",
            padding: "28px",
            marginBottom: "16px",
          }}
        >
          <h2
            style={{
              fontSize: "0.875rem",
              fontWeight: "600",
              color: "var(--text-primary)",
              marginBottom: "20px",
              paddingBottom: "12px",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            Patient Information
          </h2>

          <div style={{ display: "grid", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <FormField
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Margaret Thompson"
                error={errors.name}
                required
              />
              <FormField
                label="Date of Birth"
                name="dob"
                type="date"
                value={form.dob}
                onChange={handleChange}
                error={errors.dob}
                required
              />
            </div>

            <FormField
              label="Phone Number"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="555-0100"
              error={errors.phone}
              required
            />
          </div>
        </div>

        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
            borderRadius: "10px",
            padding: "28px",
            marginBottom: "16px",
          }}
        >
          <h2
            style={{
              fontSize: "0.875rem",
              fontWeight: "600",
              color: "var(--text-primary)",
              marginBottom: "20px",
              paddingBottom: "12px",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            Procedure & Discharge
          </h2>

          <div style={{ display: "grid", gap: "16px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  marginBottom: "6px",
                  fontWeight: "500",
                }}
              >
                Procedure Type <span style={{ color: "var(--color-red)" }}>*</span>
              </label>
              <select
                name="procedureType"
                value={form.procedureType}
                onChange={handleChange}
                className="input-field"
                style={{
                  borderColor: errors.procedureType ? "rgba(255,51,102,0.5)" : undefined,
                }}
              >
                <option value="">Select procedure...</option>
                {procedures.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {errors.procedureType && (
                <p style={{ color: "var(--color-red)", fontSize: "0.75rem", marginTop: "4px" }}>
                  {errors.procedureType}
                </p>
              )}
            </div>

            <FormField
              label="Discharge Date"
              name="dischargeDate"
              type="date"
              value={form.dischargeDate}
              onChange={handleChange}
              error={errors.dischargeDate}
              required
            />

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  marginBottom: "6px",
                  fontWeight: "500",
                }}
              >
                Clinical Notes (optional)
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Any relevant notes for the care team..."
                className="input-field"
                rows={3}
                style={{ resize: "vertical" }}
              />
            </div>
          </div>
        </div>

        {/* Schedule preview */}
        {form.dischargeDate && (
          <div
            style={{
              background: "rgba(0,200,150,0.04)",
              border: "1px solid rgba(0,200,150,0.2)",
              borderRadius: "10px",
              padding: "16px 20px",
              marginBottom: "20px",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                color: "var(--color-green)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Auto-scheduled follow-up calls
            </p>
            <div style={{ display: "flex", gap: "16px" }}>
              {[1, 3, 7].map((day) => {
                const date = new Date(form.dischargeDate);
                date.setDate(date.getDate() + day);
                return (
                  <div key={day} style={{ flex: 1 }}>
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.7rem",
                        color: "var(--text-muted)",
                        marginBottom: "2px",
                      }}
                    >
                      Day {day}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-primary)", fontWeight: "500" }}>
                      {date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ flex: 1, padding: "11px" }}
          >
            {loading ? "Enrolling..." : "Enroll Patient →"}
          </button>
          <Link href="/patients" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "0.75rem",
          color: "var(--text-secondary)",
          marginBottom: "6px",
          fontWeight: "500",
        }}
      >
        {label} {required && <span style={{ color: "var(--color-red)" }}>*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-field"
        style={{
          borderColor: error ? "rgba(255,51,102,0.5)" : undefined,
        }}
      />
      {error && (
        <p style={{ color: "var(--color-red)", fontSize: "0.75rem", marginTop: "4px" }}>
          {error}
        </p>
      )}
    </div>
  );
}
