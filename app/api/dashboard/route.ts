import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalPatients,
    callsToday,
    openEscalations,
    escalatedPatients,
    recentEscalations,
    pendingCalls,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.call.count({
      where: { createdAt: { gte: today } },
    }),
    prisma.escalation.count({ where: { resolvedAt: null } }),
    prisma.patient.count({ where: { status: "ESCALATED" } }),
    prisma.escalation.findMany({
      where: { resolvedAt: null },
      take: 5,
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
      include: {
        patient: { select: { id: true, name: true, procedureType: true, phone: true } },
        call: { select: { painScore: true, flagReason: true, completedAt: true } },
      },
    }),
    prisma.callSchedule.count({
      where: {
        status: "PENDING",
        scheduledDate: { lte: today },
      },
    }),
  ]);

  return NextResponse.json({
    stats: {
      totalPatients,
      callsToday,
      openEscalations,
      escalatedPatients,
      pendingCalls,
    },
    recentEscalations,
  });
}
