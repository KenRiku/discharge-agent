import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const patient = await prisma.patient.findUnique({
    where: { id: params.id },
    include: {
      enrolledBy: { select: { name: true, role: true } },
      callSchedules: {
        orderBy: { scheduledDay: "asc" },
        include: { call: true },
      },
      calls: {
        orderBy: { startedAt: "desc" },
        include: { escalation: true },
      },
      escalations: {
        orderBy: { createdAt: "desc" },
        include: {
          resolvedBy: { select: { name: true } },
        },
      },
    },
  });

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  return NextResponse.json({ patient });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const patient = await prisma.patient.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json({ patient });
}
