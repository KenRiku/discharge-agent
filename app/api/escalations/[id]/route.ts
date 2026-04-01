import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (body.resolve) {
    const escalation = await prisma.escalation.update({
      where: { id: params.id },
      data: {
        resolvedAt: new Date(),
        resolvedById: (session.user as any).id,
      },
    });

    // Check if all escalations for this patient are resolved
    const unresolvedCount = await prisma.escalation.count({
      where: {
        patientId: escalation.patientId,
        resolvedAt: null,
      },
    });

    if (unresolvedCount === 0) {
      await prisma.patient.update({
        where: { id: escalation.patientId },
        data: { status: "IN_PROGRESS" },
      });
    }

    return NextResponse.json({ escalation });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
