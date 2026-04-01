"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, getProcedureIcon } from "@/lib/utils";
import { FlagBadge, PatientStatusBadge } from "@/components/status-badge";

const STATUS_FILTERS = ["ALL", "ENROLLED", "IN_PROGRESS", "COMPLETED", "ESCALATED"];

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchPatients = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter !== "ALL") params.set("status", statusFilter);

    fetch(`/api/patients?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setPatients(d.patients || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPatients();
  }, [search, statusFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div style={{ padding: "32px 36px", fontFamily: "var(--font-body)" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "28px",
        }}
      >
        <div>
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
            Patient Management
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.8rem",
              color: "var(--text-primary)",
            }}
          >
            Patients
          </h1>
        </div>
        <Link href="/patients/new" className="btn-primary">
          + Enroll Patient
        </Link>
      </div>

      {/* Search + filters */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: "1", minWidth: "200px", maxWidth: "360px" }}>
          <span
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              fontSize: "0.85rem",
            }}
          >
            ⌕
          </span>
          <input
            type="text"
            placeholder="Search by name, procedure, phone..."
            value={search}
            onChange={handleSearch}
            className="input-field"
            style={{ paddingLeft: "32px" }}
          />
        </div>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                border: "1px solid",
                borderColor: statusFilter === s ? "var(--color-green)" : "var(--border-color)",
                background: statusFilter === s ? "rgba(0,200,150,0.1)" : "transparent",
                color: statusFilter === s ? "var(--color-green)" : "var(--text-muted)",
                fontSize: "0.78rem",
                fontFamily: "var(--font-mono)",
                fontWeight: "500",
                cursor: "pointer",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                transition: "all 0.15s",
              }}
            >
              {s === "IN_PROGRESS" ? "In Progress" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ padding: "20px" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton" style={{ height: "52px", marginBottom: "8px" }} />
            ))}
          </div>
        ) : patients.length === 0 ? (
          <EmptyState search={search} />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Procedure</th>
                <th>Discharged</th>
                <th>Status</th>
                <th>Calls</th>
                <th>Escalations</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient: any) => (
                <PatientRow key={patient.id} patient={patient} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && (
        <p
          style={{
            marginTop: "12px",
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            color: "var(--text-muted)",
          }}
        >
          {patients.length} patient{patients.length !== 1 ? "s" : ""}
          {statusFilter !== "ALL" ? ` with status ${statusFilter}` : ""}
          {search ? ` matching "${search}"` : ""}
        </p>
      )}
    </div>
  );
}

function PatientRow({ patient }: { patient: any }) {
  const unresolvedEscalations = patient.escalations?.length || 0;

  return (
    <tr>
      <td>
        <Link href={`/patients/${patient.id}`} style={{ textDecoration: "none" }}>
          <div>
            <p style={{ color: "var(--text-primary)", fontWeight: "500", fontSize: "0.875rem" }}>
              {patient.name}
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>
              {patient.phone}
            </p>
          </div>
        </Link>
      </td>
      <td>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span>{getProcedureIcon(patient.procedureType)}</span>
          <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            {patient.procedureType}
          </span>
        </span>
      </td>
      <td>
        <span style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
          {formatDate(patient.dischargeDate)}
        </span>
      </td>
      <td>
        <PatientStatusBadge status={patient.status} />
      </td>
      <td>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          {patient._count?.calls || 0} / 3
        </span>
      </td>
      <td>
        {unresolvedEscalations > 0 ? (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              color: "var(--color-red)",
              fontWeight: "600",
            }}
          >
            ⚑ {unresolvedEscalations} open
          </span>
        ) : (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            —
          </span>
        )}
      </td>
      <td>
        <Link
          href={`/patients/${patient.id}`}
          style={{
            color: "var(--color-green)",
            fontSize: "0.8rem",
            textDecoration: "none",
            fontWeight: "500",
          }}
        >
          View →
        </Link>
      </td>
    </tr>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <div style={{ padding: "64px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: "16px", opacity: 0.5 }}>⬡</div>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", fontWeight: "500", marginBottom: "8px" }}>
        {search ? `No patients found for "${search}"` : "No patients enrolled yet"}
      </p>
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "20px" }}>
        {search ? "Try a different search term" : "Enroll your first discharged patient to get started"}
      </p>
      {!search && (
        <Link href="/patients/new" className="btn-primary" style={{ display: "inline-flex" }}>
          + Enroll First Patient
        </Link>
      )}
    </div>
  );
}
