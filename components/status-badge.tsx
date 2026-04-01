import { getStatusColor, getFlagColor } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  type?: "patient" | "flag" | "schedule" | "role";
}

export function StatusBadge({ status, type = "patient" }: StatusBadgeProps) {
  let colors;
  let label = status;

  if (type === "flag") {
    colors = getFlagColor(status);
    label = status === "NONE" ? "Clear" : status;
  } else if (type === "schedule") {
    switch (status) {
      case "COMPLETED":
        colors = { text: "text-clinical-green", bg: "bg-clinical-green/10", border: "border-clinical-green/30" };
        break;
      case "MISSED":
        colors = { text: "text-alert-red", bg: "bg-alert-red/10", border: "border-alert-red/30" };
        break;
      default:
        colors = { text: "text-sky-400", bg: "bg-sky-400/10", border: "border-sky-400/30" };
        label = "Pending";
    }
  } else if (type === "role") {
    colors = { text: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/30" };
  } else {
    colors = getStatusColor(status);
    label = status.replace("_", " ");
  }

  return (
    <span
      className="badge"
      style={{
        color: `var(--${colors.text.replace("text-", "").replace("-", "").replace("400", "")})` || undefined,
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: "currentColor",
        }}
      />
      <span
        className={`${colors.text} badge`}
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
        }}
      >
        {label}
      </span>
    </span>
  );
}

export function FlagBadge({ flagStatus }: { flagStatus: string }) {
  const configs = {
    RED: { label: "RED FLAG", textColor: "#ff3366", bgColor: "rgba(255,51,102,0.1)", borderColor: "rgba(255,51,102,0.3)" },
    YELLOW: { label: "WATCH", textColor: "#f59e0b", bgColor: "rgba(245,158,11,0.1)", borderColor: "rgba(245,158,11,0.3)" },
    NONE: { label: "Clear", textColor: "#00c896", bgColor: "rgba(0,200,150,0.08)", borderColor: "rgba(0,200,150,0.2)" },
  };

  const config = configs[flagStatus as keyof typeof configs] || configs.NONE;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "2px 8px",
        borderRadius: "4px",
        fontFamily: "var(--font-mono)",
        fontSize: "0.65rem",
        fontWeight: "600",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: config.textColor,
        background: config.bgColor,
        border: `1px solid ${config.borderColor}`,
      }}
    >
      {flagStatus === "RED" && "⚑ "}
      {flagStatus === "YELLOW" && "△ "}
      {flagStatus === "NONE" && "✓ "}
      {config.label}
    </span>
  );
}

export function PatientStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; color: string; bg: string; border: string }> = {
    ENROLLED: { label: "Enrolled", color: "#38bdf8", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.2)" },
    IN_PROGRESS: { label: "In Progress", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
    COMPLETED: { label: "Completed", color: "#00c896", bg: "rgba(0,200,150,0.08)", border: "rgba(0,200,150,0.2)" },
    ESCALATED: { label: "Escalated", color: "#ff3366", bg: "rgba(255,51,102,0.08)", border: "rgba(255,51,102,0.2)" },
  };

  const config = configs[status] || configs.ENROLLED;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 8px",
        borderRadius: "4px",
        fontFamily: "var(--font-mono)",
        fontSize: "0.65rem",
        fontWeight: "500",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.border}`,
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: config.color,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {config.label}
    </span>
  );
}
