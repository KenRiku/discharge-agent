import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    totalPatients,
    totalCalls,
    openEscalations,
    completedCalls,
    patientsByStatus,
    callsByDay,
    escalationsBySeverity,
    avgPainByProcedure,
    recentCalls,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.call.count(),
    prisma.escalation.count({ where: { resolvedAt: null } }),
    prisma.call.count({ where: { completedAt: { not: null } } }),
    prisma.patient.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    // Calls grouped by day (last 14 days)
    prisma.call.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      },
      select: { createdAt: true, flagStatus: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.escalation.groupBy({
      by: ["severity"],
      _count: { severity: true },
    }),
    prisma.call.groupBy({
      by: ["patientId"],
      _avg: { painScore: true },
      where: { painScore: { not: null } },
    }),
    prisma.call.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        patient: { select: { name: true, procedureType: true } },
      },
    }),
  ]);

  // Process calls by day
  const callsByDayMap: Record<string, { calls: number; escalations: number }> = {};
  for (let i = 13; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = date.toISOString().split("T")[0];
    callsByDayMap[key] = { calls: 0, escalations: 0 };
  }

  callsByDay.forEach((call) => {
    const key = new Date(call.createdAt).toISOString().split("T")[0];
    if (callsByDayMap[key]) {
      callsByDayMap[key].calls++;
      if (call.flagStatus !== "NONE") callsByDayMap[key].escalations++;
    }
  });

  const callsTimeline = Object.entries(callsByDayMap).map(([date, data]) => ({
    date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    calls: data.calls,
    escalations: data.escalations,
  }));

  // Procedure breakdown
  const procedureBreakdown = await prisma.patient.groupBy({
    by: ["procedureType"],
    _count: { procedureType: true },
  });

  const escalationRate = totalCalls > 0 ? Math.round((openEscalations / totalCalls) * 100) : 0;
  const completionRate = totalPatients > 0
    ? Math.round((patientsByStatus.find(s => s.status === "COMPLETED")?._count.status || 0) / totalPatients * 100)
    : 0;

  return NextResponse.json({
    summary: {
      totalPatients,
      totalCalls,
      openEscalations,
      completedCalls,
      escalationRate,
      completionRate,
    },
    patientsByStatus: patientsByStatus.map(s => ({
      status: s.status,
      count: s._count.status,
    })),
    callsTimeline,
    escalationsBySeverity: escalationsBySeverity.map(e => ({
      severity: e.severity,
      count: e._count.severity,
    })),
    procedureBreakdown: procedureBreakdown.map(p => ({
      procedure: p.procedureType,
      count: p._count.procedureType,
    })),
    recentCalls: recentCalls.map(c => ({
      id: c.id,
      patientName: c.patient.name,
      procedureType: c.patient.procedureType,
      flagStatus: c.flagStatus,
      painScore: c.painScore,
      createdAt: c.createdAt,
    })),
  });
}
