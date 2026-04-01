import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatRelativeDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(d);
}

export function getDayFromDischarge(dischargeDate: Date | string, scheduledDate: Date | string): number {
  const discharge = new Date(dischargeDate);
  const scheduled = new Date(scheduledDate);
  return Math.round((scheduled.getTime() - discharge.getTime()) / (1000 * 60 * 60 * 24));
}

export function getFlagColor(flagStatus: string) {
  switch (flagStatus) {
    case "RED": return { text: "text-alert-red", bg: "bg-alert-red/10", border: "border-alert-red/30" };
    case "YELLOW": return { text: "text-alert-amber", bg: "bg-alert-amber/10", border: "border-alert-amber/30" };
    default: return { text: "text-clinical-green", bg: "bg-clinical-green/10", border: "border-clinical-green/30" };
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case "ESCALATED": return { text: "text-alert-red", bg: "bg-alert-red/10", border: "border-alert-red/30" };
    case "IN_PROGRESS": return { text: "text-alert-amber", bg: "bg-alert-amber/10", border: "border-alert-amber/30" };
    case "COMPLETED": return { text: "text-clinical-green", bg: "bg-clinical-green/10", border: "border-clinical-green/30" };
    case "ENROLLED": return { text: "text-sky-400", bg: "bg-sky-400/10", border: "border-sky-400/30" };
    default: return { text: "text-text-secondary", bg: "bg-navy-700", border: "border-navy-600" };
  }
}

export function getPainScoreColor(score: number | null): string {
  if (score === null) return "text-text-muted";
  if (score >= 8) return "text-alert-red";
  if (score >= 5) return "text-alert-amber";
  return "text-clinical-green";
}

export function getProcedureIcon(procedureType: string): string {
  const icons: Record<string, string> = {
    "Knee Replacement": "🦵",
    "Hip Replacement": "🦴",
    "Cardiac Surgery": "❤️",
    "Appendectomy": "🫀",
  };
  return icons[procedureType] || "🏥";
}
