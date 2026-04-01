import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const resolved = searchParams.get("resolved") === "true";

  const escalations = await prisma.escalation.findMany({
    where: resolved ? { resolvedAt: { not: null } } : { resolvedAt: null },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          phone: true,
          procedureType: true,
          dischargeDate: true,
        },
      },
      call: {
        select: {
          id: true,
          painScore: true,
          medAdherence: true,
          flagReason: true,
          summary: true,
          completedAt: true,
        },
      },
      resolvedBy: { select: { name: true } },
    },
    orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ escalations });
}
